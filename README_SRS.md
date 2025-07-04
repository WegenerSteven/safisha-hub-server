# 🚗 SafishaHub - Professional Car Wash Management System

> **"Safisha"** (Swahili: To Clean) + **"Hub"** (Central Management Point)

A comprehensive full-stack web application that connects customers with professional car wash services. Built with modern technologies following Agile development methodology to streamline booking, service delivery, and business operations.

**🎨 UI/UX Reference:** [SafishaHub Design Template](https://safisha-express.lovable.app/)

## 📖 Project Overview

SafishaHub is a complete solution designed to revolutionize car wash service delivery in Kenya and beyond. The platform provides seamless booking experiences for customers, efficient management tools for service providers, and comprehensive analytics for business optimization. This project showcases advanced full-stack development skills acquired through intensive training and follows industry best practices.

## ⏰ Development Timeline

| **Duration** | **4 Weeks (26 Working Days)** |
|--------------|--------------------------------|
| **Start**    | June 30, 2025                |
| **End**      | July 25, 2025                |
| **Status**   | Day 2 - Backend Foundation    |
| **Methodology** | Agile Scrum (4 Sprints)    |

📋 **[View Complete Development Roadmap](./DEVELOPMENT_ROADMAP.md)**

## 🎯 Learning Objectives Demonstrated

This project showcases mastery of:
- **Backend Development** with NestJS framework
- **Frontend Development** with React.js and modern state management
- **Database Design** and management with PostgreSQL
- **Caching Strategies** using Redis
- **API Design** and RESTful architecture
- **Authentication & Authorization** implementation
- **Real-time Features** with WebSockets
- **Payment Integration** with modern payment gateways
- **DevOps Practices** with Docker containerization

## 🛠️ Technology Stack

### Backend Technologies
- **NestJS** - Progressive Node.js framework for scalable server-side applications
- **TypeScript** - Strongly typed programming language
- **PostgreSQL** - Advanced open-source relational database
- **Redis** - In-memory data structure store for caching
- **TypeORM** - Database ORM with TypeScript support
- **Passport.js** - Authentication middleware with Google OAuth support
- **JWT** - JSON Web Tokens for secure authentication
- **Socket.io** - Real-time bidirectional event-based communication
- **Nodemailer** - Email service for transactional emails
- **Twilio/Africa's Talking** - SMS service providers for notifications
- **Stripe/PayPal** - Payment processing integration

### Frontend Technologies
- **React.js** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type safety for enhanced development experience
- **TanStack Query (React Query)** - Powerful data synchronization and caching
- **TanStack Router** - Type-safe routing for React applications
- **TanStack Table** - Headless UI for building data tables
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **React Hook Form** - Performant forms with easy validation

### Database & Caching
- **PostgreSQL** - Primary database for data persistence
- **Redis** - Session management and caching layer
- **Database Migrations** - Version control for database schema

### DevOps & Tools
- **Docker** - Containerization for consistent environments
- **Docker Compose** - Multi-container application orchestration
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit quality checks
- **Jest** - Testing framework for unit and integration tests

## ✨ Core Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Customer, Staff, Admin roles
- **Secure Registration & Login**: JWT-based authentication
- **Google OAuth 2.0**: Seamless social login integration
- **Password Security**: Bcrypt hashing with salt
- **Profile Management**: User profile updates and preferences
- **Role-based Access Control**: Feature access based on user roles
- **Multi-factor Authentication**: Email/SMS verification for enhanced security

### 📧 Communication Services
- **Email Service**: Transactional emails for bookings, receipts, and notifications
- **SMS Service**: Real-time SMS notifications for booking updates and OTP verification
- **Multi-provider Support**: Twilio, Africa's Talking, and email service providers
- **Template Engine**: Customizable email and SMS templates
- **OAuth Integration**: Email verification for Google OAuth registration
- **Automated Communications**: Welcome emails, booking confirmations, payment receipts

### 🚙 Service Management
- **Service Catalog**: Multiple car wash packages and add-ons
- **Dynamic Pricing**: Flexible pricing models for different services
- **Service Customization**: Configurable service options
- **Package Management**: Basic, Standard, Premium, and Deluxe packages
- **Add-on Services**: Waxing, interior cleaning, tire shine, etc.

### 📅 Booking & Scheduling System
- **Real-time Availability**: Live slot availability checking
- **Calendar Integration**: Visual booking calendar interface
- **Booking Management**: Create, modify, and cancel bookings
- **Queue Management**: Efficient service queue handling
- **Automated Confirmations**: Email and SMS notifications
- **Recurring Bookings**: Scheduled regular services

### 💳 Payment Processing
- **Secure Payment Gateway**: Integration with Stripe/PayPal
- **Multiple Payment Methods**: Cards, digital wallets, bank transfers
- **Invoice Generation**: Automated invoice creation and delivery
- **Payment History**: Comprehensive transaction records
- **Subscription Management**: Recurring payment handling
- **Refund Processing**: Automated refund capabilities

### 📊 Analytics & Reporting
- **Business Dashboard**: Real-time business metrics
- **Revenue Analytics**: Daily, weekly, monthly revenue reports
- **Customer Analytics**: Customer behavior and preferences
- **Service Performance**: Popular services and efficiency metrics
- **Staff Productivity**: Performance tracking and reporting
- **Financial Reports**: Comprehensive financial analytics

### 🔔 Notification System
- **Real-time Notifications**: WebSocket-based instant updates
- **Multi-channel Alerts**: Email, SMS, and in-app notifications
- **Booking Reminders**: Automated appointment reminders
- **Service Updates**: Status updates throughout the service process
- **Promotional Campaigns**: Marketing and promotional notifications

### 📱 Additional Features
- **Responsive Design**: Optimized for all device sizes
- **Progressive Web App**: Mobile app-like experience
- **Customer Reviews**: Rating and feedback system
- **Loyalty Program**: Points-based reward system
- **Multi-location Support**: Support for multiple car wash locations
- **Inventory Management**: Supplies and equipment tracking
- **Staff Scheduling**: Employee shift management

## 🏗️ System Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     React.js        │    │      NestJS         │    │    PostgreSQL       │
│   Frontend App      │◄──►│   Backend API       │◄──►│   Primary Database  │
│   (Port 3000)       │    │   (Port 5000)       │    │   (Port 5432)       │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                          │                          │
           │                          ▼                          │
           │                ┌─────────────────────┐               │
           │                │       Redis         │               │
           └────────────────│   Cache & Sessions  │───────────────┘
                           │   (Port 6379)       │
                           └─────────────────────┘
                                     │
                           ┌─────────────────────┐
                           │    Socket.io        │
                           │  Real-time Events   │
                           │   (WebSockets)      │
                           └─────────────────────┘
```

## 📁 Project Structure

```
safishahub/
├── backend/                          # NestJS Backend Application
│   ├── src/
│   │   ├── auth/                    # Authentication & authorization
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── strategies/          # Passport strategies
│   │   ├── users/                   # User management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── user.entity.ts
│   │   │   └── users.module.ts
│   │   ├── services/                # Car wash services
│   │   │   ├── services.controller.ts
│   │   │   ├── services.service.ts
│   │   │   ├── service.entity.ts
│   │   │   └── services.module.ts
│   │   ├── service-providers/       # Service provider management
│   │   │   ├── providers.controller.ts
│   │   │   ├── providers.service.ts
│   │   │   └── provider.entity.ts
│   │   ├── bookings/                # Booking system
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   ├── booking.entity.ts
│   │   │   └── bookings.module.ts
│   │   ├── payments/                # Payment processing
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payment.entity.ts
│   │   │   └── payments.module.ts
│   │   ├── locations/               # Location management
│   │   │   ├── locations.controller.ts
│   │   │   ├── locations.service.ts
│   │   │   └── location.entity.ts
│   │   ├── reviews/                 # Reviews & ratings
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   └── review.entity.ts
│   │   ├── notifications/           # Notification system
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts
│   │   │   └── notifications.module.ts
│   │   ├── email/                   # Email service module
│   │   │   ├── email.service.ts
│   │   │   ├── email.controller.ts
│   │   │   ├── email.module.ts
│   │   │   └── templates/           # Email templates
│   │   │       ├── welcome.template.ts
│   │   │       ├── booking-confirmation.template.ts
│   │   │       ├── password-reset.template.ts
│   │   │       └── payment-receipt.template.ts
│   │   ├── sms/                     # SMS service module
│   │   │   ├── sms.service.ts
│   │   │   ├── sms.controller.ts
│   │   │   ├── sms.module.ts
│   │   │   └── providers/           # SMS providers
│   │   │       ├── twilio.provider.ts
│   │   │       └── africastalking.provider.ts
│   │   ├── oauth/                   # OAuth authentication
│   │   │   ├── oauth.controller.ts
│   │   │   ├── oauth.service.ts
│   │   │   ├── oauth.module.ts
│   │   │   └── strategies/          # OAuth strategies
│   │   │       ├── google.strategy.ts
│   │   │       ├── facebook.strategy.ts
│   │   │       └── twitter.strategy.ts
│   │   ├── analytics/               # Business analytics
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.module.ts
│   │   ├── common/                  # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── database/                # Database configuration
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── database.module.ts
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── app.config.ts
│   │   ├── app.module.ts           # Main application module
│   │   └── main.ts                 # Application entry point
│   ├── test/                       # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                        # React Frontend Application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Base UI components
│   │   │   ├── forms/              # Form components
│   │   │   ├── layout/             # Layout components
│   │   │   └── features/           # Feature-specific components
│   │   ├── pages/                  # Application pages
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── bookings/           # Booking pages
│   │   │   ├── services/           # Service pages
│   │   │   └── admin/              # Admin pages
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBookings.ts
│   │   │   └── useServices.ts
│   │   ├── services/               # API service layer
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   └── payment.service.ts
│   │   ├── store/                  # State management
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   └── services/
│   │   ├── utils/                  # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── auth.types.ts
│   │   │   ├── booking.types.ts
│   │   │   └── service.types.ts
│   │   ├── App.tsx                 # Main App component
│   │   └── index.tsx               # Application entry point
│   ├── public/                     # Static assets
│   │   ├── icons/
│   │   ├── images/
│   │   └── manifest.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── shared/                          # Shared types and utilities
│   ├── types/                      # Shared TypeScript definitions
│   └── utils/                      # Shared utility functions
├── docker-compose.yml              # Multi-container setup
├── docker-compose.dev.yml          # Development environment
├── docker-compose.prod.yml         # Production environment
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
└── docs/                           # Additional documentation
    ├── API.md                      # API documentation
    ├── DEPLOYMENT.md               # Deployment guide
    ├── TESTING.md                  # Testing guidelines
    └── CONTRIBUTING.md             # Contribution guidelines
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Docker** and **Docker Compose**
- **PostgreSQL** 15+ and **Redis** 7+
- **Google OAuth 2.0** credentials (for social login)
- **Email Service** (Gmail SMTP or similar)
- **SMS Service** provider (Twilio, Africa's Talking, etc.)
- **Payment Gateway** account (Stripe/PayPal)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/safishahub.git
cd safishahub

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Install and start backend
cd backend
npm install
npm run migration:run
npm run start:dev

# Install and start frontend
cd frontend
npm install
npm start
```

### Environment Configuration
Create `.env` files for both backend and frontend based on the examples provided.

**Backend (.env.development):**
```env
NODE_ENV=development
DATABASE_URL=postgresql://safishahub_dev:dev_password@localhost:5432/safishahub_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-jwt-secret-key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
```

**Frontend (.env.development):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
REACT_APP_APP_NAME=SafishaHub
```

### 2. Environment Configuration

**Backend Environment (.env)**
```env
# Application Configuration
NODE_ENV=development
PORT=5000
APP_NAME=CarWash Management System

# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=carwash_user
DATABASE_PASSWORD=carwash_secure_password
DATABASE_NAME=carwash_db
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# SMS Service Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# SMS Service Configuration (Africa's Talking - Alternative)
AFRICASTALKING_API_KEY=your-africastalking-api-key
AFRICASTALKING_USERNAME=your-africastalking-username
AFRICASTALKING_SENDER_ID=your-sender-id

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

**Frontend Environment (.env)**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000

# Payment Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Map Integration
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Configuration
REACT_APP_NAME=CarWash Pro
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

### 3. Docker Setup (Recommended)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View service logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start services
docker-compose up --build -d
```

### 4. External Service Setup

#### Google OAuth 2.0 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

#### Email Service Setup (Gmail SMTP)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password
3. Use your Gmail address and app password in `.env` configuration

#### SMS Service Setup (Twilio)
1. Create a [Twilio account](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and phone number
3. Add credentials to your `.env` file

#### SMS Service Setup (Africa's Talking - Alternative)
1. Create an [Africa's Talking account](https://africastalking.com/)
2. Get your API key and username
3. Configure sender ID and add credentials to `.env`

#### Payment Gateway Setup (Stripe)
1. Create a [Stripe account](https://stripe.com/)
2. Get your publishable and secret keys from the dashboard
3. Set up webhooks for payment events
4. Add credentials to your `.env` file

### 5. Manual Installation

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed

# Start development server
npm run start:dev
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Database Setup
```bash
# Create PostgreSQL database
createdb carwash_db

# Run migrations
cd backend
npm run migration:run

# Seed sample data
npm run seed
```

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:cov

# Watch mode for development
npm run test:watch
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run component tests
npm run test:components
```

### Testing Tools Used
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP assertion library
- **Testing Library** - React component testing
- **MSW** - Mock Service Worker for API mocking

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - List all users (Admin)
- `PUT /api/users/:id/role` - Update user role (Admin)

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create new service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/availability` - Check slot availability

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/refund` - Process refund (Admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/customers` - Customer analytics
- `GET /api/analytics/services` - Service performance

### Interactive API Documentation
- **Development**: http://localhost:5000/api/docs
- **Swagger UI**: Interactive API documentation with testing capabilities

## 🔒 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Password Security**: Bcrypt hashing with salting
- **Session Management**: Redis-based session storage

### API Security
- **Rate Limiting**: Prevent API abuse and DDoS
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and output encoding

### Infrastructure Security
- **Helmet.js**: Security headers middleware
- **HTTPS Enforcement**: SSL/TLS encryption
- **Environment Variables**: Secure configuration management
- **Database Security**: Connection encryption and access control

## 🚀 Deployment Guide

### Production Environment Setup

#### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=production-grade-secret-key
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
```

#### Docker Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Manual Production Deployment
```bash
# Backend deployment
cd backend
npm run build
npm run start:prod

# Frontend deployment
cd frontend
npm run build
# Serve build folder with nginx or serve
```

### Cloud Deployment Options
- **AWS**: EC2, RDS, ElastiCache, S3
- **Google Cloud**: Compute Engine, Cloud SQL, Memorystore
- **Azure**: Virtual Machines, Azure Database, Redis Cache
- **Heroku**: Easy deployment with add-ons
- **DigitalOcean**: Droplets with managed databases

## 📊 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Frequently accessed data caching
- **Connection Pooling**: Database connection optimization
- **Query Optimization**: Efficient database queries
- **API Response Caching**: Reduced response times

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Minimized bundle sizes
- **Image Optimization**: Compressed and responsive images
- **PWA Features**: Service workers and offline capability
- **TanStack Query**: Intelligent data fetching and caching

## 🤝 Contributing Guidelines

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper tests
4. Commit with conventional commit messages
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with project-specific rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance
- **Conventional Commits**: Standardized commit messages

### Testing Requirements
- Unit tests for all new features
- Integration tests for API endpoints
- Component tests for React components
- Minimum 80% code coverage

## 📈 Future Enhancements

### Phase 2 Features
- [ ] **Mobile Application**: React Native mobile app
- [ ] **AI Integration**: Smart service recommendations
- [ ] **IoT Connectivity**: Equipment monitoring and automation
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Multi-language Support**: Internationalization
- [ ] **Voice Commands**: Voice-based booking system

### Phase 3 Features
- [ ] **Franchise Management**: Multi-location franchise support
- [ ] **Supply Chain Integration**: Inventory and supplier management
- [ ] **Customer CRM**: Advanced customer relationship management
- [ ] **Marketing Automation**: Automated marketing campaigns
- [ ] **Blockchain Integration**: Loyalty tokens and transparency

## 📞 Support & Community

### Getting Help
- **Documentation**: Comprehensive docs in `/docs` folder
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support
- **Email**: support@carwashpro.com

### Community Links
- **Discord**: [Join our community](https://discord.gg/carwashpro)
- **LinkedIn**: [Professional networking](https://linkedin.com/company/carwashpro)
- **Twitter**: [@CarWashPro](https://twitter.com/carwashpro)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for complete details.

## 🏆 Acknowledgments

### Learning Resources
- **NestJS Documentation**: Comprehensive framework documentation
- **React Documentation**: Modern React patterns and best practices
- **TanStack Documentation**: Advanced data management techniques
- **PostgreSQL Documentation**: Database optimization and best practices

### Inspiration
- **Industry Best Practices**: Modern web development standards
- **Open Source Community**: Countless contributors and maintainers
- **Teach2Give Training Program**: Intensive full-stack development training

## 📱 Contact Information

**Developer**: [Your Name]
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)

---

**🚀 Built with passion and cutting-edge technologies to showcase full-stack development expertise gained through intensive training and hands-on experience.**

*This project demonstrates proficiency in modern web development, from database design to user interface creation, showcasing the complete skill set acquired during the comprehensive 2-month training program.*
