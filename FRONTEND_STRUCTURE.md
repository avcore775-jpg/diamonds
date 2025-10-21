# Frontend Structure - Jewelry E-Commerce

## 📁 Folder Structure
```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout with navigation
│   ├── globals.css          # Global styles
│   │
│   ├── products/            # Products section
│   │   ├── page.tsx         # Products listing page
│   │   └── [id]/           
│   │       └── page.tsx     # Product detail page
│   │
│   ├── cart/               # Shopping cart
│   │   └── page.tsx        # Cart page
│   │
│   ├── checkout/           # Checkout process
│   │   └── page.tsx        # Checkout page
│   │
│   ├── orders/             # User orders
│   │   ├── page.tsx        # Orders list
│   │   └── [id]/
│   │       └── page.tsx    # Order detail
│   │
│   ├── auth/               # Authentication
│   │   ├── signin/
│   │   │   └── page.tsx    # Sign in page
│   │   └── signup/
│   │       └── page.tsx    # Sign up page
│   │
│   └── profile/            # User profile
│       └── page.tsx        # Profile page
│
├── components/             # Reusable components
│   ├── layout/
│   │   ├── Header.tsx      # Site header with navigation
│   │   ├── Footer.tsx      # Site footer
│   │   └── Navigation.tsx  # Navigation menu
│   │
│   ├── products/
│   │   ├── ProductCard.tsx     # Product card for grid
│   │   ├── ProductGrid.tsx     # Products grid
│   │   └── ProductDetail.tsx   # Product detail view
│   │
│   ├── cart/
│   │   ├── CartItem.tsx        # Single cart item
│   │   └── CartSummary.tsx     # Cart total summary
│   │
│   └── ui/                     # UI components
│       ├── Button.tsx          # Button component
│       ├── Input.tsx           # Input component
│       └── Card.tsx            # Card component
│
└── lib/                    # Utilities
    ├── api.ts              # API calls
    └── utils.ts            # Helper functions
```

## 📄 Page Descriptions

### 1. **Homepage** (`/`)
- Hero section with featured product
- Featured products grid (6-8 products)
- Categories showcase
- Newsletter signup

### 2. **Products Page** (`/products`)
- Search bar
- Filter sidebar (price, category, etc.)
- Products grid
- Pagination

### 3. **Product Detail** (`/products/[id]`)
- Product images
- Product info (name, price, description)
- Add to cart button
- Related products

### 4. **Cart** (`/cart`)
- Cart items list
- Quantity adjustment
- Remove items
- Cart summary with total
- Checkout button

### 5. **Checkout** (`/checkout`)
- Shipping address form
- Payment method
- Order summary
- Place order button

### 6. **Authentication** (`/auth/signin`, `/auth/signup`)
- Simple forms for sign in/sign up
- Email and password fields

### 7. **Profile** (`/profile`)
- User information
- Order history
- Address book
- Settings

### 8. **Orders** (`/orders`)
- List of user's orders
- Order status
- Order details link

## 🎨 Design Principles
- **Minimal & Clean**: Focus on products
- **White Background**: Clean, professional look
- **Simple Navigation**: Easy to find products
- **Mobile Responsive**: Works on all devices
- **Fast Loading**: Optimized performance