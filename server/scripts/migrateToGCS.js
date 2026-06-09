require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');
const { isGCSConfigured, uploadToGCS } = require('../utils/gcsService');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const projectsDir = path.join(__dirname, '..', '..', 'client', 'public', 'projects');

const runMigration = async () => {
    try {
        if (!isGCSConfigured) {
            console.error('Error: Google Cloud Storage is not initialized yet. Make sure your gcp-credentials-key.json is present in the workspace root.');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully.');

        // ==========================================
        // 1. Migrate User Uploads / Avatars
        // ==========================================
        let uploadsMigrationMap = {};
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            const imageFiles = files.filter(file => {
                const filePath = path.join(uploadsDir, file);
                return !fs.statSync(filePath).isDirectory();
            });

            if (imageFiles.length > 0) {
                console.log(`Found ${imageFiles.length} local file(s) in server/uploads. Migrating uploads...`);
                for (const file of imageFiles) {
                    const filePath = path.join(uploadsDir, file);
                    console.log(`Uploading upload-avatar: ${file} to GCS...`);
                    try {
                        const gcsUrl = await uploadToGCS(filePath, file);
                        uploadsMigrationMap[file] = gcsUrl;
                    } catch (err) {
                        console.error(`Failed to upload upload-avatar ${file}:`, err.message);
                    }
                }
            }
        }

        // Update User Avatars in DB
        console.log('Scanning database users for local avatar paths...');
        const users = await User.find({ avatar: { $regex: /^\/uploads\// } });
        let updatedUsersCount = 0;
        for (const user of users) {
            const filename = user.avatar.replace(/^\/uploads\//, '');
            const gcsUrl = uploadsMigrationMap[filename];
            if (gcsUrl) {
                user.avatar = gcsUrl;
                await user.save();
                updatedUsersCount++;
            }
        }
        console.log(`Updated ${updatedUsersCount} user avatar DB records.`);

        // ==========================================
        // 2. Migrate Project Images
        // ==========================================
        let projectsMigrationMap = {};
        if (fs.existsSync(projectsDir)) {
            const files = fs.readdirSync(projectsDir);
            const projectFiles = files.filter(file => {
                const filePath = path.join(projectsDir, file);
                return !fs.statSync(filePath).isDirectory();
            });

            if (projectFiles.length > 0) {
                console.log(`Found ${projectFiles.length} project static image(s) in client/public/projects. Migrating project images...`);
                for (const file of projectFiles) {
                    const filePath = path.join(projectsDir, file);
                    // Upload into a virtual folder inside the GCS bucket: projects/filename.png
                    const gcsPath = `projects/${file}`;
                    console.log(`Uploading project-image: ${gcsPath} to GCS...`);
                    try {
                        const gcsUrl = await uploadToGCS(filePath, gcsPath);
                        projectsMigrationMap[`/projects/${file}`] = gcsUrl;
                    } catch (err) {
                        console.error(`Failed to upload project image ${file}:`, err.message);
                    }
                }
            }
        }

        // Update Project Images in DB
        console.log('Scanning database projects for local image paths...');
        const dbProjects = await Project.find({ image: { $regex: /^\/projects\// } });
        let updatedProjectsCount = 0;
        for (const project of dbProjects) {
            const gcsUrl = projectsMigrationMap[project.image];
            if (gcsUrl) {
                console.log(`Updating image for project "${project.title}": ${project.image} -> ${gcsUrl}`);
                project.image = gcsUrl;
                await project.save();
                updatedProjectsCount++;
            }
        }
        console.log(`Updated ${updatedProjectsCount} project image DB records.`);

        // ==========================================
        // 3. Migrate Creator Profile Image
        // ==========================================
        const creatorImagePath = path.join(__dirname, '..', '..', 'client', 'public', 'tushar-profile.png');
        if (fs.existsSync(creatorImagePath)) {
            console.log('Found tushar-profile.png in client public. Migrating creator profile image...');
            try {
                const gcsUrl = await uploadToGCS(creatorImagePath, 'tushar-profile.png');
                console.log(`Uploaded creator profile image successfully! URL: ${gcsUrl}`);
            } catch (err) {
                console.error('Failed to upload creator profile image to GCS:', err.message);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration script failed with error:', err);
        process.exit(1);
    }
};

runMigration();
