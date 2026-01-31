const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }
  
  return data;
};

export const authAPI = {
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  login: (data) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' })
};

export const appointmentAPI = {
  create: (data) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAll: () => apiCall('/appointments')
};