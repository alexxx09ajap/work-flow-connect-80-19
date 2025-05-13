
const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new job
router.post('/', jobController.createJob);

// Get all jobs with optional filtering
router.get('/', jobController.getAllJobs);

// Get job by ID
router.get('/:jobId', jobController.getJobById);

// Update a job
router.put('/:jobId', jobController.updateJob);

// Delete a job
router.delete('/:jobId', jobController.deleteJob);

// Add a comment to a job
router.post('/:jobId/comments', jobController.addComment);

// Get comments for a job
router.get('/:jobId/comments', jobController.getJobComments);

// Toggle save job (save/unsave)
router.post('/:jobId/save', jobController.toggleSavedJob);
router.post('/:jobId/unsave', jobController.toggleSavedJob);

module.exports = router;
