
import { CommentType, JobType } from '@/types';
import { UserType } from '@/types';
import api from '@/services/api';

export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    try {
      const response = await api.get('/jobs');
      return response.data.jobs || [];
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data.job || null;
    } catch (error) {
      console.error(`Error fetching job with id ${id}:`, error);
      return null;
    }
  },
  
  getJobsByUserId: async (userId: string): Promise<JobType[]> => {
    try {
      const response = await api.get(`/jobs?userId=${userId}`);
      return response.data.jobs || [];
    } catch (error) {
      console.error(`Error fetching jobs for user ${userId}:`, error);
      return [];
    }
  },
  
  getPopularJobs: async (): Promise<JobType[]> => {
    try {
      // Obtenemos los últimos 5 trabajos como populares
      const response = await api.get('/jobs?limit=5');
      return response.data.jobs || [];
    } catch (error) {
      console.error('Error fetching popular jobs:', error);
      return [];
    }
  },
  
  getSavedJobs: async (userId: string): Promise<JobType[]> => {
    try {
      const response = await api.get(`/users/${userId}/saved-jobs`);
      return response.data.jobs || [];
    } catch (error) {
      console.error(`Error fetching saved jobs for user ${userId}:`, error);
      return [];
    }
  },
  
  saveJob: async (jobId: string): Promise<boolean> => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      return true;
    } catch (error) {
      console.error(`Error saving job ${jobId}:`, error);
      return false;
    }
  },
  
  unsaveJob: async (jobId: string): Promise<boolean> => {
    try {
      await api.post(`/jobs/${jobId}/unsave`);
      return true;
    } catch (error) {
      console.error(`Error unsaving job ${jobId}:`, error);
      return false;
    }
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      console.log("Sending job creation request with data:", jobData);
      const response = await api.post('/jobs', jobData);
      return response.data.job || null;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error; // Propagate the error to handle it in the component
    }
  },
  
  updateJob: async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data.job || null;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error; // Propagate the error to handle it in the component
    }
  },
  
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/jobs/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error; // Propagate the error to handle it in the component
    }
  },
  
  addComment: async (jobId: string, comment: string): Promise<CommentType> => {
    try {
      const response = await api.post(`/jobs/${jobId}/comments`, { content: comment });
      return response.data.comment;
    } catch (error) {
      console.error(`Error adding comment to job ${jobId}:`, error);
      throw error;
    }
  },
  
  deleteComment: async (commentId: string): Promise<any> => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  },
  
  addReply: async (commentId: string, reply: string): Promise<any> => {
    try {
      const response = await api.post(`/comments/${commentId}/replies`, { content: reply });
      return response.data;
    } catch (error) {
      console.error(`Error adding reply to comment ${commentId}:`, error);
      throw error;
    }
  }
};

export const userService = {
  getUserById: async (id: string): Promise<UserType | null> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }
};
