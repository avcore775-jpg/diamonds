# API Documentation - Luxe Diamonds E-Commerce

## Authentication System

### Overview
The authentication system uses NextAuth.js with JWT sessions and supports credential-based authentication with email verification via Resend.

### Environment Variables Required
```env
# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key"

# JWT
JWT_SECRET="your-jwt-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Luxe Diamonds <noreply@luxediamonds.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

---

## Authentication Endpoints

### 1. Sign Up
**POST** `/api/auth/signup`

Creates a new user account and sends email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "name": "John Doe",
  "phone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "message": "Account created successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Sign In (via NextAuth)
**POST** `/api/auth/signin`

Uses NextAuth credentials provider.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### 3. Email Verification
**GET** `/api/auth/verify-email?token={token}`

Verifies user email with token from email link.

**POST** `/api/auth/verify-email`

Resend verification email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### 4. Password Reset
**POST** `/api/auth/reset-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**PUT** `/api/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

---

## User API Endpoints

All user endpoints require authentication via NextAuth session.

### 1. User Profile

#### Get Profile
**GET** `/api/users/me`

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "emailVerified": "2024-01-01T00:00:00Z",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "addresses": []
}
```

#### Update Profile
**PATCH** `/api/users/me`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+9876543210"
}
```

### 2. User Orders

#### Get Order History
**GET** `/api/users/me/orders?page=1&limit=10&status=DELIVERED`

**Response:**
```json
{
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Get Order Details
**GET** `/api/users/me/orders/{orderId}`

Returns detailed order information including items and shipping details.

### 3. Shopping Cart

#### Get Cart
**GET** `/api/users/me/cart`

**Response:**
```json
{
  "id": "cart_id",
  "items": [
    {
      "id": "item_id",
      "quantity": 2,
      "product": {
        "id": "product_id",
        "name": "Diamond Ring",
        "price": 299900,
        "image": "url",
        "stock": 5
      }
    }
  ],
  "subtotal": 599800,
  "discount": 0,
  "shipping": 0,
  "tax": 47984,
  "total": 647784
}
```

#### Add to Cart
**POST** `/api/users/me/cart`

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

#### Update Cart Item
**PATCH** `/api/users/me/cart/{itemId}`

**Request Body:**
```json
{
  "quantity": 3
}
```

#### Remove from Cart
**DELETE** `/api/users/me/cart/{itemId}`

### 4. Address Management

#### Get Addresses
**GET** `/api/users/me/addresses`

Returns all user addresses sorted by default status and creation date.

#### Add Address
**POST** `/api/users/me/addresses`

**Request Body:**
```json
{
  "type": "SHIPPING", // or "BILLING"
  "isDefault": true,
  "name": "John Doe",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US",
  "phone": "+1234567890"
}
```

#### Update Address
**PATCH** `/api/users/me/addresses/{addressId}`

Update any field of the address.

#### Delete Address
**DELETE** `/api/users/me/addresses/{addressId}`

---

## Existing API Endpoints

### Products
- **GET** `/api/products` - List products with filters
- **GET** `/api/products/{id}` - Get product details
- **GET** `/api/search` - Search products

### Cart (Legacy - Use /api/users/me/cart instead)
- **GET** `/api/cart` - Get cart items
- **POST** `/api/cart` - Add to cart
- **DELETE** `/api/cart?itemId={id}` - Remove item

### Checkout
- **POST** `/api/checkout` - Create Stripe checkout session

### Orders
- **GET** `/api/orders` - Get user orders
- **GET** `/api/orders/{orderId}` - Get order details

### Admin Endpoints (Require Admin Role)
- **GET/PUT** `/api/admin/orders/{id}` - Manage orders
- **GET/PUT/DELETE** `/api/admin/users/{id}` - Manage users

### Webhooks
- **POST** `/api/webhooks/stripe` - Stripe payment webhook

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Security Features

1. **Password Security**: Passwords are hashed using bcrypt with 12 salt rounds
2. **Email Verification**: Required for full account access
3. **Token Expiration**: 
   - Email verification: 24 hours
   - Password reset: 2 hours
   - Session: 30 days
4. **Rate Limiting**: Implemented on authentication endpoints
5. **Input Validation**: Using Zod schemas
6. **SQL Injection Protection**: Via Prisma ORM
7. **CSRF Protection**: Via NextAuth
8. **Stock Management**: Atomic transactions prevent overselling

---

## Testing the API

### Create a Test User
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

### Sign In
Use NextAuth sign-in page at `/signin` or make API call to `/api/auth/signin`

### Test Protected Endpoint
```bash
curl http://localhost:3001/api/users/me \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## Integration with Frontend

The API is designed to work seamlessly with the existing Next.js frontend:

1. **Authentication**: Use `next-auth/react` hooks
   - `useSession()` - Get current session
   - `signIn()` - Sign in user
   - `signOut()` - Sign out user

2. **API Client**: Located at `/src/lib/api/client.ts`
   - Pre-configured axios instance
   - Automatic error handling
   - TypeScript types included

3. **Protected Routes**: Wrap components with authentication check
   ```tsx
   const { data: session, status } = useSession()
   if (status === "loading") return <Loading />
   if (!session) return <SignIn />
   ```

---

## Notes

- All prices are stored in cents (multiply by 100 when saving, divide by 100 when displaying)
- Free shipping on orders over $1000 (100000 cents)
- Tax rate is 8%
- Cart items are automatically reserved from stock
- Email verification is required for checkout
- Resend API is used for transactional emails