
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  isOnline?: boolean;
  status?: string;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  joinedAt?: number;
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface ChatType {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: string[];
  messages: MessageType[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageType {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  timestamp: string;
  read?: boolean;
  edited?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Job type definition
export interface JobType {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  status: 'open' | 'in progress' | 'completed';
  userId: string;
  timestamp?: number;
  userName?: string;
  userPhoto?: string;
}

export interface CommentType {
  id: string;
  content: string;
  userId: string;
  jobId: string;
  userName?: string;
  userPhoto?: string;
  timestamp: number;
  replies: ReplyType[];
}

export interface ReplyType {
  id: string;
  content: string;
  userId: string;
  commentId: string;
  userName?: string;
  userPhoto?: string;
  timestamp: number;
}

// Type aliases to avoid circular dependencies
export type UserType = User;
