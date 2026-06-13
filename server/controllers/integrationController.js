// Using native Node global fetch

// @desc    Get user's GitHub integration profile
// @route   GET /api/integrations/github/:username
// @access  Public
const getGithubProfile = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'GitHub username is required'
            });
        }

        // Fetch GitHub User Profile
        const profileRes = await fetch(`https://api.github.com/users/${username}`, {
            headers: { 'User-Agent': 'CodeForge-App' }
        });

        if (!profileRes.ok) {
            return res.status(404).json({
                success: false,
                message: `GitHub user ${username} not found`
            });
        }

        const profile = await profileRes.json();

        // Fetch User Repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
            headers: { 'User-Agent': 'CodeForge-App' }
        });

        let repos = [];
        if (reposRes.ok) {
            repos = await reposRes.json();
        }

        const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
        const totalForks = repos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);

        // Language breakdown
        const languagesMap = {};
        repos.forEach(repo => {
            if (repo.language) {
                languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
            }
        });

        // Top 5 starred repositories
        const topRepos = repos
            .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
            .slice(0, 5)
            .map(r => ({
                name: r.name,
                description: r.description || '',
                stars: r.stargazers_count,
                forks: r.forks_count,
                url: r.html_url,
                language: r.language || ''
            }));

        // Fetch contribution calendar HTML to extract contributions
        let contributions = [];
        try {
            const contribRes = await fetch(`https://github.com/users/${username}/contributions`, {
                headers: { 'User-Agent': 'CodeForge-App' }
            });
            if (contribRes.ok) {
                const html = await contribRes.text();
                // Match data-date="..." and data-level="..." attributes
                const regex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g;
                let match;
                while ((match = regex.exec(html)) !== null) {
                    contributions.push({
                        date: match[1],
                        level: parseInt(match[2], 10)
                    });
                }
            }
        } catch (err) {
            console.error('Failed to parse GitHub contributions HTML:', err);
        }

        res.json({
            success: true,
            data: {
                avatar: profile.avatar_url,
                name: profile.name || profile.login,
                login: profile.login,
                bio: profile.bio || '',
                publicRepos: profile.public_repos,
                followers: profile.followers,
                following: profile.following,
                totalStars,
                totalForks,
                languages: languagesMap,
                topRepos,
                contributions
            }
        });
    } catch (error) {
        console.error('GitHub integration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch GitHub profile data',
            error: error.message
        });
    }
};

// @desc    Get user's LeetCode integration profile
// @route   GET /api/integrations/leetcode/:username
// @access  Public
const getLeetcodeProfile = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'LeetCode username is required'
            });
        }

        const query = `
            query leetcodeProfile($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    username
                    profile {
                        realName
                        ranking
                        userAvatar
                        reputation
                    }
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
                recentSubmissionList(username: $username, limit: 15) {
                    title
                    titleSlug
                    statusDisplay
                    lang
                    timestamp
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: `LeetCode API responded with status ${response.status}`
            });
        }

        const result = await response.json();
        if (result.errors) {
            return res.status(400).json({
                success: false,
                message: result.errors[0]?.message || 'Error from LeetCode API'
            });
        }

        const data = result.data;
        if (!data.matchedUser) {
            return res.status(404).json({
                success: false,
                message: `LeetCode user ${username} not found`
            });
        }

        const allQuestions = data.allQuestionsCount || [];
        const matchedUser = data.matchedUser;
        const acSubmissions = matchedUser.submitStats?.acSubmissionNum || [];
        const submissions = data.recentSubmissionList || [];

        res.json({
            success: true,
            data: {
                username: matchedUser.username,
                realName: matchedUser.profile?.realName || '',
                ranking: matchedUser.profile?.ranking || 0,
                avatar: matchedUser.profile?.userAvatar || '',
                reputation: matchedUser.profile?.reputation || 0,
                allQuestionsCount: allQuestions,
                acSubmissionNum: acSubmissions,
                submissions
            }
        });
    } catch (error) {
        console.error('LeetCode integration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch LeetCode profile data',
            error: error.message
        });
    }
};

module.exports = {
    getGithubProfile,
    getLeetcodeProfile
};
