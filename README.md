# 🍜 Bakso Kangen - Meatball Ordering Platform

A modern, full-stack meatball ordering website built with React, Node.js, Express, and supporting both MongoDB and SQLite databases. Features a beautiful Gen Z-inspired design with comprehensive functionality for customers, admins, and owners.

![Bakso Kangen Banner](https://via.placeholder.com/1200x400/22c55e/ffffff?text=Bakso+Kangen+-+Order+Delicious+Meatballs+Online)

## ✨ Features

### 🎯 For Customers
- **Browse Menu**: View available meatball items with descriptions and prices
- **Place Orders**: Easy order form with table number and notes
- **Real-time Updates**: Get notified when orders are processed
- **Mobile Responsive**: Optimized for all devices

### 👨‍💼 For Admins
- **Order Management**: Accept, process, and complete orders
- **Live Dashboard**: Real-time view of pending and in-progress orders
- **Export Data**: Download order reports as CSV
- **Bulk Operations**: Handle multiple orders efficiently

### 👑 For Owners
- **Analytics Dashboard**: Comprehensive sales and performance metrics
- **Popular Items**: Track best-selling menu items
- **Daily Reports**: View daily statistics and trends
- **Revenue Tracking**: Monitor business performance

### 🎨 Design & UX
- **Gen Z Aesthetic**: Modern design with soft green color palette
- **Dark/Light Mode**: Toggle between themes
- **Smooth Animations**: Engaging user experience
- **Accessible**: WCAG compliant interface

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/bakso-kangen.git
cd bakso-kangen
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run backend:install

# Install frontend dependencies  
npm run frontend:install
```

3. **Set up environment variables**
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the environment file with your settings
```

4. **Initialize database with sample data**
```bash
npm run backend:seed
```

5. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run backend:dev  # Backend on http://localhost:5000
npm run frontend:dev # Frontend on http://localhost:3000
```

6. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api

### Sample Credentials
```
Admin:    username: admin,     password: Admin123
Owner:    username: owner,     password: Owner123  
Customer: username: customer1, password: Customer123
```

## 🏗️ Project Structure

```
bakso-kangen/
├── backend/                    # Node.js/Express API
│   ├── config/                # Database & app configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Data models (MongoDB & SQLite)
│   ├── routes/                # API route definitions
│   ├── scripts/               # Utility scripts
│   ├── utils/                 # Helper functions
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── server.js              # Entry point
├── frontend/                   # React application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context providers
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript type definitions
│   │   └── assets/            # Images, icons, etc.
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind CSS configuration
├── API_DOCUMENTATION.md       # Comprehensive API docs
├── package.json               # Root project configuration
└── README.md                  # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB or SQLite (configurable)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **File Processing**: CSV export/import
- **Documentation**: Comprehensive API docs

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **Icons**: Heroicons
- **Charts**: Recharts
- **Components**: Headless UI

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Build Tool**: Create React App
- **Development**: Concurrently (run both servers)

## 📱 Pages & Features

### 🏠 Customer Homepage (`/`)
- Clean menu display with item cards
- Order form with table number and notes
- Form validation and error handling
- Success notifications
- LocalStorage for draft orders

### 🔐 Login Page (`/login`)
- Multi-role authentication (Customer/Admin/Owner)
- JWT token management
- Remember me functionality
- Password strength validation

### 🧑‍🍳 Admin Panel (`/admin`)
- Real-time order dashboard
- Order status management (Accept/Complete/Delete)
- Filter and search orders
- Export orders to CSV
- Bulk operations

### 👑 Owner Dashboard (`/owner`)
- Sales analytics and metrics
- Popular menu items tracking
- Daily/weekly/monthly reports
- Revenue charts and graphs
- Filter by date ranges

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # User login
GET    /api/auth/profile      # Get user profile
POST   /api/auth/logout       # User logout
GET    /api/auth/verify       # Verify JWT token
```

### Menu Management
```
GET    /api/menu              # Get all menu items
GET    /api/menu/available    # Get available items only
POST   /api/menu              # Create menu item (Admin/Owner)
PUT    /api/menu/:id          # Update menu item (Admin/Owner)
DELETE /api/menu/:id          # Delete menu item (Admin/Owner)
```

### Order Management
```
POST   /api/orders            # Place new order (Public)
GET    /api/orders            # Get all orders (Admin/Owner)
GET    /api/orders/pending    # Get pending orders (Admin)
PATCH  /api/orders/:id/accept # Accept order (Admin)
PATCH  /api/orders/:id/complete # Complete order (Admin)
DELETE /api/orders/:id        # Delete order (Admin/Owner)
```

### Analytics (Owner Only)
```
GET    /api/orders/analytics  # Comprehensive analytics
GET    /api/orders/stats/daily # Daily statistics
GET    /api/orders/stats/popular # Popular menu items
GET    /api/orders/export/csv # Export to CSV
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Customer/Admin/Owner permissions
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Joi validation on all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: Security headers
- **Password Hashing**: bcrypt for secure password storage

## 📊 Database Support

### SQLite (Default)
- **Pros**: No setup required, portable, perfect for development
- **Configuration**: Automatic table creation and migrations
- **File Location**: `backend/database/bakso-kangen.db`

### MongoDB (Optional)
- **Pros**: Scalable, cloud-ready, JSON-native
- **Setup**: Set `DATABASE_TYPE=mongodb` in `.env`
- **Connection**: Configure `MONGODB_URI` for your instance

## 🎨 Customization

### Themes
- **Light Mode**: Clean white background with green accents
- **Dark Mode**: Dark background with improved contrast
- **System**: Automatically follows system preference

### Colors
```css
Primary: #22c55e (Soft Green)
Secondary: #71717a (Neutral Gray)  
Accent: #f97316 (Orange)
Success: #22c55e (Green)
Warning: #f59e0b (Yellow)
Error: #ef4444 (Red)
```

### Fonts
- **Primary**: Poppins (Google Fonts)
- **Secondary**: Inter (Google Fonts)

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test

# Run all tests
npm test
```

## 📦 Deployment

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_TYPE=mongodb
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-secret
CORS_ORIGIN=https://your-domain.com
```

### Deployment Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, PlanetScale, SQLite file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Express.js** - For the minimal web framework
- **Heroicons** - For the beautiful icon set
- **MongoDB** - For the flexible database
- **All Contributors** - For making this project better

## 📞 Support

- **Documentation**: [API Documentation](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/bakso-kangen/issues)
- **Email**: support@bakso-kangen.com
- **Discord**: [Join our community](https://discord.gg/bakso-kangen)

## 🚀 Roadmap

- [ ] **Real-time Updates**: WebSocket integration for live order updates
- [ ] **Payment Integration**: Stripe/PayPal payment processing
- [ ] **Multi-language**: i18n support for multiple languages
- [ ] **Mobile App**: React Native mobile application
- [ ] **Kitchen Display**: Dedicated kitchen order display system
- [ ] **Inventory Management**: Track ingredient stock levels
- [ ] **Customer Reviews**: Rating and review system
- [ ] **Loyalty Program**: Points-based customer rewards

---

<div align="center">
  <p>Made with ❤️ for meatball lovers everywhere</p>
  <p>
    <a href="#-bakso-kangen---meatball-ordering-platform">↑ Back to top</a>
  </p>
</div>
