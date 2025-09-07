# Payment Gateway Integration - Flip

## Overview
Implementasi payment gateway menggunakan Flip untuk pembayaran iuran kas bulanan. Ketika user klik tombol "Bayar" di modal pembayaran, sistem akan:

1. Membuat payment link melalui API Flip
2. Menyimpan record pembayaran dengan status "pending" 
3. Membuka payment link di tab baru
4. Menerima webhook untuk update status pembayaran

## API Endpoints

### 1. POST /api/payment-gateway
**Purpose:** Membuat payment link melalui Flip API

**Request Body:**
```json
{
  "months": ["3", "4", "5"], // Array month numbers (1-12)
  "year": "2025"
}
```

**Response:**
```json
{
  "success": true,
  "payment_url": "flip.id/pwf/$company/#product-code",
  "amount": 9000,
  "reference_id": "GJL-F2-1725722400000",
  "link_id": 35431868,
  "title": "F2 Maret-April-Mei",
  "status": "ACTIVE"
}
```

**Flow:**
1. Validasi input (minimal 1 bulan)
2. Ambil settings untuk jumlah iuran bulanan
3. Generate reference ID: `GJL-{houseNumber}-{timestamp}`
4. Buat payload untuk Flip API
5. Call Flip API dengan basic auth
6. Simpan financial records dengan status "pending"
7. Return payment URL ke frontend

### 2. POST /api/payment-webhook
**Purpose:** Menerima webhook dari Flip untuk update status pembayaran

**Webhook Data dari Flip:**
```json
{
  "id": "payment_id",
  "bill_link_id": 35431868,
  "status": "SUCCESSFUL", // SUCCESSFUL, FAILED, PENDING
  "amount": 9000,
  "reference_id": "GJL-F2-1725722400000",
  "sender_name": "Widi Baskoro Aji",
  "created_at": "2025-09-07T10:00:00Z"
}
```

**Flow:**
1. Verifikasi signature webhook (optional)
2. Cari financial records berdasarkan reference_id
3. Update status:
   - SUCCESSFUL → "done"
   - FAILED → "expired"
4. Return success response

## Database Changes

### Added Columns to `financial_records`:
- `status`: ENUM('pending', 'done', 'expired') - Status pembayaran
- `payment_url`: TEXT - URL payment gateway
- `reference_id`: TEXT - Reference ID dari payment gateway

### Indexes:
- `idx_financial_records_status`
- `idx_financial_records_reference_id`

## Frontend Changes

### Modified `createNewPayment` function in `/src/app/payment/page.tsx`:
- Menggunakan async/await
- Call API `/api/payment-gateway`
- Buka payment URL di tab baru
- Refresh financial records setelah berhasil
- Error handling yang lebih baik

## Environment Variables

```env
# .env.local
FLIP_AUTH_KEY=your_flip_auth_key_here
FLIP_WEBHOOK_SECRET=your_webhook_secret_here # optional
```

## Testing

1. **Development Server**: `npm run dev` (port 3001)
2. **Login**: Akses http://localhost:3001/login
3. **Payment Page**: Navigate ke /payment
4. **Test Flow**:
   - Klik "Bayar Iuran"
   - Pilih bulan-bulan yang ingin dibayar
   - Klik "Bayar"
   - Payment link akan terbuka di tab baru
   - Financial records akan tersimpan dengan status "pending"

## Webhook Configuration

Untuk production, set webhook URL di Flip dashboard:
```
https://yourdomain.com/api/payment-webhook
```

## Security Notes

1. **Basic Auth**: Menggunakan FLIP_AUTH_KEY dengan base64 encoding
2. **Webhook Verification**: Signature verification (jika Flip menyediakan)
3. **HTTPS Required**: Untuk webhook di production
4. **Rate Limiting**: Pertimbangkan implementasi rate limiting

## Error Handling

- **Payment Gateway Error**: Status 500 dengan detail error
- **Validation Error**: Status 400 dengan detail validasi
- **Database Error**: Status 500 dengan error message
- **Authentication Error**: Status 401 unauthorized

## Monitoring

Log semua payment transactions untuk monitoring:
- Payment creation
- Webhook received
- Status updates
- Error conditions
