export interface User {
  id: number; fullName: string; email: string; phone: string;
  role: 'Admin' | 'User'; isActive: boolean; createdAt: string;
}

export interface AuthResponse {
  token: string; role: string; fullName: string; userId: number;
}

export interface Facility {
  id: number; name: string; description: string; type: string;
  capacity: number; pricePerHour: number; imageUrl: string; isActive: boolean;
}

export interface TimeSlot {
  id: number; facilityId: number; dayOfWeek: number;
  startTime: string; endTime: string; isAvailable: boolean;
}

export interface Payment {
  id: number; bookingId: number; amount: number; method: string;
  status: string; transactionId?: string; paidAt?: string;
}

export interface Booking {
  id: number; userId: number; userName: string; userEmail: string;
  facilityId: number; facilityName: string; facilityType: string;
  bookingDate: string; startTime: string; endTime: string;
  totalAmount: number; status: string; notes?: string;
  createdAt: string; payment?: Payment;
}

export interface Notification {
  id: number; title: string; message: string;
  type: string; isRead: boolean; createdAt: string;
}

export interface DashboardStats {
  totalBookings: number; todayBookings: number; pendingBookings: number;
  totalUsers: number; activeFacilities: number;
  totalRevenue: number; monthRevenue: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
  facilityStats: { name: string; totalBookings: number; revenue: number }[];
}

export interface PagedResult<T> {
  items: T[]; total: number; page: number; pageSize: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type FacilityType = 'Football' | 'Basketball' | 'Tennis' | 'Gym' | 'Swimming';
