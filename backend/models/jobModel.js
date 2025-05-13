
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const jobModel = {
  // Create a new job
  async create(jobData) {
    try {
      const { title, description, budget, category, skills, userId, status } = jobData;
      const id = uuidv4();
      const jobStatus = status || 'open';
      const timestamp = Date.now();
      
      const result = await db.query(
        `INSERT INTO jobs (id, title, description, budget, category, skills, status, user_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
         RETURNING id, title, description, budget, category, skills, status, user_id AS "userId", created_at, updated_at`,
        [id, title, description, budget, category, skills, jobStatus, userId]
      );
      
      // Convert snake_case to camelCase
      const job = result.rows[0];
      job.createdAt = job.created_at;
      job.updatedAt = job.updated_at;
      job.timestamp = timestamp;
      delete job.created_at;
      delete job.updated_at;
      
      return job;
    } catch (error) {
      console.error("Error in jobModel.create:", error);
      throw error;
    }
  },
  
  // Get all jobs with optional filtering
  async findAll(filter = {}, options = {}) {
    try {
      let query = `
        SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
               j.user_id AS "userId", j.created_at, j.updated_at,
               EXTRACT(EPOCH FROM j.created_at) * 1000 as timestamp
        FROM jobs j
      `;
      
      const params = [];
      const conditions = [];
      
      if (filter.category) {
        params.push(filter.category);
        conditions.push(`j.category = $${params.length}`);
      }
      
      if (filter.status) {
        params.push(filter.status);
        conditions.push(`j.status = $${params.length}`);
      }
      
      if (filter.search) {
        params.push(`%${filter.search}%`);
        conditions.push(`(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`);
      }
      
      if (filter.userId) {
        params.push(filter.userId);
        conditions.push(`j.user_id = $${params.length}`);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY j.created_at DESC`;
      
      // Add limit if specified
      if (options.limit) {
        params.push(options.limit);
        query += ` LIMIT $${params.length}`;
      }
      
      const result = await db.query(query, params);
      
      // Convert snake_case to camelCase for each row
      return result.rows.map(job => {
        job.createdAt = job.created_at;
        job.updatedAt = job.updated_at;
        delete job.created_at;
        delete job.updated_at;
        return job;
      });
    } catch (error) {
      console.error("Error in jobModel.findAll:", error);
      throw error;
    }
  },
  
  // Find job by ID
  async findById(jobId) {
    try {
      const result = await db.query(
        `SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
                j.user_id AS "userId", j.created_at, j.updated_at,
                EXTRACT(EPOCH FROM j.created_at) * 1000 as timestamp
         FROM jobs j
         WHERE j.id = $1`,
        [jobId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const job = result.rows[0];
      job.createdAt = job.created_at;
      job.updatedAt = job.updated_at;
      delete job.created_at;
      delete job.updated_at;
      
      return job;
    } catch (error) {
      console.error("Error in jobModel.findById:", error);
      throw error;
    }
  },
  
  // Update a job
  async update(jobId, jobData) {
    try {
      const { title, description, budget, category, skills, status } = jobData;
      
      // Build the SET part of the query dynamically based on the provided fields
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push(`title = $${updates.length + 1}`);
        values.push(title);
      }
      
      if (description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(description);
      }
      
      if (budget !== undefined) {
        updates.push(`budget = $${updates.length + 1}`);
        values.push(budget);
      }
      
      if (category !== undefined) {
        updates.push(`category = $${updates.length + 1}`);
        values.push(category);
      }
      
      if (skills !== undefined) {
        updates.push(`skills = $${updates.length + 1}`);
        values.push(skills);
      }
      
      if (status !== undefined) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status);
      }
      
      // Add updated_at
      updates.push(`updated_at = NOW()`);
      
      // Add jobId to values array
      values.push(jobId);
      
      const query = `
        UPDATE jobs 
        SET ${updates.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING id, title, description, budget, category, skills, status, user_id AS "userId", created_at, updated_at,
                  EXTRACT(EPOCH FROM created_at) * 1000 as timestamp
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const job = result.rows[0];
      job.createdAt = job.created_at;
      job.updatedAt = job.updated_at;
      delete job.created_at;
      delete job.updated_at;
      
      return job;
    } catch (error) {
      console.error("Error in jobModel.update:", error);
      throw error;
    }
  },
  
  // Delete a job
  async delete(jobId) {
    try {
      await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
      return true;
    } catch (error) {
      console.error("Error in jobModel.delete:", error);
      throw error;
    }
  },
  
  // Save a job for a user
  async saveJob(jobId, userId) {
    try {
      await db.query(
        'INSERT INTO saved_jobs (user_id, job_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
        [userId, jobId]
      );
      return true;
    } catch (error) {
      console.error("Error in jobModel.saveJob:", error);
      throw error;
    }
  },
  
  // Unsave a job for a user
  async unsaveJob(jobId, userId) {
    try {
      await db.query(
        'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );
      return true;
    } catch (error) {
      console.error("Error in jobModel.unsaveJob:", error);
      throw error;
    }
  },
  
  // Check if a job is saved by a user
  async isJobSavedByUser(jobId, userId) {
    try {
      const result = await db.query(
        'SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error in jobModel.isJobSavedByUser:", error);
      throw error;
    }
  },
  
  // Get jobs saved by a user
  async getSavedJobsByUser(userId) {
    try {
      const result = await db.query(
        `SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
                j.user_id AS "userId", j.created_at, j.updated_at,
                EXTRACT(EPOCH FROM j.created_at) * 1000 as timestamp
         FROM jobs j
         JOIN saved_jobs sj ON j.id = sj.job_id
         WHERE sj.user_id = $1
         ORDER BY sj.created_at DESC`,
        [userId]
      );
      
      return result.rows.map(job => {
        job.createdAt = job.created_at;
        job.updatedAt = job.updated_at;
        delete job.created_at;
        delete job.updated_at;
        return job;
      });
    } catch (error) {
      console.error("Error in jobModel.getSavedJobsByUser:", error);
      throw error;
    }
  }
};

module.exports = jobModel;
