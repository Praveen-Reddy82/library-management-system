// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  },
  BOOKS: {
    BASE: `${API_BASE_URL}/api/books`,
    BY_ID: (id) => `${API_BASE_URL}/api/books/${id}`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    BORROWINGS: (id) => `${API_BASE_URL}/api/users/${id}/borrowings`,
  },
  BORROWINGS: {
    BASE: `${API_BASE_URL}/api/borrowings`,
    BY_ID: (id) => `${API_BASE_URL}/api/borrowings/${id}`,
    RETURN: (id) => `${API_BASE_URL}/api/borrowings/${id}/return`,
    APPROVE: (id) => `${API_BASE_URL}/api/borrowings/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/borrowings/${id}/reject`,
  },
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/api/upload/image`,
    PDF: `${API_BASE_URL}/api/upload/pdf`,
  },
  UPLOADS: {
    BASE: API_BASE_URL,
  },
};

export default API_BASE_URL;
