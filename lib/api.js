import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => Promise.reject(error)
)

export default apiClient

// PUBLIC API
export const publicApi = {
  getHomeData: () => apiClient.get('/public/home'),
  getBlogPosts: () => apiClient.get('/public/blog'),
  getBlogs: () => apiClient.get('/public/blog'),
  getBlogPost: (slug) => apiClient.get(`/public/blog/${slug}`),
  submitEnquiry: (formData) => apiClient.post('/public/contact', formData),
  trackProject: (id) => apiClient.get(`/public/track/${id}`)
}

// AUTH API
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

// CLIENT API
export const clientApi = {
  getDashboard: () => apiClient.get('/client/dashboard'),
  getProjectDetail: (id) => apiClient.get(`/client/project/${id}`),
  getProjectDetails: (id) => apiClient.get(`/client/project/${id}`),
  sendMessage: (payload) => apiClient.post('/client/messages', payload),
  getMessages: () => apiClient.get('/client/messages'),
  uploadFile: (projectId, formData) => apiClient.post(`/client/project/${projectId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProfile: (profileData) => apiClient.post('/client/profile', profileData),
  markNotificationsRead: () => apiClient.post('/client/notifications/read'),
  backToAdmin: () => apiClient.post('/client/back-to-admin'),
  logout: () => apiClient.post('/auth/logout')
}

// ADMIN API
export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  emulateClient: (clientId) => apiClient.post(`/admin/clients/${clientId}/view-portal`),
  logout: () => apiClient.post('/auth/logout'),
  updateEnquiryStatus: (id, status) => apiClient.post(`/admin/enquiries/${id}/status`, { status }),
  deleteEnquiry: (id) => apiClient.delete(`/admin/enquiries/${id}`),
  createClient: (clientData) => apiClient.post('/admin/clients', clientData),
  updateClient: (id, clientData) => apiClient.put(`/admin/clients/${id}`, clientData),
  deleteClient: (id) => apiClient.delete(`/admin/clients/${id}`),
  createProject: (projectData) => apiClient.post('/admin/projects', projectData),
  updateProject: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  updatePayment: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  addTimelineUpdate: (id, status, note) => apiClient.post(`/admin/projects/${id}/update`, { status, note }),
  uploadProjectFile: (id, formData) => apiClient.post(`/admin/projects/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
  createBlogPost: (data) => apiClient.post('/admin/blog', data),
  updateBlogPost: (id, data) => apiClient.put(`/admin/blog/${id}`, data),
  deleteBlogPost: (id) => apiClient.delete(`/admin/blog/${id}`),
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),
  createTestimonial: (data) => apiClient.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => apiClient.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => apiClient.delete(`/admin/testimonials/${id}`),
  createGalleryItem: (data) => apiClient.post('/admin/gallery', data),
  updateGalleryItem: (id, data) => apiClient.put(`/admin/gallery/${id}`, data),
  deleteGalleryItem: (id) => apiClient.delete(`/admin/gallery/${id}`),
  createFAQ: (data) => apiClient.post('/admin/faqs', data),
  updateFAQ: (id, data) => apiClient.put(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => apiClient.delete(`/admin/faqs/${id}`),
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data)
}

// PAYMENT API
export const paymentApi = {
  createOrder: (data) => apiClient.post('/public/payments/create-order', data),
  verifyPayment: (data) => apiClient.post('/public/payments/verify', data),
  getProjectPayments: (projectId) => apiClient.get(`/public/payments/${projectId}`),
  clientCreateOrder: (data) => apiClient.post('/client/payments/create-order', data),
  clientVerifyPayment: (data) => apiClient.post('/client/payments/verify', data),
  clientGetPayments: (projectId) => apiClient.get(`/client/payments/${projectId}`)
}
