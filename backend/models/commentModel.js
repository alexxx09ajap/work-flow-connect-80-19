
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const commentModel = {
  // Create a new comment
  async create(commentData) {
    const { content, jobId, userId, timestamp } = commentData;
    const id = uuidv4();
    
    const result = await db.query(
      `INSERT INTO comments (id, content, job_id, user_id, timestamp, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, content, job_id AS "jobId", user_id AS "userId", timestamp, created_at, updated_at`,
      [id, content, jobId, userId, timestamp]
    );
    
    // Convert snake_case to camelCase
    const comment = result.rows[0];
    comment.createdAt = comment.created_at;
    comment.updatedAt = comment.updated_at;
    delete comment.created_at;
    delete comment.updated_at;
    
    return comment;
  },
  
  // Find comments by job ID
  async findByJobId(jobId) {
    const result = await db.query(
      `SELECT c.id, c.content, c.job_id AS "jobId", c.user_id AS "userId", c.timestamp, 
              c.created_at, c.updated_at
       FROM comments c
       WHERE c.job_id = $1
       ORDER BY c.timestamp DESC`,
      [jobId]
    );
    
    // Convert snake_case to camelCase
    return result.rows.map(comment => {
      comment.createdAt = comment.created_at;
      comment.updatedAt = comment.updated_at;
      delete comment.created_at;
      delete comment.updated_at;
      return comment;
    });
  }
};

module.exports = commentModel;
