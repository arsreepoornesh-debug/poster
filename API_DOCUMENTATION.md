# REST API Reference Manual

## Authentication APIs

| Endpoint | Method | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Public | Register new customer account |
| `/api/auth/login` | POST | Public | Login credentials authentication |
| `/api/auth/me` | GET | Authenticated | Fetch current user session |

---

## Category & Catalog Management APIs

| Endpoint | Method | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `/api/categories` | GET, POST | Public / ADMIN | Category CRUD |
| `/api/subcategories` | GET, POST | Public / ADMIN | SubCategory CRUD |
| `/api/collections` | GET, POST | Public / ADMIN | Collection CRUD |
| `/api/posters` | GET, POST | Public / ADMIN | Poster catalog search & creation |
| `/api/posters/[id]` | GET, PATCH, DELETE | Public / ADMIN | Poster detail, update, soft delete |
| `/api/posters/[id]/duplicate` | POST | ADMIN | 1-Click poster entity duplicate |

---

## Cart, Orders & Custom Artwork APIs

| Endpoint | Method | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `/api/cart` | GET, POST | Public / Customer | Guest & customer cart operations |
| `/api/wishlist` | GET, POST | Customer | Customer wishlist manager |
| `/api/orders` | GET, POST | Customer / ADMIN | Order creation & tracking |
| `/api/custom-posters` | GET, POST | Public / Customer | Upload artwork file (5MB - 50MB) |
| `/api/custom-posters/[id]` | GET, PATCH | ADMIN | Review custom poster (Approve / Reject) |

---

## Payments & Shipping APIs

| Endpoint | Method | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `/api/payments/razorpay/order` | POST | Public | Create Razorpay order |
| `/api/payments/razorpay/verify` | POST | Public | Verify HMAC-SHA256 signature |
| `/api/payments/webhook` | POST | Public | Webhook verification endpoint |
| `/api/shipments` | POST | ADMIN | Create Shiprocket shipment manifest |
| `/api/invoices/[id]` | GET | Public | Render downloadable HTML/PDF invoice |
| `/api/health` | GET | Public | Enterprise health check & latency test |
| `/api/health/liveness` | GET | Public | Docker/K8s liveness probe |
| `/api/health/readiness` | GET | Public | Docker/K8s readiness probe |
