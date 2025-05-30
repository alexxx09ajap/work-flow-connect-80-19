
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
        console.log('Missing required fields for job creation');
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
        userId,
        status: 'open'
      });
      
      console.log('Job created successfully with ID:', job.id);
      
      // Get user info for the response
      const user = await userModel.findById(userId);
      
      const jobWithUser = {
        ...job,
        userName: user ? user.username : 'Unknown',
        userPhoto: user ? user.avatar : null
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
        message: 'Error creating job: ' + error.message,
        error: error.message
      });
    }
  },
  
  // Get all jobs with filters
  async getAllJobs(req, res) {
    try {
      const { category, search, status, limit, userId } = req.query;
      
      const filter = {};
      
      // Filter by category
      if (category) {
        filter.category = category;
      }
      
      // Filter by status
      if (status) {
        filter.status = status;
      }
      
      // Filter by userId
      if (userId) {
        filter.userId = userId;
      }
      
      // Search by title or description
      if (search) {
        filter.search = search;
      }
      
      // Limit results if specified
      const options = {};
      if (limit) {
        options.limit = parseInt(limit, 10);
      }
      
      const jobs = await jobModel.findAll(filter, options);
      
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
      
      console.log('Updating job:', { jobId, title, description, budget, category, skills, status, userId });
      
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
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Create comment
      const comment = await commentModel.create({
        content,
        jobId,
        userId,
        timestamp: Date.now()
      });
      
      // Get user info
      const user = await userModel.findById(userId);
      
      const commentWithUser = {
        ...comment,
        userName: user ? user.username : 'Unknown',
        userPhoto: user ? user.avatar : null,
        replies: []
      };
      
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment: commentWithUser
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
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Get comments for job
      const comments = await commentModel.findByJobId(jobId);
      
      // Get user info for each comment
      const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
        const user = await userModel.findById(comment.userId);
        
        // Get replies for comment
        const replies = await replyModel.findByCommentId(comment.id);
        
        // Get user info for each reply
        const repliesWithUserInfo = await Promise.all(replies.map(async (reply) => {
          const replyUser = await userModel.findById(reply.userId);
          return {
            ...reply,
            userName: replyUser ? replyUser.username : 'Unknown',
            userPhoto: replyUser ? replyUser.avatar : null
          };
        }));
        
        return {
          ...comment,
          userName: user ? user.username : 'Unknown',
          userPhoto: user ? user.avatar : null,
          replies: repliesWithUserInfo
        };
      }));
      
      return res.status(200).json({
        success: true,
        comments: commentsWithUserInfo
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
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Check if user has saved job
      const hasSaved = await jobModel.isJobSavedByUser(jobId, userId);
      
      if (hasSaved) {
        // Unsave job
        await jobModel.unsaveJob(jobId, userId);
      } else {
        // Save job
        await jobModel.saveJob(jobId, userId);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Job save status updated',
        saved: !hasSaved
      });
      
    } catch (error) {
      console.error('Error toggling saved job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error toggling saved job',
        error: error.message
      });
    }
  },
  
  // Get saved jobs by user
  async getSavedJobsByUser(req, res) {
    try {
      const { userId } = req.params;
      
      // Verify user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Get saved jobs
      const savedJobs = await jobModel.getSavedJobsByUser(userId);
      
      return res.status(200).json({
        success: true,
        jobs: savedJobs
      });
      
    } catch (error) {
      console.error('Error getting saved jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting saved jobs',
        error: error.message
      });
    }
  }
};

module.exports = jobController;
