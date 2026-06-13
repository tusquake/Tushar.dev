const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getUserProjects,
    importGithubProject,
    deleteUserProject,
    createUserProject,
    updateUserProject
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getProjects);
router.get('/user/:userId', getUserProjects);
router.get('/:id', getProject);

// User specific private routes
router.post('/user', protect, createUserProject);
router.put('/user/:id', protect, updateUserProject);
router.post('/import-github', protect, importGithubProject);
router.delete('/user/:id', protect, deleteUserProject);

// Admin only routes
router.post('/', protect, adminOnly, createProject);
router.put('/:id', protect, adminOnly, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

module.exports = router;
