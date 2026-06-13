const express = require('express');
const router = express.Router();
const { getGithubProfile, getLeetcodeProfile } = require('../controllers/integrationController');

router.get('/github/:username', getGithubProfile);
router.get('/leetcode/:username', getLeetcodeProfile);

module.exports = router;
