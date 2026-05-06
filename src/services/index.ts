import api from '../lib/api'
import type { AuthResponse, Booking, DashboardStats, Facility, Notification, PagedResult, Payment, TimeSlot, User } from '../types'

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: { fullName: string; email: string; password: string; phone: string }) => api.post<AuthResponse>('/auth/register', data),
  profile: () => api.get<User>('/auth/profile'),
  updateProfile: (data: { fullName: string; phone: string }) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
}

// Facilities
export const facilityApi = {
  getAll: (active?: boolean) => api.get<Facility[]>('/facilities', { params: active !== undefined ? { active } : {} }),
  getById: (id: number) => api.get<Facility>(`/facilities/${id}`),
  create: (data: Partial<Facility>) => api.post<Facility>('/facilities', data),
  update: (id: number, data: Partial<Facility>) => api.put(`/facilities/${id}`, data),
  delete: (id: number) => api.delete(`/facilities/${id}`),
  getTimeSlots: (id: number) => api.get<TimeSlot[]>(`/facilities/${id}/timeslots`),
  addTimeSlot: (data: Omit<TimeSlot, 'id' | 'isAvailable'>) => api.post<TimeSlot>('/facilities/timeslots', data),
  deleteTimeSlot: (id: number) => api.delete(`/facilities/timeslots/${id}`),
}

// Bookings
export const bookingApi = {
  getAll: (page = 1, pageSize = 10, status?: string) =>
    api.get<PagedResult<Booking>>('/bookings', { params: { page, pageSize, status } }),
  getMy: (page = 1, pageSize = 10) =>
    api.get<PagedResult<Booking>>('/bookings/my', { params: { page, pageSize } }),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),
  create: (data: { facilityId: number; bookingDate: string; startTime: string; endTime: string; notes?: string }) =>
    api.post<Booking>('/bookings', data),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel`),
  updateStatus: (id: number, status: string) => api.put(`/bookings/${id}/status`, { status }),
  checkConflict: (facilityId: number, date: string, start: string, end: string) =>
    api.get<{ hasConflict: boolean }>('/bookings/check-conflict', { params: { facilityId, date, start, end } }),
}

// Payments
export const paymentApi = {
  getByBooking: (bookingId: number) => api.get<Payment>(`/payments/booking/${bookingId}`),
  create: (data: { bookingId: number; method: string; transactionId?: string }) => api.post<Payment>('/payments', data),
  createCheckoutSession: (data: { bookingId: number, method?: string }) => api.post<{ url: string }>('/payments/create-checkout-session', { ...data, method: 'Stripe' }),
  updateStatus: (bookingId: number, status: string) => api.put(`/payments/booking/${bookingId}/status`, { status }),
}

// Notifications
export const notificationApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Reports
export const reportApi = {
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard'),
}

// Users (admin)
export const userApi = {
  getAll: () => api.get<User[]>('/users'),
  toggleActive: (id: number) => api.put(`/users/${id}/toggle-active`),
  me: () => authApi.profile(),
  update: (data: { fullName: string; phone: string }) => authApi.updateProfile(data),
}
