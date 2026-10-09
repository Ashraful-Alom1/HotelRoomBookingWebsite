
# HOTEL BOOKING WEBSITE — AI DEVELOPMENT MASTER SPECIFICATION

## 0. Project Summary

### Project type
Modern hotel-room booking website with:
- Premium, attractive, responsive UI/UX
- Hotel/room browsing
- Price filtering
- AC / Non-AC filtering
- Room detail pages
- Room, toilet and washroom image galleries
- Ratings and customer reviews
- Date-based room availability
- Booking request flow
- Firebase Authentication
- Firebase/Firestore backend
- Cloudinary media storage
- Business WhatsApp booking notifications
- Admin dashboard for room, availability, booking and review management

### Primary implementation environment
- AI coding/development tool: Anti-gravity
- Authentication: Firebase Authentication
- Database: Cloud Firestore
- Media storage: Cloudinary
- Backend/server logic: Firebase Cloud Functions or equivalent secure server-side layer
- Frontend: React/Next.js-style production architecture
- Styling: modern responsive CSS/Tailwind or the project's existing styling system
- Deployment: choose the hosting platform compatible with the final framework; do not hard-code deployment assumptions before the project is validated

### Important terminology correction
The requirement says “Cloudanary”. This specification interprets that as **Cloudinary**.

### Core product rule
The website must use real database data. Do not hard-code rooms, pricing, reviews, ratings, booking counts, availability, gallery images, or admin statistics as fake production data.

---

# 1. PRD — PRODUCT REQUIREMENTS DOCUMENT

## 1.1 Product Vision

Build a visually premium hotel booking platform where a customer can discover available rooms, compare room types and prices, inspect detailed images and amenities, read verified reviews, select dates, submit a booking, and have the booking information delivered to the hotel's connected WhatsApp workflow.

The experience should feel similar to a professional hotel reservation marketplace while remaining simple enough for a single hotel/business to manage.

## 1.2 Business Goals

1. Increase direct hotel booking enquiries.
2. Reduce manual phone-based room availability enquiries.
3. Present rooms professionally through high-quality media.
4. Make room comparison easy through filters.
5. Capture structured customer and booking information.
6. Notify hotel staff/business immediately when a booking request is created.
7. Give the business one central place to manage rooms, availability, bookings, reviews and website content.
8. Keep the system secure enough for production use.

## 1.3 Target Users

### Customer
A visitor who wants to:
- Discover the hotel
- Browse rooms
- Filter rooms
- Inspect room details
- Check availability
- Book a room
- View booking status/history
- Submit reviews after eligible stays

### Hotel Admin
The business owner/authorized operator who needs to:
- Add/edit/remove room types
- Upload room media
- Configure pricing
- Configure inventory
- Manage availability
- View bookings
- Update booking status
- View customer information
- Moderate reviews
- Configure WhatsApp notification settings
- Monitor operational statistics

## 1.4 User Problems

Current manual hotel booking workflows often make it difficult for customers to:
- Know which rooms are available
- Compare AC and Non-AC options
- See complete room photos
- Understand room amenities
- See trustworthy reviews
- Submit a structured booking request

The system should solve these problems without creating an unnecessarily complex booking experience.

## 1.5 Core Customer Features

### A. Landing page
Must include:
- Hero section
- Hotel name and positioning
- High-quality hotel/room imagery
- Search/booking widget
- Check-in date
- Check-out date
- Guest count
- CTA: Search Rooms / Check Availability
- Featured rooms
- Hotel amenities
- Why choose us
- Rating/review summary
- Location section
- Contact information
- WhatsApp CTA
- Footer

### B. Room browsing
Display real rooms from Firestore.

Each room card should show:
- Primary image
- Room name
- Room category
- AC/Non-AC
- Bed type
- Maximum guests
- Price per night
- Rating
- Review count
- Availability indicator
- View Details CTA

### C. Filters
Minimum required:
- Minimum price
- Maximum price
- AC / Non-AC
- Room category
- Guest capacity
- Optional amenities
- Availability for selected dates

Filtering must be dynamically connected to database values.

### D. Sorting
Include:
- Price: low to high
- Price: high to low
- Rating
- Popularity/review count

### E. Room detail page
Must include:
- Room title
- Image gallery
- Separate visual grouping for room images
- Toilet images
- Washroom images
- Price
- Room size
- Bed type
- Capacity
- AC/Non-AC
- Amenities
- Policies
- Availability
- Rating
- Review count
- Customer reviews
- Booking widget
- Similar rooms

### F. Booking form
Minimum customer data:
- Full name
- Mobile number
- Email
- Check-in
- Check-out
- Number of guests
- Selected room
- Number of rooms if inventory allows
- Special request/notes

Before final submission:
- Validate dates
- Validate guest limit
- Validate availability
- Calculate booking summary
- Show price breakdown
- Require customer acceptance of booking policy/terms

### G. Booking status
Each booking should have a clear state:
- PENDING
- CONFIRMED
- REJECTED
- CANCELLED
- COMPLETED
- EXPIRED

Do not mark a booking as confirmed merely because the user submitted the form.

### H. Customer account
Authentication is required for:
- Booking history
- Saved profile
- Review eligibility/history
- Managing active booking requests

Authentication options:
- Email/password
- Google Sign-In may be added as an optional enhancement

Firebase Authentication supports email/password and federated providers for web applications.

## 1.6 Review and Rating Requirements

Customers should be able to submit a review only when business rules confirm eligibility.

Review fields:
- Rating: 1–5
- Review title
- Review text
- Optional customer display name
- Created date
- Booking reference
- Room reference
- Verification status
- Moderation status

Recommended status:
- PENDING
- APPROVED
- REJECTED

Only approved reviews should appear publicly.

Average room rating must be calculated from approved reviews, not hard-coded.

## 1.7 Availability Requirements

Availability must be date-aware.

Minimum logic:
1. Customer selects check-in and check-out.
2. System finds the selected room's inventory.
3. System checks overlapping confirmed/pending bookings according to the booking policy.
4. System calculates remaining inventory.
5. Room is shown as available/unavailable.
6. Before final booking creation, availability is checked again.

The final availability check must happen server-side to reduce race conditions and prevent client-side manipulation.

## 1.8 WhatsApp Notification Requirement

When a booking request is successfully created:
- Generate a unique booking ID.
- Create booking record.
- Trigger server-side WhatsApp notification.
- Send the business a structured booking message.
- Store notification delivery state.

Example notification data:
- Booking ID
- Customer name
- Mobile
- Email
- Room
- AC/Non-AC
- Check-in
- Check-out
- Guests
- Number of rooms
- Estimated total
- Booking status
- Created time
- Customer notes

Recommended implementation:
**WhatsApp Business Platform / Cloud API through a secure backend service.**

Do not place WhatsApp access tokens, secrets, or API credentials in public frontend code.

Fallback option:
A `wa.me` click-to-chat button with a prefilled message can be provided for manual customer-to-business conversations, but this is not equivalent to a server-triggered notification.

## 1.9 Admin Dashboard

The admin dashboard should include:

### Dashboard
- Total booking requests
- Pending bookings
- Confirmed bookings
- Today's check-ins
- Today's check-outs
- Occupancy snapshot
- Room inventory snapshot
- Revenue/estimated booking value if the project later enables financial tracking
- Recent bookings

### Room management
- Create room
- Edit room
- Activate/deactivate room
- Set price
- Set AC/Non-AC
- Set room category
- Set capacity
- Set amenities
- Set inventory quantity
- Upload media to Cloudinary
- Reorder gallery images

### Booking management
- Search bookings
- Filter by status
- Filter by date
- View complete booking
- Confirm
- Reject
- Cancel
- Complete
- Add admin note

### Availability management
- Room inventory
- Block room/unit
- Unblock room/unit
- Maintenance block
- Manual availability override

### Review management
- View pending reviews
- Approve
- Reject
- Flag

### Settings
- Hotel information
- Business phone
- WhatsApp number/configuration
- Hotel address
- Check-in policy
- Check-out policy
- Cancellation policy
- Taxes/fees if later required
- Notification templates
- Contact information

## 1.10 Non-Functional Requirements

### Performance
- Fast first load
- Optimized images
- Responsive image delivery
- Lazy loading for non-critical media
- Avoid unnecessary client-side data fetching

### Security
- Never expose Cloudinary API secret
- Never expose WhatsApp API secret/token
- Protect admin operations with role-based authorization
- Validate every critical request server-side
- Use Firestore Security Rules
- Validate file type/size before upload
- Do not trust client-supplied prices
- Recalculate booking totals server-side
- Do not trust client-supplied admin roles
- Log important admin actions
- Add rate limiting where appropriate
- Protect booking endpoint against spam/abuse

### Accessibility
- Keyboard navigation
- Semantic HTML
- Visible focus states
- Alt text for images
- Good color contrast
- Proper form labels
- Error messages readable by screen readers

### SEO
Public pages should include:
- Page title
- Meta description
- Canonical URL
- Open Graph metadata
- Structured hotel/room data where appropriate
- Human-readable URLs
- Indexable room detail pages

## 1.11 Out-of-Scope for Initial Version

Do not add these unless explicitly requested:
- Online payment gateway
- Hotel marketplace with multiple hotel owners
- Multi-vendor settlement
- Flight/train booking
- Loyalty points
- Complex coupon engine
- AI chatbot
- Cryptocurrency payments

---

# 2. TRD — TECHNICAL REQUIREMENTS DOCUMENT

## 2.1 Recommended Architecture

```text
                         ┌───────────────────────┐
                         │      Customer        │
                         │  Browser / Mobile    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     Web Frontend      │
                         │   React / Next.js     │
                         └───────┬───────┬───────┘
                                 │       │
                      ┌──────────┘       └─────────────┐
                      ▼                                ▼
           ┌──────────────────┐              ┌──────────────────┐
           │ Firebase Auth    │              │ Firestore        │
           │ User identity    │              │ Application data │
           └──────────────────┘              └──────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │ Secure Server Layer │
                                          │ Cloud Functions/API │
                                          └───────┬───────┬─────┘
                                                  │       │
                                                  ▼       ▼
                                      ┌────────────────┐ ┌────────────────┐
                                      │   Cloudinary   │ │ WhatsApp API   │
                                      │ Room/media     │ │ Business alert │
                                      └────────────────┘ └────────────────┘
```

## 2.2 Frontend

Recommended:
- React + Next.js for production SEO-friendly pages
- TypeScript
- Responsive component architecture
- Form validation library
- Query/data layer such as TanStack Query if required
- Reusable UI components
- Route-level loading/error states

Do not mix multiple frontend frameworks.

## 2.3 Authentication

Use Firebase Authentication.

Required:
- Email/password
- Sign out
- Password reset
- Auth state persistence
- Protected routes

Optional:
- Google Sign-In

Important:
The frontend Firebase configuration is not the secret. Security must be enforced through Firebase Security Rules, backend authorization and secret management.

Firebase Authentication provides the web SDK for sign-in methods such as email/password and Google Sign-In.

## 2.4 Authorization

Use a role model:

```text
users/{uid}
  role:
    CUSTOMER
    ADMIN
```

Do not rely only on a frontend `role` field to secure admin routes.

Recommended:
- Firebase custom claims for admin authorization
- Firestore Security Rules
- Server-side verification for admin endpoints

## 2.5 Database

Recommended: Cloud Firestore.

Firestore should store:
- Users
- Rooms
- Bookings
- Reviews
- Settings
- Availability blocks
- Notification logs
- Audit logs

Cloudinary stores media; Firestore stores the media metadata/URLs/public IDs.

## 2.6 Media Storage

Use Cloudinary for:
- Room photos
- Toilet photos
- Washroom photos
- Hotel photos
- Optional review photos

Suggested folder structure:

```text
hotel/
  hotel-profile/
  rooms/
    {roomId}/
      cover/
      room/
      toilet/
      washroom/
  reviews/
    {reviewId}/
```

Important:
Cloudinary supports server-side authenticated uploads and client-side upload options. Never expose the Cloudinary API secret in browser/client code.

## 2.7 Booking Architecture

```text
Customer
   │
   ▼
Select dates + room
   │
   ▼
Client validation
   │
   ▼
Secure booking endpoint
   │
   ├── verify Firebase user
   ├── fetch room data
   ├── verify dates
   ├── verify capacity
   ├── verify inventory
   ├── calculate server-side price
   ├── create booking
   └── create notification job/log
            │
            ▼
       WhatsApp API
            │
            ▼
      Hotel Business
```

## 2.8 Price Calculation

The client should never be trusted for the final price.

Server-side calculation should derive:
- Nights
- Room base price
- Quantity
- Taxes/fees when configured
- Discounts only when officially configured

Formula:

```text
nights = checkOut - checkIn

subtotal =
  nightlyRoomPrice
  × nights
  × quantity

total =
  subtotal
  + configuredTaxes
  + configuredFees
  - configuredDiscounts
```

Store both:
- price snapshot at booking time
- current room price

This preserves historical booking accuracy.

## 2.9 Availability Logic

For a room with inventory quantity `N`:

```text
remainingInventory =
  N
  - overlappingConfirmedQuantity
  - overlappingPendingQuantity
  - blockedQuantity
```

The business may choose whether PENDING bookings hold inventory for a limited time.

Recommended:
- Pending reservation hold: configurable
- Expire stale pending bookings automatically

## 2.10 Environment Variables

Never commit production secrets.

Example:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_API_VERSION=
WHATSAPP_RECIPIENT_NUMBER=

ADMIN_ALERT_EMAIL=
```

The exact variable names can be adapted to the framework, but secrets must remain server-side.

## 2.11 Observability

Add:
- Application error logging
- Booking error logging
- WhatsApp delivery status
- Authentication errors
- Admin action audit logs
- Media upload failures

Do not log:
- Passwords
- API secrets
- access tokens
- full sensitive payment data if payment is added later

---

# 3. APP FLOW

## 3.1 High-Level Customer Flow

```text
LANDING PAGE
     │
     ├──────────────► Browse Rooms
     │                    │
     │                    ▼
     │              Apply Filters
     │                    │
     │                    ▼
     │              Room Details
     │                    │
     │                    ▼
     │           Select Check-in/Out
     │                    │
     │                    ▼
     │            Check Availability
     │                    │
     │          ┌─────────┴─────────┐
     │          │                   │
     │       Available           Unavailable
     │          │                   │
     │          ▼                   ▼
     │      Book Now            Select Another
     │          │
     │          ▼
     │      Sign In / Sign Up
     │          │
     │          ▼
     │     Booking Details
     │          │
     │          ▼
     │      Final Review
     │          │
     │          ▼
     │    Secure Booking Create
     │          │
     │          ▼
     │    Booking ID Generated
     │          │
     │          ▼
     │   WhatsApp Notification
     │          │
     │          ▼
     │     Booking Pending
     │          │
     │          ▼
     │    Admin Confirmation
```

## 3.2 Authentication Flow

```text
Sign Up
  │
  ├── Email + Password
  │
  ▼
Firebase Auth Account
  │
  ▼
Create users/{uid}
  │
  ▼
role = CUSTOMER
  │
  ▼
Customer Dashboard
```

## 3.3 Admin Flow

```text
Admin Login
   │
   ▼
Firebase Authentication
   │
   ▼
Verify ADMIN authorization
   │
   ├───────────────┬────────────────┬─────────────────┐
   ▼               ▼                ▼                 ▼
Dashboard       Rooms           Bookings           Reviews
   │               │                │                 │
   │               ▼                ▼                 ▼
   │           Cloudinary       Status update      Moderate
   │           media            / notes            reviews
   │
   ▼
Settings / WhatsApp / Policies
```

## 3.4 Booking State Flow

```text
PENDING
   │
   ├──► CONFIRMED ───► COMPLETED
   │
   ├──► REJECTED
   │
   └──► EXPIRED

CONFIRMED
   │
   └──► CANCELLED
```

## 3.5 Review Flow

```text
Completed eligible booking
          │
          ▼
     Write Review
          │
          ▼
      PENDING
          │
      ┌───┴───┐
      ▼       ▼
  APPROVED  REJECTED
      │
      ▼
 Public Review + Rating
```

---

# 4. UI/UX BRIEF

## 4.1 Visual Direction

Design language:
- Premium hotel aesthetic
- Elegant typography
- Strong hero imagery
- Spacious layout
- Clean cards
- Subtle shadows
- Smooth transitions
- High-quality image presentation
- Strong mobile-first responsiveness

The interface should feel trustworthy rather than overly flashy.

## 4.2 Color System

Create a design token system instead of hard-coding colors in individual components.

Example token categories:
- Primary
- Primary hover
- Secondary
- Background
- Surface
- Text
- Muted text
- Border
- Success
- Warning
- Error

The final palette may be adapted to the hotel's branding.

## 4.3 Typography

Use:
- One display font for headings
- One highly readable body font

Keep:
- H1 visually dominant
- H2 section-based
- Body text comfortable to read
- Consistent line height

## 4.4 Landing Page Sections

Recommended order:

1. Sticky navigation
2. Hero/search section
3. Featured rooms
4. Hotel highlights
5. Amenities
6. Room categories
7. Customer ratings/reviews
8. Gallery
9. Location
10. WhatsApp/contact CTA
11. Footer

## 4.5 Room Card Design

Each card:
- Large image
- Favorite/bookmark button if enabled later
- Room title
- AC/Non-AC badge
- Bed type
- Capacity
- Rating
- Review count
- Price
- “View Room” button

Avoid clutter.

## 4.6 Room Detail Layout

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ Room Title / Breadcrumbs                                   │
├───────────────────────────────┬─────────────────────────────┤
│                               │                             │
│        IMAGE GALLERY          │       BOOKING PANEL         │
│                               │       Price                 │
│  room / toilet / washroom     │       dates                │
│                               │       guests                │
│                               │       availability          │
│                               │       Book Now              │
├───────────────────────────────┴─────────────────────────────┤
│ Amenities                                                  │
│ Description                                                │
│ Policies                                                   │
│ Reviews + Rating                                          │
│ Similar Rooms                                              │
└─────────────────────────────────────────────────────────────┘
```

Mobile:
- Gallery first
- Core price/availability
- Booking CTA
- Room information
- Amenities
- Reviews
- Policies
- Similar rooms

## 4.7 Booking UX

Use a clear step sequence:

```text
Dates → Guests → Room availability → Customer details → Review → Submit
```

Show:
- Number of nights
- Price per night
- Quantity
- Subtotal
- Fees/taxes if configured
- Total
- Selected dates
- Cancellation policy

## 4.8 Interaction Design

Include:
- Skeleton loaders
- Button loading states
- Image loading placeholders
- Empty states
- Clear form errors
- Success states
- Error retry states
- Confirmation modals for destructive admin actions

## 4.9 Mobile UX

Must support:
- Small Android phones
- iPhones
- Tablets
- Desktop

Critical controls must remain touch-friendly.

---

# 5. BACKEND SCHEMA

## 5.1 Collection Overview

```text
users
rooms
bookings
reviews
availabilityBlocks
settings
notificationLogs
auditLogs
```

Optional:
```text
roomCategories
amenities
favorites
contactMessages
```

## 5.2 users

```text
users/{uid}

uid
fullName
email
phone
photoURL
role
accountStatus
createdAt
updatedAt
lastLoginAt
```

Allowed role values:
```text
CUSTOMER
ADMIN
```

## 5.3 rooms

```text
rooms/{roomId}

name
slug
description
shortDescription
categoryId
categoryName
isAC
bedType
roomSize
maxGuests
inventoryQuantity
pricePerNight
currency
amenities[]
policies[]
status
featured
coverImage
gallery[]
toiletImages[]
washroomImages[]
averageRating
reviewCount
createdAt
updatedAt
```

### Gallery object

```text
{
  publicId,
  secureUrl,
  width,
  height,
  altText,
  order
}
```

Cloudinary should be the source of media files; Firestore should maintain the references needed by the application.

## 5.4 bookings

```text
bookings/{bookingId}

bookingId
userId

customer:
  fullName
  email
  phone

roomId
roomSnapshot:
  name
  slug
  isAC
  pricePerNight
  maxGuests

checkIn
checkOut
nights
guests
roomQuantity

pricing:
  pricePerNight
  subtotal
  taxes
  fees
  discount
  total
  currency

status
customerNote
adminNote

whatsapp:
  status
  messageId
  lastAttemptAt
  errorCode

createdAt
updatedAt
confirmedAt
cancelledAt
completedAt
```

## 5.5 reviews

```text
reviews/{reviewId}

bookingId
userId
roomId
customerName
rating
title
comment
images[]
isVerifiedStay
status
createdAt
updatedAt
moderatedAt
moderatedBy
```

## 5.6 availabilityBlocks

```text
availabilityBlocks/{blockId}

roomId
startDate
endDate
quantity
reason
status
createdBy
createdAt
```

Reasons:
```text
MAINTENANCE
PRIVATE_USE
TEMPORARY_BLOCK
OTHER
```

## 5.7 settings

Use controlled configuration documents.

Example:

```text
settings/hotel

hotelName
description
phone
email
whatsappNumber
address
checkInTime
checkOutTime
cancellationPolicy
bookingPolicy
currency
timezone
updatedAt
```

```text
settings/notifications

whatsappEnabled
notificationMode
bookingTemplateName
recipientNumber
updatedAt
```

Do not store secrets inside general public settings documents.

## 5.8 notificationLogs

```text
notificationLogs/{logId}

type
bookingId
channel
recipient
provider
status
providerMessageId
attemptCount
lastAttemptAt
errorMessage
createdAt
updatedAt
```

## 5.9 auditLogs

```text
auditLogs/{logId}

actorUserId
actorRole
action
entityType
entityId
before
after
ipHashOrSafeMetadata
createdAt
```

Store only the minimum information needed for operational auditing.

## 5.10 Firestore Security Model

Public:
- Read approved rooms
- Read approved reviews
- Read public hotel settings

Customer:
- Read/write own customer profile
- Read own bookings
- Create own booking requests through controlled backend operation
- Create eligible review submissions

Admin:
- Manage rooms
- Manage bookings
- Manage reviews
- Manage availability
- Manage safe settings

Critical booking mutations should use secure server-side logic when atomic validation is required.

---

# 6. IMPLEMENTATION PLAN

## Phase 0 — Requirements Freeze

### Tasks
1. Confirm hotel name and branding.
2. Confirm room categories.
3. Confirm room inventory model.
4. Confirm cancellation rules.
5. Confirm whether pending bookings hold inventory.
6. Confirm WhatsApp notification method.
7. Confirm admin users.
8. Confirm deployment target.

### Deliverables
- Final PRD
- Final design direction
- Final data model decisions

### Exit criteria
No unresolved business logic remains in booking availability and booking status.

---

## Phase 1 — Project Setup

### Tasks
1. Create project repository.
2. Initialize frontend.
3. Add TypeScript.
4. Configure linting/formatting.
5. Configure environment variable structure.
6. Create folder architecture.
7. Add Firebase SDK.
8. Add Firestore SDK.
9. Add Firebase Authentication.
10. Add secure backend/server function structure.
11. Add Cloudinary integration package/configuration.
12. Add form validation.
13. Add reusable UI components.

### Suggested structure

```text
src/
  app/
    (public)/
    auth/
    rooms/
    booking/
    account/
    admin/
  components/
    ui/
    layout/
    room/
    booking/
    review/
    admin/
  lib/
    firebase/
    cloudinary/
    auth/
    booking/
    validation/
    utils/
  services/
    rooms/
    bookings/
    reviews/
    notifications/
  types/
  hooks/
  config/

functions/
  src/
    auth/
    bookings/
    whatsapp/
    cloudinary/
    reviews/
    admin/
```

### Deliverables
- Running app
- Clean repo
- Environment template
- Base architecture
- Firebase connected

---

## Phase 2 — Authentication

### Tasks
1. Configure Firebase Authentication.
2. Build sign-up.
3. Build sign-in.
4. Build sign-out.
5. Build forgot password.
6. Build auth state listener.
7. Create user profile document.
8. Add protected routes.
9. Add admin authorization.
10. Add session/error states.

### Deliverables
- Working customer authentication
- Protected customer pages
- Protected admin route

### Acceptance test
A CUSTOMER cannot access ADMIN pages even by directly entering the URL.

---

## Phase 3 — Database

### Tasks
1. Create Firestore collections.
2. Create indexes required by actual queries.
3. Write Firestore Security Rules.
4. Add validation for fields.
5. Seed only realistic development data.
6. Create admin initialization mechanism.
7. Test unauthorized reads/writes.

### Deliverables
- Production-ready schema
- Security Rules
- Index configuration
- Database test dataset

---

## Phase 4 — Core UI

### Tasks
1. Create global design system.
2. Create responsive navbar.
3. Create footer.
4. Create hero section.
5. Create room cards.
6. Create filters.
7. Create room detail layout.
8. Create review cards.
9. Create reusable modal/drawer components.
10. Create loading and empty states.

### Deliverables
- Complete responsive public UI
- Reusable component library
- Mobile/desktop layouts

---

## Phase 5 — Room Management

### Tasks
1. Connect room cards to Firestore.
2. Load real rooms dynamically.
3. Implement search/filter/sort.
4. Create room detail query.
5. Load Cloudinary images.
6. Build gallery.
7. Build room amenities.
8. Build ratings.
9. Build similar-room recommendations.

### Deliverables
- Real room catalog
- Real-time/database-backed room details
- Cloudinary-powered media gallery

### Acceptance test
Changing a room price or image in admin reflects on the public website without editing frontend source code.

---

## Phase 6 — Availability Engine

### Tasks
1. Implement date selection.
2. Validate check-in/check-out.
3. Query overlapping bookings.
4. Query inventory blocks.
5. Calculate remaining quantity.
6. Add server-side availability validation.
7. Add stale pending booking expiration.
8. Handle concurrent booking attempts.

### Deliverables
- Date-based availability
- Server-side booking validation
- Inventory protection

### Acceptance test
Two simultaneous requests cannot incorrectly sell more rooms than the configured inventory.

---

## Phase 7 — Booking System

### Tasks
1. Build booking form.
2. Require Firebase authentication.
3. Load authenticated customer information.
4. Display booking summary.
5. Calculate price server-side.
6. Create booking record.
7. Generate booking ID.
8. Add booking status.
9. Add customer booking history.
10. Add booking detail page.

### Deliverables
- End-to-end booking workflow
- Booking history
- Booking status system

---

## Phase 8 — WhatsApp Integration

### Recommended production architecture

```text
Booking created
      │
      ▼
Secure backend function
      │
      ▼
Build template/message payload
      │
      ▼
WhatsApp Business Platform / Cloud API
      │
      ▼
Hotel WhatsApp recipient
      │
      ▼
Store delivery result
```

### Tasks
1. Create/configure WhatsApp Business Platform resources.
2. Store secrets only in server environment/secret manager.
3. Create approved notification template if required by the selected WhatsApp flow.
4. Create booking notification function.
5. Add retry handling.
6. Add notification logs.
7. Add duplicate prevention/idempotency.
8. Add admin notification status.

### Deliverables
- Booking WhatsApp notification
- Delivery/error status
- Notification log

### Acceptance test
A successful booking creates exactly one logical booking notification, even if the frontend retries.

---

## Phase 9 — Cloudinary Media System

### Tasks
1. Configure Cloudinary product environment.
2. Configure upload strategy.
3. Separate image folders by entity.
4. Upload room cover images.
5. Upload room gallery.
6. Upload toilet images.
7. Upload washroom images.
8. Store Cloudinary public IDs and URLs.
9. Add delete/replacement logic.
10. Generate optimized delivery URLs.
11. Add file validation.

### Security requirement
Never expose `CLOUDINARY_API_SECRET` in frontend code.

### Deliverables
- Admin image uploader
- Cloudinary media management
- Optimized image rendering

---

## Phase 10 — Reviews and Ratings

### Tasks
1. Verify booking eligibility.
2. Build review form.
3. Create moderation workflow.
4. Calculate aggregate rating.
5. Display approved reviews.
6. Display rating distribution if desired.
7. Prevent duplicate review submission per eligible booking policy.

### Deliverables
- Verified review pipeline
- Dynamic rating calculations

---

## Phase 11 — Admin Dashboard

### Tasks
1. Dashboard overview.
2. Booking table.
3. Booking detail drawer/page.
4. Status updates.
5. Room CRUD.
6. Inventory management.
7. Availability blocks.
8. Review moderation.
9. Hotel settings.
10. WhatsApp settings/status.
11. Audit logs.

### Deliverables
- Fully operational admin dashboard

---

## Phase 12 — Security Hardening

### Required checks

#### Authentication
- Password reset works.
- Protected routes work.
- Admin claims are enforced.
- Unauthorized users cannot access admin operations.

#### Database
- Security Rules tested.
- Customers cannot modify another customer's booking.
- Customers cannot promote themselves to ADMIN.
- Public users cannot write reviews directly as approved.
- Public users cannot modify room prices.

#### Booking
- Client-supplied total ignored.
- Client-supplied room price ignored.
- Availability rechecked server-side.
- Duplicate booking attempts controlled.
- Invalid date ranges rejected.

#### Media
- File type validation
- File size validation
- Safe upload presets
- Cloudinary secrets protected

#### WhatsApp
- Tokens server-side only
- Rate limits/retry controls
- Duplicate notification protection
- Delivery errors logged safely

#### Application
- Dependency audit
- XSS protection
- CSRF considerations where relevant
- Input sanitization
- Secure headers
- Error messages do not reveal secrets

### Deliverables
- Security checklist
- Rules tests
- Dependency/security report
- Production environment review

---

## Phase 13 — Testing

### Unit tests
Test:
- Price calculator
- Night calculator
- Availability calculation
- Booking status transitions
- Review eligibility
- Filter logic

### Integration tests
Test:
- Firebase Auth
- Firestore
- Booking creation
- WhatsApp notification
- Cloudinary upload flow

### End-to-end tests

#### Scenario 1
Customer:
Home → Search → Filter → Room Detail → Book → Booking Created → WhatsApp Notification

#### Scenario 2
Customer:
Sign up → Sign in → View booking history → Open booking

#### Scenario 3
Admin:
Login → Add Room → Upload images → Set price → Publish → Verify public page

#### Scenario 4
Admin:
Receive booking → Confirm → Customer sees CONFIRMED

#### Scenario 5
Inventory:
One available room → first booking consumes it → second overlapping request becomes unavailable

### Responsive testing
Test:
- 320px+
- 375px
- 414px
- Tablet
- Desktop
- Large desktop

### Deliverables
- Automated test suite
- Manual QA report
- Bug list
- Regression test results

---

## Phase 14 — Performance and SEO

### Tasks
1. Optimize images.
2. Lazy-load non-critical images.
3. Reduce JavaScript bundle size.
4. Improve page loading.
5. Add metadata.
6. Add sitemap.
7. Add robots configuration.
8. Add structured data where appropriate.
9. Validate public room URLs.
10. Test Core Web Vitals.

### Deliverables
- Performance report
- SEO checklist
- Optimized production build

---

## Phase 15 — Final Polish

### Tasks
1. Fix visual inconsistencies.
2. Improve empty states.
3. Improve error messaging.
4. Add booking confirmation UX.
5. Verify WhatsApp message formatting.
6. Verify all admin actions.
7. Verify all media.
8. Verify legal/policy pages.
9. Remove debug logs.
10. Remove test data.
11. Review environment variables.
12. Verify production security.
13. Create backup/export procedure.

### Deliverables
- Release candidate
- Final QA report
- Production deployment checklist
- Admin handover documentation

---

# 7. RECOMMENDED ROUTES

## Public

```text
/
 /rooms
 /rooms/[slug]
 /about
 /contact
 /reviews
 /policies
 /login
 /register
 /forgot-password
```

## Customer

```text
/account
/account/profile
/account/bookings
/account/bookings/[bookingId]
/account/reviews
```

## Admin

```text
/admin
/admin/rooms
/admin/rooms/new
/admin/rooms/[id]
/admin/bookings
/admin/bookings/[id]
/admin/availability
/admin/reviews
/admin/settings
/admin/notifications
/admin/audit-logs
```

---

# 8. API / SERVER FUNCTION CONTRACTS

The exact implementation can use Firebase callable functions, HTTPS functions, Next.js server routes, or another secure server layer. The logical contract should remain equivalent.

## Create booking

```text
POST /api/bookings
```

Request:
```json
{
  "roomId": "ROOM_ID",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "guests": 2,
  "roomQuantity": 1,
  "customerNote": "Optional note"
}
```

Server must:
1. Authenticate user.
2. Load room.
3. Validate room active status.
4. Validate dates.
5. Validate guests.
6. Validate inventory.
7. Calculate final price.
8. Create booking.
9. Trigger notification.
10. Return booking ID and server-calculated summary.

## Update booking status

```text
PATCH /api/admin/bookings/{bookingId}
```

Only ADMIN.

## Upload media

```text
POST /api/admin/media
```

Only authorized admin.

## Submit review

```text
POST /api/reviews
```

Server must verify the review eligibility rules.

---

# 9. ERROR HANDLING REQUIREMENTS

Every critical operation should handle:

### Booking
- Room not found
- Room unavailable
- Invalid date
- Invalid guest count
- Authentication failure
- Firestore failure
- Duplicate submission
- Notification failure

### Media
- Unsupported type
- File too large
- Upload timeout
- Cloudinary failure
- Invalid public ID

### WhatsApp
- API authentication error
- Template error
- Invalid recipient
- Rate limit
- Provider outage
- Network timeout

The user should receive friendly messages. Internal logs may contain technical details.

---

# 10. ANTI-GRAVITY EXECUTION RULES

These instructions are mandatory for the AI coding agent.

## Scope control

1. Read the complete specification before changing code.
2. Do not invent new business requirements.
3. Do not remove working functionality.
4. Do not rewrite unrelated modules merely for style.
5. Do not replace working technologies unless explicitly required.
6. Preserve existing route behavior unless a route change is necessary.
7. Keep changes modular.
8. Before modifying shared components, identify every page using them.
9. Never overwrite production credentials.
10. Never hard-code API keys, tokens, passwords or secrets.

## Data rules

1. Do not create fake production room data.
2. Do not hard-code ratings.
3. Do not hard-code booking totals.
4. Do not trust browser-supplied pricing.
5. Always read the authoritative room record.
6. Always revalidate availability server-side.

## Security rules

1. Firebase Security Rules are mandatory.
2. Admin authorization must be server-verifiable.
3. Cloudinary API secret is backend-only.
4. WhatsApp access tokens are backend-only.
5. Never send secrets to the browser.
6. Do not expose stack traces to end users.
7. Validate all user-controlled input.
8. Add rate limiting/abuse protection to booking and review endpoints as appropriate.

## Development rules

Before every major phase:
- inspect the existing project structure
- identify dependencies
- reuse existing components where appropriate
- document changed files
- run lint/type-check/tests
- fix build errors before continuing

After every phase:
- verify affected routes manually
- verify database reads/writes
- verify permissions
- verify mobile layout
- verify no unrelated regression

## Completion rule

Do not claim a feature is complete unless:
- implementation exists
- UI works
- database integration works
- validation works
- security rules/authorization are addressed
- error states exist
- loading states exist
- tests or explicit manual verification have been performed

---

# 11. FINAL ACCEPTANCE CHECKLIST

## Customer
- [ ] Landing page loads correctly
- [ ] Rooms load from database
- [ ] Filters work
- [ ] Sort works
- [ ] Room details work
- [ ] Images come from Cloudinary
- [ ] Toilet/washroom gallery works
- [ ] Ratings are dynamic
- [ ] Reviews are dynamic
- [ ] Authentication works
- [ ] Date availability works
- [ ] Booking works
- [ ] Booking history works
- [ ] Booking status updates appear correctly
- [ ] WhatsApp business notification works

## Admin
- [ ] Admin authentication works
- [ ] Room CRUD works
- [ ] Cloudinary media management works
- [ ] Pricing works
- [ ] Inventory works
- [ ] Availability blocks work
- [ ] Booking management works
- [ ] Review moderation works
- [ ] Settings work
- [ ] WhatsApp notification log works
- [ ] Audit logging works

## Security
- [ ] Secrets are not exposed
- [ ] Firestore Security Rules tested
- [ ] Admin authorization enforced
- [ ] Booking price server-validated
- [ ] Booking availability server-validated
- [ ] Customer data access isolated
- [ ] Upload restrictions implemented
- [ ] Dependency/security audit completed

## Production
- [ ] Environment variables configured
- [ ] Production Firebase project selected
- [ ] Production Cloudinary environment selected
- [ ] WhatsApp production credentials configured
- [ ] Domain connected
- [ ] HTTPS verified
- [ ] Backup procedure documented
- [ ] Error monitoring enabled
- [ ] Final QA approved

---

# 12. BUILD ORDER SUMMARY

The AI development agent must execute in this order:

```text
1. Requirements Freeze
        ↓
2. Project Setup
        ↓
3. Firebase Authentication
        ↓
4. Firestore Schema + Security Rules
        ↓
5. Global UI System
        ↓
6. Room Catalog
        ↓
7. Cloudinary Media
        ↓
8. Availability Engine
        ↓
9. Booking System
        ↓
10. WhatsApp Notification
        ↓
11. Reviews + Ratings
        ↓
12. Admin Dashboard
        ↓
13. Security Hardening
        ↓
14. Testing
        ↓
15. Performance + SEO
        ↓
16. Final Polish
        ↓
17. Production Deployment
```

# 13. IMPORTANT IMPLEMENTATION DECISIONS

1. **Cloudinary** is the intended media platform.
2. **Firebase Authentication** handles customer identity.
3. **Firestore** stores application data.
4. **Server-side logic** performs critical booking validation.
5. **WhatsApp Business Platform/Cloud API** is the recommended automated business notification mechanism.
6. **No online payment gateway is required by the current scope.**
7. The booking system must use real availability and inventory logic.
8. Admin operations must be protected.
9. Ratings and reviews must be dynamically calculated from approved records.
10. All important secrets stay outside browser-executed code.

---

# 14. OFFICIAL TECHNICAL REFERENCES

Firebase Authentication:
- https://firebase.google.com/docs/auth/web/start

Cloudinary Upload API:
- https://cloudinary.com/documentation/image_upload_api_reference
- https://cloudinary.com/documentation/upload_images

For WhatsApp, use the current official Meta WhatsApp Business Platform / Cloud API documentation and credentials flow applicable to the production account.

