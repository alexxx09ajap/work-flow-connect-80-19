
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Solución temporal para errores de red con localhost durante desarrollo
// Esta función simula una respuesta exitosa cuando falla la conexión al backend
const handleNetworkErrors = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.message === 'Network Error') {
      console.warn('Network error detected. Returning mock data for development.');
      // Retornar datos simulados según la URL de la solicitud
      if (apiCall.url?.includes('/users')) {
        return { data: [] };
      } else if (apiCall.url?.includes('/jobs')) {
        return { data: [] };
      } else if (apiCall.url?.includes('/chats')) {
        return { data: [] };
      }
    }
    throw error;
  }
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string, role: string = 'client') => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data.user;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

export const userService = {
  getAllUsers: async () => {
    return handleNetworkErrors(async () => {
      const response = await api.get('/users');
      return response.data;
    });
  },
  
  getUserById: async (userId: string) => {
    return handleNetworkErrors(async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    });
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

export const chatService = {
  getChats: async () => {
    try {
      const response = await api.get('/chats');
      console.log("Chat service - fetched chats:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching chats:", err);
      return [];
    }
  },
  
  createPrivateChat: async (userId: string) => {
    try {
      const response = await api.post('/chats/private', { userId });
      console.log("Chat service - created private chat:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error creating private chat:", err);
      throw err;
    }
  },
  
  createGroupChat: async (name: string, participants: string[]) => {
    const response = await api.post('/chats/group', { name, participants });
    return response.data;
  },
  
  addUsersToChat: async (chatId: string, userIds: string[]) => {
    const response = await api.post(`/chats/${chatId}/users`, { userIds });
    return response.data;
  },
  
  leaveChat: async (chatId: string) => {
    const response = await api.post(`/chats/${chatId}/leave`);
    return response.data;
  },
  
  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  }
};

export const messageService = {
  getMessages: async (chatId: string) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching messages:", err);
      return [];
    }
  },
  
  sendMessage: async (chatId: string, content: string) => {
    try {
      const response = await api.post('/messages', { 
        chatId, 
        content 
      }, {
        headers: {
          'X-Socket-Request': 'false' // Marcar explícitamente como solicitud HTTP
        }
      });
      return response.data;
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  },
  
  updateMessage: async (messageId: string, text: string) => {
    try {
      const response = await api.put(`/messages/${messageId}`, { 
        text 
      }, {
        headers: {
          'X-Socket-Request': 'false' // Marcar explícitamente como solicitud HTTP
        }
      });
      return response.data;
    } catch (err) {
      console.error("Error updating message:", err);
      throw err;
    }
  },
  
  deleteMessage: async (messageId: string) => {
    try {
      const response = await api.delete(`/messages/${messageId}`, {
        headers: {
          'X-Socket-Request': 'false' // Marcar explícitamente como solicitud HTTP
        }
      });
      return response.data;
    } catch (err) {
      console.error("Error deleting message:", err);
      throw err;
    }
  }
};

export const fileService = {
  uploadFile: async (chatId: string, file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result?.toString().split(',')[1]; // Get base64 data
          
          if (!data) {
            throw new Error('Failed to read file');
          }
          
          const response = await api.post('/files', {
            chatId,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            data
          });
          
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },
  
  getFileUrl: (fileId: string) => {
    const token = localStorage.getItem('token');
    return `http://localhost:5000/api/files/${fileId}?token=${token}`;
  }
};

export const socketService = {
  socket: null as any,
  
  connect: (token: string) => {
    const io = require('socket.io-client');
    
    socketService.socket = io('http://localhost:5000', {
      auth: { token }
    });
    
    return socketService.socket;
  },
  
  disconnect: () => {
    if (socketService.socket) {
      socketService.socket.disconnect();
      socketService.socket = null;
    }
  }
};

export default api;
