# Enterprise Developer Guide

## System Overview

This application is built on Next.js 15 App Router, TypeScript, Prisma ORM, PostgreSQL, Cloudinary, Razorpay, and Shiprocket.

---

## Clean Architecture & Design Patterns

### 1. Repository Pattern
Data queries are isolated into specialized repository classes:
- [CategoryRepository](file:///e:/poster/lib/repositories/category.repository.ts)
- [PosterRepository](file:///e:/poster/lib/repositories/poster.repository.ts)
- [CartRepository](file:///e:/poster/lib/repositories/cart.repository.ts)
- [OrderRepository](file:///e:/poster/lib/repositories/order.repository.ts)
- [CustomPosterRepository](file:///e:/poster/lib/repositories/custom-poster.repository.ts)

### 2. Pluggable Service Abstractions
Payment gateways (`IPaymentProvider`) and shipping logistics (`IShippingProvider`) use interface contracts so new providers can be plugged in without changing domain logic.

---

## How to Add a New Category / SubCategory
1. Open Admin CMS at `/admin/categories` or `/admin/subcategories`.
2. Click **Create Category**. Fill in Name and Description.
3. The frontend storefront dynamically generates URLs at `/[category]` or `/[category]/[subcategory]` without source code changes.

---

## Custom Poster Validation Rule
Artwork uploads are validated in [CustomPosterService](file:///e:/poster/services/custom-poster.service.ts):
- Minimum size: 5 MB (`5 * 1024 * 1024` bytes)
- Maximum size: 50 MB (`50 * 1024 * 1024` bytes)
- Cloudinary high-res preservation without compression
