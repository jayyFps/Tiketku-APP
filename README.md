# 🎟️ TiketKu - Platform Penjualan Tiket

Platform penjualan tiket event lengkap dengan admin panel dan sistem barcode.

## ✨ Fitur

### User Website
- 🏠 Landing page dengan featured events
- 🎫 Browse semua events dengan search dan filter
- 🛒 Pembelian tiket dengan simulasi payment
- 📱 QR Code digital untuk setiap tiket
- 👤 User authentication (register/login)
- 📋 Dashboard tiket pribadi

### Admin Panel
- 📊 Dashboard dengan statistics
- ➕ CRUD events (Create, Read, Update, Delete)
- 📋 View semua tiket terjual
- 📱 QR Code scanner (camera + manual input)
- ✅ Validasi dan mark tiket sebagai used
- 📈 Sales reporting

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite
- **Frontend**: HTML + CSS + JavaScript (Vanilla)
- **QR Code**: qrcode (QR Code - 2D)
- **Scanner**: html5-qrcode
- **Authentication**: JWT (JSON Web Tokens)

## 📦 Installation

### Prerequisites
- Node.js (v14 atau lebih baru)
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize database dengan sample data:
```bash
npm run init-db
```

3. Start server:
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 🚀 Usage

### User Website
1. Buka browser ke `http://localhost:3000`
2. Register akun baru atau login
3. Browse events yang tersedia
4. Pilih event dan beli tiket
5. Lihat tiket Anda di "My Tickets"
6. QR Code akan ditampilkan untuk setiap tiket

### Admin Panel
1. Buka browser ke `http://localhost:3000/admin`
2. Login dengan credentials:
   - Username: `admin`
   - Password: `admin123`
3. Akses fitur admin:
   - **Dashboard**: Lihat statistics penjualan
   - **Manage Events**: Tambah/edit/hapus events
   - **All Tickets**: Lihat semua tiket terjual
   - **Scanner**: Scan QR code tiket pengunjung

## 📱 Barcode Scanner

Admin dapat memvalidasi tiket dengan 2 cara:

1. **Camera Scanner**: Gunakan kamera untuk scan QR code
2. **Manual Input**: Masukkan kode tiket secara manual

Setelah scan, sistem akan:
- ✅ Validasi tiket
- ℹ️ Tampilkan info event dan pembeli
- 🚫 Deteksi jika tiket sudah digunakan
- 📝 Mark tiket sebagai "used"

## 📁 Project Structure

```
tiket/
├── admin/                  # Admin panel
│   ├── css/
│   │   └── admin-style.css
│   ├── js/
│   │   └── admin.js
│   ├── dashboard.html
│   ├── events.html
│   ├── tickets.html
│   ├── scanner.html
│   └── login.html
├── public/                 # User website
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── index.html
│   ├── events.html
│   ├── event-detail.html
│   └── my-tickets.html
├── database/
│   ├── db.js              # Database connection
│   └── init-db.js         # Database initialization
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── events.js          # Events routes
│   └── tickets.js         # Tickets routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── utils/
│   └── barcode.js         # QR Code utilities
├── server.js              # Main server file
├── package.json
└── .env                   # Environment variables
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Events (Public)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID

### Events (Admin Only)
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Tickets (User)
- `POST /api/tickets/purchase` - Purchase ticket
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/barcode/:barcode` - Get QR code image

### Tickets (Admin Only)
- `POST /api/tickets/scan` - Scan and validate ticket
- `GET /api/tickets/all` - Get all tickets
- `GET /api/tickets/stats` - Get statistics

## 🎨 Design Features

- ✨ Modern UI dengan glassmorphism effect
- 🌙 Dark mode aesthetic
- 🎭 Smooth animations dan transitions
- 📱 Fully responsive design
- 🎯 Premium color palette
- 💫 Micro-interactions

## 🔧 Development

### Run in development mode (with auto-reload):
```bash
npm run dev
```

### Environment Variables

Create a `.env` file:
```
PORT=3000
JWT_SECRET=your_secret_key_here
DATABASE_PATH=./database/tickets.db
```

## 📝 Sample Data

Database akan diinisialisasi dengan:
- 6 sample events
- 1 admin account (admin/admin123)

## 🐛 Troubleshooting

**Database Error**: Pastikan folder `database` ada dan writable

**Port Already in Use**: Ganti PORT di file `.env`

**Scanner Not Working**: Pastikan browser memiliki akses ke camera

## 📄 License

ISC

## 👨‍💻 Author

Created for ticket platform demonstration

---

**Happy Ticketing! 🎉**
# Tiketku-APP
