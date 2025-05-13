
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const commentModel = require('../models/commentModel');
const replyModel = require('../models/replyModel');

const jobController = {
  // Create a new job
  async createJob(req, res) {
    try {
      const { title, description, budget, category, skills } = req.body;
      const userId = req.user.userId;
      
      console.log('Creating job with data:', { title, description, budget, category, skills, userId });
      
      // Validate required fields
      if (!title || !description || !budget || !category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields (title, description, budget, category)'
        });
      }
      
      // Create the job
      const job = await jobModel.create({
        title,
        description,
        budget: parseFloat(budget),
        category,
        skills: Array.isArray(skills) ? skills : [],
        userId
      });
      
      // Get user info for the response
      const user = await userModel.findById(userId);
      
      const jobWithUser = {
        ...job,
        userName: user.username,
        userPhoto: user.avatar
      };
      
      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating job',
        error: error.message
      });
    }
  },
  
  // Get all jobs with filters
  async getAllJobs(req, res) {
    try {
      const { category, search, status } = req.query;
      
      const filter = {};
      
      // Filter by category
      if (category) {
        filter.category = category;
      }
      
      // Filter by status
      if (status) {
        filter.status = status;
      }
      
      // Search by title or description (simplified for PostgreSQL)
      if (search) {
        filter.search = search;
      }
      
      const jobs = await jobModel.findAll(filter);
      
      // Get user info for each job
      const jobsWithUserInfo = await Promise.all(jobs.map(async (job) => {
        const user = await userModel.findById(job.userId);
        return {
          ...job,
          userName: user ? user.username : 'Unknown',
          userPhoto: user ? user.avatar : null
        };
      }));
      
      return res.status(200).json({
        success: true,
        jobs: jobsWithUserInfo
      });
      
    } catch (error) {
      console.error('Error getting jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting jobs',
        error: error.message
      });
    }
  },
  
  // Get job by ID
  async getJobById(req, res) {
    try {
      const { jobId } = req.params;
      
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Get user info
      const user = await userModel.findById(job.userId);
      
      const jobWithUser = {
        ...job,
        userName: user ? user.username : 'Unknown',
        userPhoto: user ? user.avatar : null
      };
      
      return res.status(200).json({
        success: true,
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error getting job by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting job',
        error: error.message
      });
    }
  },
  
  // Update a job
  async updateJob(req, res) {
    try {
      const { jobId } = req.params;
      const { title, description, budget, category, skills, status } = req.body;
      const userId = req.user.userId;
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Verify user is the owner
      if (job.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this job'
        });
      }
      
      // Update job
      const updatedData = {};
      if (title) updatedData.title = title;
      if (description) updatedData.description = description;
      if (budget) updatedData.budget = parseFloat(budget);
      if (category) updatedData.category = category;
      if (skills) updatedData.skills = skills;
      if (status) updatedData.status = status;
      
      const updatedJob = await jobModel.update(jobId, updatedData);
      
      // Get user info for the response
      const user = await userModel.findById(userId);
      
      const jobWithUser = {
        ...updatedJob,
        userName: user ? user.username : 'Unknown',
        userPhoto: user ? user.avatar : null
      };
      
      return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating job',
        error: error.message
      });
    }
  },
  
  // Delete a job
  async deleteJob(req, res) {
    try {
      const { jobId } = req.params;
      const userId = req.user.userId;
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Verify user is the owner
      if (job.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this job'
        });
      }
      
      // Delete job
      await jobModel.delete(jobId);
      
      return res.status(200).json({
        success: true,
        message: 'Job deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting job',
        error: error.message
      });
    }
  },
  
  // Add a comment to a job
  async addComment(req, res) {
    try {
      const { jobId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      // Create comment logic
      // This is a placeholder - you'll need to implement comment model and functionality
      
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment: {
          id: 'placeholder-id',
          content,
          jobId,
          userId
        }
      });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  },
  
  // Get comments for a job
  async getJobComments(req, res) {
    try {
      const { jobId } = req.params;
      
      // Get comments logic
      // This is a placeholder - you'll need to implement comment model and functionality
      
      return res.status(200).json({
        success: true,
        comments: []
      });
      
    } catch (error) {
      console.error('Error getting comments:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting comments',
        error: error.message
      });
    }
  },
  
  // Toggle save job
  async toggleSavedJob(req, res) {
    try {
      const { jobId } = req.params;
      const userId = req.user.userId;
      
      // Toggle save job logic
      // This is a placeholder - you'll need to implement saved jobs functionality
      
      return res.status(200).json({
        success: true,
        message: 'Job save status updated'
      });
      
    } catch (error) {
      console.error('Error toggling saved job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error toggling saved job',
        error: error.message
      });
    }
  }
};

module.exports = jobController;
