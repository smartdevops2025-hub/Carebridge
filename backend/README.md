# Carebridge Backend API

Carebridge is a two-sided marketplace connecting patients with verified bystanders for hospital and home care support.

## 📁 Project Structure
carebridge-backend/
├── src/
│ ├── config/ # Database & environment config
│ ├── models/ # Database models
│ ├── controllers/ # Business logic
│ ├── routes/ # API routes
│ ├── middleware/ # Auth, validation, upload
│ ├── utils/ # Helpers (OTP, JWT, etc.)
│ ├── services/ # External services
│ └── validators/ # Request validation
├── uploads/ # Uploaded files
├── logs/ # Application logs
├── .env # Environment variables
├── package.json # Dependencies
└── server.js # Entry point


## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carebridge-backend.git
cd carebridge-backend
