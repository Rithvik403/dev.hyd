import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api` 
  : '/api'

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to attach Bearer token fallback if present
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor to handle session expiration transparently
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // If unauthorized (401), redirecting or let context handle it
    return Promise.reject(error)
  }
)

export default apiClient

// PUBLIC ENDPOINTS
export const publicApi = {
  getHomeData: () => apiClient.get('/public/home'),
  getBlogPosts: () => apiClient.get('/public/blog'),
  getBlogs: () => apiClient.get('/public/blog'), // alias used by Blog.jsx
  getBlogPost: (slug) => apiClient.get(`/public/blog/${slug}`),
  submitEnquiry: (formData) => apiClient.post('/public/contact', formData),
  trackProject: (id) => apiClient.get(`/public/track/${id}`)
}

// AUTH ENDPOINTS
export const authApi = {
  adminLogin: (credentials) => apiClient.post('/auth/login/admin', credentials),
  clientLogin: (credentials) => apiClient.post('/auth/login/client', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email, role) => apiClient.post('/auth/forgot-password', { email, role }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  sendVerification: () => apiClient.post('/auth/send-verification')
}

// CLIENT PORTAL ENDPOINTS
export const clientApi = {
  getDashboard: () => apiClient.get('/client/dashboard'),
  getProjectDetail: (id) => apiClient.get(`/client/project/${id}`),
  getProjectDetails: (id) => apiClient.get(`/client/project/${id}`), // alias used by ClientProject.jsx
  sendMessage: (payload) => apiClient.post('/client/messages', payload),
  getMessages: () => apiClient.get('/client/messages'),
  uploadFile: (projectId, formData) => apiClient.post(`/client/project/${projectId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProfile: (profileData) => apiClient.post('/client/profile', profileData),
  markNotificationsRead: () => apiClient.post('/client/notifications/read'),
  backToAdmin: () => apiClient.post('/client/back-to-admin'),
  logout: () => apiClient.post('/auth/logout') // alias used by ClientDashboard.jsx / ClientProject.jsx
}

// ADMIN DASHBOARD ENDPOINTS
export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  emulateClient: (clientId) => apiClient.post(`/admin/clients/${clientId}/view-portal`),
  logout: () => apiClient.post('/auth/logout'), // alias used by AdminDashboard.jsx
  
  // Enquiries
  updateEnquiryStatus: (id, status) => apiClient.post(`/admin/enquiries/${id}/status`, { status }),
  deleteEnquiry: (id) => apiClient.delete(`/admin/enquiries/${id}`),
  
  // Clients
  createClient: (clientData) => apiClient.post('/admin/clients', clientData),
  updateClient: (id, clientData) => apiClient.put(`/admin/clients/${id}`, clientData),
  deleteClient: (id) => apiClient.delete(`/admin/clients/${id}`),
  
  // Projects
  createProject: (projectData) => apiClient.post('/admin/projects', projectData),
  updateProject: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  updatePayment: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  addTimelineUpdate: (id, status, note) => apiClient.post(`/admin/projects/${id}/update`, { status, note }),
  uploadProjectFile: (id, formData) => apiClient.post(`/admin/projects/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
  
  // Blogs
  createBlogPost: (formData) => apiClient.post('/admin/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBlogPost: (id, formData) => apiClient.put(`/admin/blog/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBlogPost: (id) => apiClient.delete(`/admin/blog/${id}`),
  
  // Services
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),
  
  // Testimonials
  createTestimonial: (formData) => apiClient.post('/admin/testimonials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTestimonial: (id, formData) => apiClient.put(`/admin/testimonials/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTestimonial: (id) => apiClient.delete(`/admin/testimonials/${id}`),
  
  // Gallery
  createGalleryItem: (formData) => apiClient.post('/admin/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateGalleryItem: (id, formData) => apiClient.put(`/admin/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalleryItem: (id) => apiClient.delete(`/admin/gallery/${id}`),
  
  // FAQs
  createFAQ: (data) => apiClient.post('/admin/faqs', data),
  updateFAQ: (id, data) => apiClient.put(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => apiClient.delete(`/admin/faqs/${id}`),
  
  // Settings
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data)
}
