# PostgreSQL Database Model Reference

The application database schema is defined in [prisma/schema.prisma](file:///e:/poster/prisma/schema.prisma) with 25+ relational entities using UUID primary keys.

---

## Model Inventory

1. **User & Authentication**:
   - `AdminUser`: `SUPER_ADMIN`, `ADMIN`, `STAFF` roles with bcrypt password hashing.
   - `Customer`: Registered storefront user profile and addresses.

2. **CMS Hierarchy Models**:
   - `Category`: Top level category with soft delete (`deletedAt`) and JSON-LD SEO metadata.
   - `SubCategory`: Belongs to Category.
   - `Collection`: Optional groupings belonging to SubCategory.
   - `CategoryBanner`: Dynamic promo banners.

3. **Poster Catalog Models**:
   - `Poster`: Catalog item with SKU, base price, offer price, orientation, tags, color theme, and indexes.
   - `PosterImage`: Gallery images with Cloudinary public ID and sort order.
   - `PosterVariant`: Size options (A5, A4, A3, A2, 12x18, 24x36, Custom) with price adjustments.

4. **Custom Artwork Model**:
   - `CustomPoster`: Artwork request with strict 5MB-50MB size validation, Cloudinary high-res preservation (`fileUrl`), web preview (`previewUrl`), thumbnail (`thumbnailUrl`), and `CustomPosterReviewHistory` logger.

5. **Cart, Orders, Payments & Shipping**:
   - `Cart` & `CartItem`: Guest cart token persistence and customer merge.
   - `Wishlist` & `WishlistItem`: Persistent wishlist.
   - `Order` & `OrderItem`: Full order lifecycle tracking (`PENDING` to `DELIVERED`) and `OrderStatusHistory` logger.
   - `Payment`, `PaymentTransaction`, `Refund`: Pluggable payment tracking.
   - `Shipment`: Shiprocket AWB tracking and shipping manifest URLs.
   - `Invoice`: GST 18% tax calculation and invoice numbers.
   - `DeliveryZone`: Database-driven shipping fees.
   - `AuditLog`: Security audit logs.
