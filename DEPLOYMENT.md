# Enterprise Deployment & Infrastructure Guide

This guide details deployment options for Vercel, Docker, PostgreSQL, Cloudinary, Razorpay, and Shiprocket.

---

## 1. Vercel Deployment

1. Push your repository to GitHub.
2. Import project into Vercel.
3. Configure environment variables in Vercel Project Settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (Set to production domain, e.g. `https://yourposterstore.com`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`
4. Set Build Command: `npx prisma generate && next build`.
5. Deploy!

---

## 2. Docker Container Deployment

Run the entire application stack (Next.js + PostgreSQL) locally or on VPS using Docker:

```bash
# Build and launch multi-container stack
docker-compose up --build -d

# Verify containers running
docker-compose ps
```

---

## 3. Production Health Monitoring

Access the health check endpoint:
```
GET /api/health
```
Response:
```json
{
  "status": "HEALTHY",
  "uptimeSeconds": 1420.5,
  "timestamp": "2026-07-22T10:35:00.000Z",
  "environment": "production",
  "database": {
    "status": "CONNECTED",
    "latencyMs": 4
  }
}
```
