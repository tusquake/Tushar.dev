const User = require('../models/User');
const DsaProgress = require('../models/DsaProgress');
const Learning = require('../models/Learning');
const InterviewLog = require('../models/InterviewLog');
const Resume = require('../models/Resume');

// XP values for different activities
const XP_VALUES = {
    DSA_SOLVED: 20,
    TOPIC_COMPLETED: 50,
    RESUME_BUILT: 30,
    PROJECT_ADDED: 30,
    INTERVIEW_COMPLETED: 100,
    PROFILE_CUSTOMIZED: 25,
    FIRST_LOGIN: 10,
    TASK_COMPLETED: 15
};

// Check and award achievements/badges
const checkAchievements = async (user) => {
    const unlocked = [];
    const currentAchievements = user.achievements || [];

    // 1. Welcome achievement (always give if not present)
    if (!currentAchievements.includes('welcome')) {
        unlocked.push('welcome');
    }

    // 2. Profile customizer (updated bio/title/socials)
    if (
        (user.bio !== 'Learning, coding, and building cool things.' || 
         user.location !== '' || 
         user.targetRole !== '' || 
         (user.skills && user.skills.length > 0)) && 
        !currentAchievements.includes('profile_customizer')
    ) {
        unlocked.push('profile_customizer');
    }

    // 3. DSA achievements
    const dsaProgress = await DsaProgress.findOne({ user: user._id });
    const dsaCount = dsaProgress ? dsaProgress.completedQuestions.length : 0;
    if (dsaCount >= 1 && !currentAchievements.includes('dsa_novice')) {
        unlocked.push('dsa_novice');
    }
    if (dsaCount >= 5 && !currentAchievements.includes('dsa_adept')) {
        unlocked.push('dsa_adept');
    }
    if (dsaCount >= 15 && !currentAchievements.includes('dsa_master')) {
        unlocked.push('dsa_master');
    }

    // 4. Learning roadmap achievements
    const completedTopics = await Learning.countDocuments({ user: user._id, status: 'completed' });
    if (completedTopics >= 3 && !currentAchievements.includes('topic_scholar')) {
        unlocked.push('topic_scholar');
    }

    // 5. Resume achievements
    const resume = await Resume.findOne({ user: user._id });
    if (resume && !currentAchievements.includes('resume_craftsman')) {
        unlocked.push('resume_craftsman');
    }

    // 6. Interview achievements
    const interviewCount = await InterviewLog.countDocuments({ user: user._id });
    if (interviewCount >= 1 && !currentAchievements.includes('interview_novice')) {
        unlocked.push('interview_novice');
    }
    if (interviewCount >= 3 && !currentAchievements.includes('interview_veteran')) {
        unlocked.push('interview_veteran');
    }

    return unlocked;
};

// Award XP to a user
const awardXP = async (userId, activityType, customAmount = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const xpToAdd = customAmount !== null ? customAmount : (XP_VALUES[activityType] || 10);
        user.xp = (user.xp || 0) + xpToAdd;

        // Level formula: 200 XP per level
        const newLevel = Math.floor(user.xp / 200) + 1;
        const leveledUp = newLevel > (user.level || 1);
        user.level = newLevel;

        // Check for new achievements
        const newAchievements = await checkAchievements(user);
        if (newAchievements.length > 0) {
            user.achievements = [...new Set([...(user.achievements || []), ...newAchievements])];
        }

        await user.save();

        return {
            success: true,
            xpAdded: xpToAdd,
            totalXp: user.xp,
            level: user.level,
            leveledUp,
            newAchievements
        };
    } catch (error) {
        console.error('Error awarding XP:', error);
        return null;
    }
};

module.exports = {
    awardXP,
    XP_VALUES,
    checkAchievements
};
