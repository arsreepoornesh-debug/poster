# Enterprise Architecture & System Blueprint

## Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|   Storefront (App Router)   |   Admin CMS   |   Custom Artwork Upload Portal      |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                             NEXT.JS 15 APP ROUTER                                 |
|   Middleware Guards (RBAC)  |  Dynamic Route Engine  |  Intelligent Search        |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                SERVICE LAYER                                      |
|  CategoryService  | PosterService | PaymentService | ShippingService | AuditLog   |
+----------------------------------------+------------------------------------------+
                                         |
          +------------------------------+------------------------------+
          |                              |                              |
          v                              v                              v
+------------------+           +------------------+           +-------------------+
|  POSTGRESQL DB   |           |  CLOUDINARY CDN  |           | EXTERNAL GATEWAYS |
|  Prisma ORM (25) |           | Artwork Storage  |           | Razorpay/Shiprkt |
+------------------+           +------------------+           +-------------------+
```

---

## Design Principles

1. **Repository Pattern & Pluggable Architecture**:
   Decoupled query logic into repositories (`PosterRepository`, `OrderRepository`, `CustomPosterRepository`) and payment/shipping interfaces (`IPaymentProvider`, `IShippingProvider`).
2. **Zero-Hardcode Directive**:
   Dynamic categories, subcategories, collections, and posters load dynamically from PostgreSQL without modifying a single line of frontend code.
3. **Artwork Security & Preservation**:
   Custom artwork uploads enforce **strict 5 MB min to 50 MB max validation**. Original files are stored in Cloudinary without compression for high-resolution printing.
