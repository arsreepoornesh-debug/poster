# Enterprise Admin CMS User Manual

Welcome to the Poster Store Admin Management Manual.

---

## 1. Accessing the Admin Console
- **URL**: `http://localhost:3000/admin/login`
- Enter Admin credentials to sign in. Admin RBAC protects administrative pages.

---

## 2. Category & Collection Management
- Navigate to `/admin/categories`, `/admin/subcategories`, or `/admin/collections`.
- Click **Create Category**. Type a name, description, and upload a thumbnail.
- Once saved, the new category will immediately display on the storefront homepage and generate dynamic routes automatically.

---

## 3. Uploading & Managing Posters
- Navigate to `/admin/posters/create`.
- Fill in Title, Select Category -> SubCategory -> Collection.
- Drag & Drop multiple poster gallery images. Primary image will be set as cover.
- Set Base Price and Offer Price. SKU code is auto-generated if left blank.
- Click **Save & Publish Poster**.

---

## 4. Custom Artwork Review Workflow
- Navigate to `/admin/custom-posters`.
- Inspect customer uploaded files (5 MB to 50 MB limit).
- Click **Download** to review original high-res image.
- Click **Approve Artwork** or **Reject Artwork** (specify rejection reason). The customer receives notification updates in their portal.

---

## 5. Order Tracking & Delivery Zones
- View live orders at `/admin/orders`. Click **Update Status** to update lifecycle states (`CONFIRMED`, `PRINTING`, `DISPATCHED`, `DELIVERED`).
- Configure shipping charges at `/admin/delivery-zones`.
