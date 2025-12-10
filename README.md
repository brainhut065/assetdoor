# AssetDoor Admin Panel

<div align="center">

![Admin Panel](https://img.shields.io/badge/AssetDoor-Admin%20Panel-FFD700?style=for-the-badge&logo=react&logoColor=white)

**A powerful, modern admin dashboard for managing your digital goods store**

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Firebase Setup](#-firebase-setup) • [Project Structure](#-project-structure)

</div>

---

## 📊 Overview

The AssetDoor Admin Panel is a comprehensive React.js web application that empowers administrators to manage their digital goods store efficiently. Built with a clean, minimalist design matching the mobile app's aesthetic, it provides all the tools needed to manage products, track sales, and analyze performance.

### Key Highlights

- 🎨 **Modern UI/UX** - Minimalist yellow/white theme matching the mobile app
- 🔐 **Secure Authentication** - Firebase Auth with role-based access
- 📦 **Product Management** - Full CRUD operations for products
- 📁 **Category Management** - Organize products by categories
- 💰 **Sales Analytics** - Track revenue, purchases, and performance
- 👥 **User Management** - View and manage customer accounts
- 📊 **Dashboard** - Real-time statistics and insights
- 📤 **File Uploads** - Drag-and-drop image and file uploads with progress tracking

---

## ✨ Features

### 🏠 Dashboard
- **Statistics Overview** - Total products, categories, users, purchases, and revenue
- **Quick Actions** - Fast navigation to key sections
- **Real-time Data** - Live updates from Firestore

### 📦 Product Management
- **Product List** - View all products with search and filtering
- **Create/Edit Products** - Full product management with:
  - Image uploads (drag-and-drop)
  - Digital file uploads (up to 1GB)
  - Price and description management
  - Category assignment
- **Grid/List Views** - Toggle between view modes
- **Bulk Operations** - Delete and manage multiple products

### 📁 Category Management
- **Category CRUD** - Create, read, update, and delete categories
- **Display Order** - Control category ordering
- **Active/Inactive** - Toggle category visibility
- **Product Count** - See products per category

### 💰 Purchase Management
- **Purchase History** - View all transactions
- **Advanced Filtering** - Filter by status, date range, user, product
- **Transaction Details** - Complete purchase information
- **Revenue Analytics** - Total revenue and average order value

### 👥 User Management
- **User List** - View all registered users
- **User Details** - Purchase history and spending per user
- **Search & Filter** - Find users quickly
- **User Statistics** - Total purchases and spending

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account and project
- Git

### Installation

1. **Navigate to the admin panel directory**
   ```bash
   cd assetdoor-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firebase**
   
   See [Firebase Setup](#-firebase-setup) section for detailed instructions.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5174` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

---

## 🛠 Tech Stack

### Core Technologies
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Firebase** - Backend services

### Firebase Services
- **Authentication** - Email/password admin login
- **Cloud Firestore** - Database for products, categories, purchases, users
- **Storage** - File storage for product images and digital files

### Key Libraries
- **React Hook Form** - Form handling and validation
- **Yup** - Schema validation
- **React Dropzone** - File uploads with drag-and-drop
- **date-fns** - Date formatting utilities

### Styling
- **CSS Modules** - Component-scoped styling
- **Custom Theme** - Yellow/white minimalist design

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** (Email/Password)
4. Create **Firestore Database** (Native mode, not MongoDB compatibility)
5. Set up **Storage** bucket

### 2. Configure Security Rules

**Firestore Rules:**
- See `FIRESTORE_RULES_PRODUCTION.md` for complete rules
- Allows public read for products/categories
- Admin-only write access
- User-specific read access for purchases

**Storage Rules:**
- See `STORAGE_RULES_PRODUCTION.md` for complete rules
- Public read for product images
- Admin-only write access
- Authenticated read for digital files

### 3. Create First Admin User

1. Register an admin user through Firebase Authentication
2. The app will automatically create an admin document in Firestore
3. Ensure Firestore rules allow admin document creation

### 4. Set Up Indexes

Create composite indexes in Firestore for:
- **Purchases Collection**: `status` (Ascending) + `purchaseDate` (Descending)

See `FIRESTORE_INDEX_SETUP.md` for details.

---

## 📁 Project Structure

```
assetdoor-admin-panel/
├── src/
│   ├── components/
│   │   ├── Layout/          # Shared layout with navigation
│   │   └── product/         # Product-specific components
│   │       ├── ImageUploader.jsx
│   │       └── FileUploader.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard/       # Dashboard with statistics
│   │   ├── Login/           # Authentication page
│   │   ├── Products/        # Product management
│   │   ├── Categories/      # Category management
│   │   ├── Purchases/       # Purchase viewing
│   │   └── Users/           # User management
│   │
│   ├── services/
│   │   └── firebase/        # Firebase service layer
│   │       ├── config.js    # Firebase initialization
│   │       ├── auth.js      # Authentication
│   │       ├── firestore.js # Firestore operations
│   │       └── storage.js   # Storage operations
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useProducts.js
│   │   ├── useCategories.js
│   │   ├── usePurchases.js
│   │   └── useUsers.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   │
│   ├── routes/
│   │   └── index.jsx        # Route configuration
│   │
│   ├── styles/
│   │   ├── theme.js         # Theme configuration
│   │   └── global.css       # Global styles
│   │
│   └── utils/
│       └── formatters.js    # Utility functions
│
├── .env                     # Environment variables (not in git)
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

---

## 🔐 Authentication

### Admin Login

1. Navigate to `/login`
2. Enter admin email and password
3. Upon successful login, you'll be redirected to the dashboard
4. The app automatically creates an admin document in Firestore if it doesn't exist

### Security

- **Role-based Access**: Only authenticated admins can access the panel
- **Protected Routes**: All routes except login are protected
- **Firestore Security**: Rules ensure only admins can write data
- **Storage Security**: Rules restrict file uploads to admins only

---

## 📤 File Uploads

### Image Uploads
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Max Size**: 10MB
- **Features**: Drag-and-drop, preview, progress tracking

### Digital File Uploads
- **Supported Formats**: ZIP, PDF, and other file types
- **Max Size**: 1GB
- **Features**: Drag-and-drop, file info display, progress tracking

---

## 🌐 Network Access

To access the admin panel from other devices on your local network:

1. Update `vite.config.js`:
   ```js
   server: {
     host: '0.0.0.0',
     port: 5174,
   }
   ```

2. Access via your IP: `http://YOUR_IP:5174`

---

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🐛 Troubleshooting

### Common Issues

**Blank Page After Login:**
- Check Firebase configuration in `.env`
- Ensure environment variables use `VITE_` prefix
- Verify Firestore rules allow admin document creation

**Upload Permission Errors:**
- Verify Storage security rules
- Ensure admin document exists in Firestore
- Check that `isAdmin()` function works correctly

**Index Errors:**
- Create required Firestore composite indexes
- See `FIRESTORE_INDEX_SETUP.md` for details

---

## 📚 Documentation

- [Setup Guide](../SETUP_GUIDE.md) - Complete setup instructions
- [Firestore Rules](FIRESTORE_RULES_PRODUCTION.md) - Security rules
- [Storage Rules](STORAGE_RULES_PRODUCTION.md) - Storage security
- [Index Setup](FIRESTORE_INDEX_SETUP.md) - Firestore indexes

---

## 🎨 Design System

The admin panel follows the same design language as the mobile app:

- **Primary Color**: Yellow (#FFD700)
- **Background**: White (#FFFFFF)
- **Text**: Dark gray (#1A1A1A)
- **Borders**: Light gray (#E0E0E0)
- **Typography**: Bold, modern fonts

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is private and proprietary.

---

## 🔗 Related Projects

- **[Mobile App](../README.md)** - Flutter mobile application for customers

---

<div align="center">

**Built with React ⚛️ and Firebase 🔥**

[Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues)

</div>

## Product ID formats
- com.yourcompany.yourapp.product_category.product_name
- e.g. com.assetdoor.app.social_media_packs.3d_icons_and_objects_bundle

## Purchase Option Ids
- When you create your non-consumable product in the Play Console, you will have to create at least one Purchase Option.
- You select the "Buy" purchase type.
- You give this option a unique Purchase Option ID (e.g., permanent-access or full-price-buy).