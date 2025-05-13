
const express = require('express');
const userController = require('../controllers/userController');
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/public/:userId', userController.getPublicUserProfile);

// Protected routes
router.use(authenticateToken);

// Get current user profile
router.get('/profile', userController.getCurrentUser);

// Update user profile
router.put('/profile', userController.updateUserProfile);

// Upload avatar
router.post('/avatar', userController.uploadAvatar);

// Get saved jobs for a user
router.get('/:userId/saved-jobs', jobController.getSavedJobsByUser);

// Toggle online status
router.post('/toggle-status', userController.toggleOnlineStatus);

// Get user list for new chat
router.get('/chat-users', userController.getUsersForChat);

module.exports = router;
