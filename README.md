# 🛍️ Shopez — Full-Stack Fashion E-Commerce App

Shopez is a full-stack clothing e-commerce web application built with React 19 on the frontend and Node.js/Express 5 on the backend, using MongoDB as the database. It supports user authentication, product browsing, cart management, order placement, and a dedicated admin panel.

-----

## 📁 Project Structure

```
Shopez/
├── backend/
│   ├── apis/
│   │   ├── adminAPI.js
│   │   ├── cartAPI.js
│   │   ├── orderAPI.js
│   │   ├── productAPI.js
│   │   └── userAPI.js
│   ├── middleware/
│   │   ├── verifyAdmin.js
│   │   └── verifyToken.js
│   ├── models/
│   │   └── Schema.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminPanel.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Header.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── MyOrders.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Products.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   └── RootLayout.jsx
    │   ├── store/
    │   │   ├── authStore.js
    │   │   └── cartStore.js
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ✨ Features

### User
- Register and login with JWT-based authentication (access token + refresh token via HTTP-only cookies)
- Browse products with filters by category, gender, and keyword search
- View individual product details with size selection and quantity picker
- Add products to cart or place direct orders via Buy Now
- Checkout with delivery details and COD / Online payment options
- View and cancel orders from order history
- Personal dashboard with order stats and recent activity
- Edit profile (username)

### Admin
- Dashboard with total users, products, orders, and revenue stats
- Full product CRUD — create, edit, delete, seed demo products
- Manage all orders and update order status
- Activate / deactivate user accounts
- Configure homepage banner and product categories

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| State Management | Zustand 5 |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Authentication | JWT (jsonwebtoken), bcrypt, HTTP-only cookies |
| Middleware | cookie-parser, cors, dotenv |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18 or above
- MongoDB (local or Atlas connection string)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shopez.git
cd shopez
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DB_URL=mongodb://localhost:27017/shopez
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH=your_refresh_secret_key
```

Start the backend server:

```bash
npm start
```

The server will run on `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## 🔌 API Reference

All API responses follow the format:
```json
{ "message": "...", "payload": ... }
```

### Auth — `/user-api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login and receive tokens | Public |
| GET | `/logout` | Logout and clear cookies | Public |
| POST | `/refresh` | Refresh access token | Public |
| GET | `/check-auth` | Verify current session | Public |
| GET | `/profile` | Get logged-in user profile | User |
| PUT | `/profile` | Update username | User |
| GET | `/my-orders` | Get user's own orders | User |

### Products — `/product-api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all products (with filters & pagination) | Public |
| GET | `/:id` | Get single product | Public |
| GET | `/meta/categories` | Get all categories | Public |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |
| POST | `/admin/seed` | Seed demo products | Admin |

### Cart — `/cart-api` *(all routes require login)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get cart with subtotal |
| POST | `/add` | Add item to cart |
| PUT | `/:id` | Update item quantity |
| DELETE | `/:id` | Remove item from cart |
| DELETE | `/` | Clear entire cart |

### Orders — `/order-api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/place` | Place order for a single product | User |
| POST | `/checkout` | Place order from cart (clears cart) | User |
| GET | `/my-orders` | Get logged-in user's orders | User |
| GET | `/:id` | Get single order | User |
| PUT | `/:id/cancel` | Cancel an order | User |
| GET | `/` | Get all orders (paginated) | Admin |
| PUT | `/:id/status` | Update order status | Admin |

### Admin — `/admin-api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard stats (users, orders, revenue) | Admin |
| GET | `/users` | List all users | Admin |
| PUT | `/users/:id/toggle` | Activate / deactivate user | Admin |
| GET | `/orders` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/banner` | Get homepage banner | Admin |
| PUT | `/banner` | Update homepage banner | Admin |
| GET | `/categories` | Get product categories | Admin |
| PUT | `/categories` | Update product categories | Admin |

---

## 🗄️ Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| username | String | Required |
| email | String | Unique, lowercase |
| password | String | Hashed with bcrypt |
| usertype | String | `user` or `admin` |
| refreshToken | String | Stored for rotation |
| isActive | Boolean | Default true |

### Product
| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| description | String | Required |
| mainImg | String | Image URL |
| carousel | Array | Additional image URLs |
| sizes | Array | e.g. `['S','M','L','XL']` |
| category | String | e.g. Shirts, Jeans |
| gender | String | Men / Women / Unisex / Kids |
| price | Number | Base price |
| discount | Number | Percentage, 0–100 |
| isActive | Boolean | Soft delete flag |

### Cart
Stores a snapshot of product details (title, price, discount, image) at the time of adding, so cart remains accurate if the product is later updated.

### Order
Stores a full snapshot of the product and delivery details at the time of placing. Supports statuses: `order placed` → `shipped` → `out for delivery` → `delivered` / `cancelled`. Estimated delivery date is auto-calculated as 5 business days from order date.

---

## 📦 Order Status Flow

```
order placed → shipped → out for delivery → delivered
                                          ↘ cancelled
```

Users can cancel orders that are not yet delivered or already cancelled. Admins can update the status to any value from the admin panel.

---

## 🔐 Authentication Flow

1. On login, the server issues a short-lived **access token** (2h) and a long-lived **refresh token** (7d), both stored as HTTP-only cookies.
2. The frontend calls `/user-api/check-auth` on every page load to restore the session.
3. If the access token expires, the frontend calls `/user-api/refresh` using the refresh token to get a new pair.
4. On logout, both cookies are cleared and the refresh token is invalidated in the database.

---

## 👤 Creating an Admin Account

By default, all registered users get the `user` role. To create an admin, manually update the `usertype` field in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { usertype: "admin" } })
```

Then log in with that account to access `/admin`.

---

## 📝 Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm start` | Start the Express server |
| `frontend/` | `npm run dev` | Start the Vite dev server |
| `frontend/` | `npm run build` | Build for production |
| `frontend/` | `npm run preview` | Preview the production build |

---

## 🌐 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH` | Secret key for signing refresh tokens |

---

## 📄 License

This project is intended for educational purposes as part of an academic full-stack development project at Anurag University. 
