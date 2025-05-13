
import { createContext, useContext, useState, useEffect } from 'react';
import { JobType, CommentType } from '@/types';
import { jobService } from '@/lib/jobService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

export type { JobType, CommentType };

export interface JobContextType {
  jobs: JobType[];
  userJobs: JobType[];
  filteredJobs: JobType[];
  setFilteredJobs: (jobs: JobType[]) => void;
  popularJobs: JobType[];
  getJobById: (id: string) => JobType | undefined;
  loading: boolean;
  addComment: (jobId: string, comment: string) => Promise<void>;
  addReplyToComment: (commentId: string, reply: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  savedJobs: JobType[];
  createJob: (jobData: Partial<JobType>) => Promise<JobType | null>;
  updateJob: (id: string, jobData: Partial<JobType>) => Promise<JobType | null>;
  deleteJob: (id: string) => Promise<boolean>;
  loadJobs: () => Promise<void>;
  getSavedJobs: (userId: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [userJobs, setUserJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [popularJobs, setPopularJobs] = useState<JobType[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      refreshJobs();
    }
  }, [currentUser]);

  const loadJobs = async (): Promise<void> => {
    try {
      const allJobs = await jobService.getAllJobs();
      setJobs(allJobs);

      if (currentUser) {
        const userJobsData = await jobService.getJobsByUserId(currentUser.id);
        setUserJobs(userJobsData);

        await getSavedJobs(currentUser.id);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load jobs."
      });
    }
  };

  const refreshJobs = async (): Promise<void> => {
    setLoading(true);
    try {
      await loadJobs();

      const popularJobsData = await jobService.getPopularJobs();
      setPopularJobs(popularJobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load jobs."
      });
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const addComment = async (jobId: string, comment: string): Promise<void> => {
    try {
      await jobService.addComment(jobId, comment);
      await refreshJobs();
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment."
      });
    }
  };

  const addReplyToComment = async (commentId: string, reply: string): Promise<void> => {
    try {
      await jobService.addReplyToComment(commentId, reply);
      await refreshJobs();
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully."
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reply."
      });
    }
  };

  const saveJob = async (jobId: string): Promise<void> => {
    try {
      await jobService.saveJob(jobId);
      await refreshJobs();
      toast({
        title: "Job saved",
        description: "This job has been saved to your list."
      });
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save job."
      });
    }
  };

  const unsaveJob = async (jobId: string): Promise<void> => {
    try {
      await jobService.unsaveJob(jobId);
      await refreshJobs();
      toast({
        title: "Job unsaved",
        description: "This job has been removed from your saved list."
      });
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsave job."
      });
    }
  };
  
  const getSavedJobs = async (userId: string): Promise<void> => {
    try {
      const savedJobsData = await jobService.getSavedJobs(userId);
      setSavedJobs(savedJobsData);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved jobs."
      });
    }
  };
  
  const createJob = async (jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      console.log("Creating job with data:", jobData);
      const newJob = await jobService.createJob(jobData);
      await refreshJobs();
      toast({
        title: "Success",
        description: "Job created successfully."
      });
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create job. Please try again."
      });
      throw error;
    }
  };
  
  const updateJob = async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const updatedJob = await jobService.updateJob(id, jobData);
      await refreshJobs();
      toast({
        title: "Success",
        description: "Job updated successfully."
      });
      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job. Please try again."
      });
      throw error;
    }
  };
  
  const deleteJob = async (id: string): Promise<boolean> => {
    try {
      await jobService.deleteJob(id);
      await refreshJobs();
      toast({
        title: "Success",
        description: "Job deleted successfully."
      });
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job. Please try again."
      });
      throw error;
    }
  };

  const value: JobContextType = {
    jobs,
    userJobs,
    filteredJobs,
    setFilteredJobs,
    popularJobs,
    getJobById,
    loading,
    addComment,
    addReplyToComment,
    refreshJobs,
    saveJob,
    unsaveJob,
    savedJobs,
    createJob,
    updateJob,
    deleteJob,
    loadJobs,
    getSavedJobs
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
