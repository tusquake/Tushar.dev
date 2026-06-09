const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
            return done(new Error('No email address returned from Google profile'), null);
        }

        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: email }
            ]
        });

        if (user) {
            let updated = false;
            if (!user.googleId) {
                user.googleId = profile.id;
                updated = true;
            }
            if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
                updated = true;
            }
            if (updated) await user.save();
            return done(null, user);
        }

        user = await User.create({
            name: profile.displayName || profile.name?.givenName || 'Google User',
            email: email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: 'USER'
        });

        // Send welcome email in the background
        sendWelcomeEmail({ email: user.email, name: user.name })
            .catch(err => console.error('Error sending welcome email on Google OAuth signup:', err));

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// GitHub Strategy Configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = (profile.emails?.[0]?.value || `${profile.username}@github.com`).toLowerCase();

        let user = await User.findOne({
            $or: [
                { githubId: profile.id },
                { email: email }
            ]
        });

        if (user) {
            let updated = false;
            if (!user.githubId) {
                user.githubId = profile.id;
                updated = true;
            }
            if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
                updated = true;
            }
            if (updated) await user.save();
            return done(null, user);
        }

        user = await User.create({
            name: profile.displayName || profile.username || 'GitHub User',
            email: email,
            githubId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: 'USER'
        });

        // Send welcome email in the background
        sendWelcomeEmail({ email: user.email, name: user.name })
            .catch(err => console.error('Error sending welcome email on GitHub OAuth signup:', err));

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
