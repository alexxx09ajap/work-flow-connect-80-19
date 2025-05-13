
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const replyModel = {
  // Create a new reply
  async create(replyData) {
    const { content, commentId, userId, timestamp } = replyData;
    const id = uuidv4();
    
    const result = await db.query(
      `INSERT INTO replies (id, content, comment_id, user_id, timestamp, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, content, comment_id AS "commentId", user_id AS "userId", timestamp, created_at, updated_at`,
      [id, content, commentId, userId, timestamp || Date.now()]
    );
    
    // Convert snake_case to camelCase
    const reply = result.rows[0];
    reply.createdAt = reply.created_at;
    reply.updatedAt = reply.updated_at;
    delete reply.created_at;
    delete reply.updated_at;
    
    return reply;
  },
  
  // Find replies by comment ID
  async findByCommentId(commentId) {
    const result = await db.query(
      `SELECT r.id, r.content, r.comment_id AS "commentId", r.user_id AS "userId", r.timestamp, 
              r.created_at, r.updated_at
       FROM replies r
       WHERE r.comment_id = $1
       ORDER BY r.timestamp ASC`,
      [commentId]
    );
    
    // Convert snake_case to camelCase
    return result.rows.map(reply => {
      reply.createdAt = reply.created_at;
      reply.updatedAt = reply.updated_at;
      delete reply.created_at;
      delete reply.updated_at;
      return reply;
    });
  }
};

module.exports = replyModel;
