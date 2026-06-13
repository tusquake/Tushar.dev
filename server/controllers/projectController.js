const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Public
const createProject = async (req, res) => {
    try {
        const { title, description, techStack, githubLink, liveDemo, image, featured, order } = req.body;

        const project = await Project.create({
            title,
            description,
            techStack,
            githubLink,
            liveDemo,
            image,
            featured,
            order
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public
const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Public
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
};

// @desc    Get all projects of a user
// @route   GET /api/projects/user/:userId
// @access  Public
const getUserProjects = async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project.find({ userId }).sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user projects'
        });
    }
};

// @desc    Import GitHub project
// @route   POST /api/projects/import-github
// @access  Private
const importGithubProject = async (req, res) => {
    try {
        const { githubLink } = req.body;
        if (!githubLink) {
            return res.status(400).json({
                success: false,
                message: 'GitHub link is required'
            });
        }

        const regex = /github\.com\/([^/]+)\/([^/]+)/;
        const match = githubLink.match(regex);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GitHub URL format'
            });
        }

        const owner = match[1];
        const repo = match[2].replace('.git', '').split('#')[0].split('?')[0];

        let title = repo.replace(/[-_]/g, ' ');
        title = title.replace(/\b\w/g, c => c.toUpperCase());
        let description = 'GitHub repository imported into CodeForge.';
        let techStack = ['GitHub'];

        try {
            const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: { 'User-Agent': 'CodeForge-App' }
            });

            if (repoRes.ok) {
                const repoData = await repoRes.json();
                if (repoData.name) {
                    title = repoData.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                }
                if (repoData.description) {
                    description = repoData.description;
                }

                const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
                    headers: { 'User-Agent': 'CodeForge-App' }
                });

                if (langRes.ok) {
                    const langData = await langRes.json();
                    const langs = Object.keys(langData);
                    if (langs.length > 0) {
                        techStack = langs.slice(0, 5);
                    }
                } else if (repoData.language) {
                    techStack = [repoData.language];
                }
            }
        } catch (apiErr) {
            console.warn('GitHub API fetch failed, falling back to parsed URL:', apiErr.message);
        }

        const project = await Project.create({
            userId: req.user._id,
            title,
            description: description.substring(0, 1000),
            techStack,
            githubLink,
            liveDemo: '',
            image: '',
            featured: false,
            order: 0
        });

        // Award XP
        const { awardXP } = require('../utils/gamification');
        const xpResult = await awardXP(req.user._id, 'PROJECT_ADDED');

        res.status(201).json({
            success: true,
            message: 'Project imported successfully! XP Gained.',
            data: project,
            xpResult
        });
    } catch (error) {
        console.error('Import GitHub project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import GitHub project',
            error: error.message
        });
    }
};

// @desc    Delete user's project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteUserProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.userId?.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this project'
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete user project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getUserProjects,
    importGithubProject,
    deleteUserProject
};
