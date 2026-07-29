# Production-Ready Enterprise Poster E-Commerce Platform

An enterprise-grade Full-Stack Poster E-Commerce & Custom Artwork Printing Platform built using **Next.js 15 (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **Cloudinary**, **Razorpay**, **Shiprocket**, and **TailwindCSS**.

---

## Key Highlights

- **Zero-Hardcode Dynamic CMS Hierarchy**:
  Categories, SubCategories, Collections, and Posters are completely database-driven and created via the Admin CMS without modifying a single line of source code. Dynamic routing dynamically resolves URLs like `/[category]`, `/[category]/[subcategory]`, and `/[category]/[subcategory]/[collection]`.
- **Role-Based Access Control (RBAC)**:
  Granular permission management for `SUPER_ADMIN`, `ADMIN`, `STAFF`, and `CUSTOMER`. Protected routes enforced via Next.js Middleware.
- **Custom Artwork Printing Portal**:
  Allows customers to upload artwork with **strict 5 MB minimum to 50 MB maximum file size validation**. High-resolution artwork is saved in Cloudinary without compression, web preview thumbnails are auto-generated, and admin approval/rejection workflows track review history.
- **Pluggable Payment & Shipping Architecture**:
  - Payment abstraction layer (`IPaymentProvider`) configured with Razorpay, HMAC SHA-256 webhook verification, and fallback stub providers.
  - Shipping abstraction layer (`IShippingProvider`) integrated with Shiprocket for Chennai local and All-India express delivery tracking.
- **Tax PDF/HTML Invoices**:
  Automatic GST 18% tax calculation, invoice numbering (`INV-XXXXXX`), and printable tax invoices.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components, Streaming) |
| **Language** | TypeScript (Strict type safety) |
| **Database** | PostgreSQL + Prisma ORM (25+ Relational Models) |
| **Storage** | Cloudinary (Original Artwork & Image Optimization) |
| **Authentication** | NextAuth.js (JWT Sessions, bcrypt hashing, RBAC) |
| **Payments** | Razorpay (Pluggable `IPaymentProvider`) |
| **Shipping** | Shiprocket (Pluggable `IShippingProvider`) |
| **Styling** | Vanilla CSS, TailwindCSS, Glassmorphism design |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in required variables:
```bash
DATABASE_URL="postgresql://poster_admin:secure_password@localhost:5432/poster_db?schema=public"
NEXTAUTH_SECRET="enterprise_nextauth_jwt_secret_token_key"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
RAZORPAY_KEY_ID="rzp_test_key"
RAZORPAY_KEY_SECRET="rzp_test_secret"
```

### 3. Database Migration & Prisma Generation
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to access the storefront.

---

## Running Tests & Type Checks

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Jest unit test suite
npm test
```

---

## License
Enterprise Proprietary & Copyleft Free.
