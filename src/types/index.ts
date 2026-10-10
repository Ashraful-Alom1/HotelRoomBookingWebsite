export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface GalleryImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  altText?: string;
  order?: number;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  isAC: boolean;
  bedType: string;
  roomSize: string; // e.g. "380 sq ft"
  maxGuests: number;
  inventoryQuantity: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  policies: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  featured: boolean;
  coverImage: GalleryImage;
  gallery: GalleryImage[];
  toiletImages: GalleryImage[];
  washroomImages: GalleryImage[];
  averageRating: number;
  reviewCount: number;
  location?: string;
  googleMapEmbedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';

export interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  roomId: string;
  roomSnapshot: {
    name: string;
    slug: string;
    isAC: boolean;
    pricePerNight: number;
    maxGuests: number;
    coverImageUrl?: string;
  };
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  roomQuantity: number;
  pricing: {
    pricePerNight: number;
    subtotal: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
  };
  status: BookingStatus;
  customerNote?: string;
  adminNote?: string;
  whatsapp?: {
    status: 'PENDING' | 'SENT' | 'FAILED';
    messageId?: string;
    lastAttemptAt?: string;
    errorCode?: string;
  };
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  roomId: string;
  customerName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  images?: string[];
  isVerifiedStay: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export interface AvailabilityBlock {
  id: string;
  roomId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  quantity: number;
  reason: 'MAINTENANCE' | 'PRIVATE_USE' | 'TEMPORARY_BLOCK' | 'OTHER';
  status: 'ACTIVE' | 'RELEASED';
  createdBy: string;
  createdAt: string;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  bookingPolicy: string;
  currency: string;
  timezone: string;
  taxRatePercent: number;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  type: string;
  bookingId: string;
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  attemptCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
}
