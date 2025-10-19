# 🍊 FreshJuice - Quick Commerce Orange Juice Web App

A modern, full-stack web application for ordering fresh orange juice with authentication, real-time order tracking, and admin dashboard.

## ✨ Features

### 🔐 Authentication System
- **User Registration** - Sign up as Customer or Admin
- **Secure Login** - JWT-based authentication
- **Role-Based Access** - Customer and Admin roles
- **Password Reset** - Forgot password functionality
- **Profile Management** - Update user information

### 🏠 Customer Features
- **Home Page** - Beautiful landing page with product highlights
- **Browse Menu** - View all available juice varieties with images and prices
- **Order Page** - Simple and intuitive order form with auto-fill for logged-in users
- **Track Orders** - Real-time order tracking with visual timeline
- **Order History** - View your past orders

### 🧑‍💼 Admin Features
- **Admin Dashboard** - Comprehensive order management
- **Statistics** - Total orders, revenue, pending, and delivered metrics
- **Order Management** - Update order status, delete orders
- **Real-time Updates** - Refresh and manage orders efficiently

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Local or Atlas)
- **npm** or **yarn**

### Quick Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure MongoDB:**
   - Update `.env` file with your MongoDB connection string
   - See [SETUP.md](SETUP.md) for detailed instructions

3. **Start the application:**
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:5000)

4. **Create your first admin account:**
   - Click "Login" → Select "Admin" → "Sign Up"

### Detailed Setup

For complete setup instructions including MongoDB configuration, email setup, and troubleshooting, see **[SETUP.md](SETUP.md)**

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

## 📱 Pages

1. **Home** - Landing page with call-to-action
2. **Menu** - Browse all juice products with category filters
3. **Order** - Place new orders (auto-fills user data if logged in)
4. **Track** - Track order status with visual timeline
5. **Admin** - Full-featured admin dashboard (Admin only)

## 🎨 Design

Modern, clean UI with:
- Responsive design for all devices
- Smooth animations and transitions
- Orange-themed color palette
- Intuitive user experience
- Role-based UI elements

## 🔐 Authentication Flow

1. **Signup** - Users choose role (Customer/Admin) and create account
2. **Login** - JWT token stored in localStorage
3. **Protected Routes** - Admin dashboard requires admin role
4. **Auto-fill Forms** - Logged-in users get pre-filled order forms
5. **Logout** - Clears session and redirects to home

## 🗄️ Database Schema

### User Model
- name, email, password (hashed)
- phone, address
- role (customer/admin)
- resetPasswordToken, resetPasswordExpire

### Order Model
- orderId, userId (optional)
- customer details (name, phone, address)
- product details (productId, productName, quantity)
- totalPrice, paymentMode
- status (received, preparing, out_for_delivery, delivered)
- timestamps

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Protected API endpoints
- Input validation
- CORS configuration

## 📝 License

This is a demo project for educational purposes.
