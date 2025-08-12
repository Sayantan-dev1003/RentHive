# RentHive - Comprehensive Rental Management System

A full-stack rental management system built with Node.js, Express, MongoDB, and React. This system provides complete functionality for managing rental products, orders, payments, customers, and business analytics.

## 🏗️ Architecture

```
RentHive/
├── client/          # React frontend (Vite)
├── server/          # Node.js + Express backend
└── README.md
```

## 🚀 Features
### 🎨 Frontend Design (Figma)
We designed the frontend prototype in Figma to visualize the UI/UX before development.
You can explore the complete design here: https://www.figma.com/design/ltQnjW8Mz3gxDjIDoOeena/Odoo-hackathon-car-rental-system?node-id=2-68&t=zYEn2FJF0o2W2PAW-1

### Backend Features
- **User Management**: Customer and admin roles with JWT authentication
- **Product Management**: Complete CRUD with categories, pricing, and availability tracking
- **Order Management**: Quote generation, order confirmation, pickup/return tracking
- **Payment Processing**: Mock payment gateway with multiple payment methods
- **Inventory Management**: Real-time availability tracking and reservation system
- **Pricing Engine**: Dynamic pricing with pricelist rules and discounts
- **Notification System**: Automated reminders for pickups, returns, and payments
- **Reporting**: Comprehensive business analytics and reports
- **Invoice Generation**: PDF invoice generation with detailed breakdowns

### Technical Features
- **RESTful API**: Well-structured REST endpoints
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local PDF generation and storage
- **Scheduled Tasks**: Automated notifications and cleanup tasks
- **Error Handling**: Comprehensive error handling and validation
- **Logging**: Request logging with Morgan

## 📋 Prerequisites

- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration (assuming external MongoDB connection)
# MongoDB should already be running and configured

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Notification Settings
NOTIFY_DAYS=2
PICKUP_REMINDER_HOURS=24
RETURN_REMINDER_DAYS=2
NOTIFICATION_RETENTION_DAYS=30

# Business Settings
LATE_FEE_PER_DAY=100

# File Storage
INVOICE_DIR=./tmp/invoices

# Optional: Email Configuration (for production)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-user
MAIL_PASS=your-mailtrap-password
MAIL_FROM=noreply@renthive.com
```

### 3. Directory Setup

Create required directories:

```bash
mkdir -p tmp/invoices
```

### 4. Database Setup

Ensure MongoDB is running and accessible. The application will connect to the database configured in your environment or existing setup.

### 5. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:8000`

## 🧪 API Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Sample API Workflow

#### 1. Register a new user (end_user/admin)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@renthive.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "end_user"
  }'
```

#### 2. Login and get JWT token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@renthive.com",
    "password": "password123"
  }'
```

Save the token from the response for subsequent requests.

#### 3. Create a product (requires admin token)
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Professional Camera",
    "category": "Electronics",
    "description": "High-quality DSLR camera for professional photography",
    "pricing": {
      "hour": 50,
      "day": 300,
      "week": 1800,
      "month": 6000
    },
    "stock": 5
  }'
```

#### 4. Register a customer
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "customer@example.com",
    "password": "password123",
    "phone": "9876543211",
    "role": "customer"
  }'
```

#### 5. Customer login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

#### 6. Request a quote
```bash
curl -X POST http://localhost:8000/api/orders/quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -d '{
    "customerId": "CUSTOMER_ID_FROM_LOGIN",
    "items": [{
      "productId": "PRODUCT_ID_FROM_STEP_3",
      "quantity": 1,
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-17T18:00:00Z"
    }]
  }'
```

#### 7. Confirm order
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "items": [{
      "productId": "PRODUCT_ID",
      "quantity": 1,
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-17T18:00:00Z"
    }],
    "depositAmount": 500
  }'
```

#### 8. Process payment (dummy payment)
```bash
curl -X POST http://localhost:8000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_FROM_STEP_7",
    "amount": 600,
    "method": "mock"
  }'
```

#### 9. Mark order as picked up (admin only)
```bash
curl -X PATCH http://localhost:8000/api/orders/ORDER_ID/pickup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "notes": "Items picked up in good condition"
  }'
```

#### 10. Mark order as returned (admin only)
```bash
curl -X PATCH http://localhost:8000/api/orders/ORDER_ID/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "notes": "Items returned in good condition",
    "condition": "Excellent"
  }'
```

## 📊 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /change-password` - Change password
- `GET /users` - Get all users (admin)

### Products (`/api/products`)
- `GET /` - List products with filters
- `POST /` - Create product (admin)
- `GET /:id` - Get product details
- `PUT /:id` - Update product (admin)
- `DELETE /:id` - Delete product (admin)
- `GET /:id/availability` - Check availability
- `GET /categories` - Get categories
- `GET /search` - Search products

### Orders (`/api/orders`)
- `POST /quote` - Generate quote
- `POST /` - Confirm order
- `GET /` - List orders
- `GET /:id` - Get order details
- `PATCH /:id/pickup` - Mark pickup (admin)
- `PATCH /:id/return` - Mark return (admin)
- `PATCH /:id/cancel` - Cancel order
- `GET /:id/invoice` - Generate invoice

### Payments (`/api/payments`)
- `POST /process` - Process payment
- `GET /` - List payments
- `GET /:id` - Get payment details
- `POST /:id/refund` - Process refund (admin)
- `GET /stats` - Payment statistics (admin)

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `POST /` - Create notification (admin)
- `PATCH /:id/read` - Mark as read
- `DELETE /:id` - Delete notification
- `POST /test` - Send test notification

### Reports (`/api/reports`) - Admin only
- `GET /most-rented-products` - Most rented products
- `GET /total-revenue` - Revenue report
- `GET /top-customers` - Top customers
- `GET /order-status` - Order status distribution
- `GET /inventory-utilization` - Inventory utilization
- `GET /financial-summary` - Financial summary

### Pricelists (`/api/pricelists`) - Admin only
- `GET /` - List pricelists
- `POST /` - Create pricelist
- `GET /:id` - Get pricelist details
- `PUT /:id` - Update pricelist
- `DELETE /:id` - Delete pricelist
- `GET /active` - Get active pricelists

## 🤖 Automated Features

### Notification Scheduler
The system automatically sends notifications for:
- **Pickup Reminders**: 24 hours before pickup time
- **Return Reminders**: 2 days before return due date
- **Late Return Notices**: For overdue items
- **Payment Due Reminders**: For pending payments
- **Daily Business Digest**: Daily summary for admins

### Cleanup Tasks
- Automatic cleanup of old read notifications (30 days retention)
- Cleanup of temporary files

## 🏷️ Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | Required | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration time |
| `NOTIFY_DAYS` | `2` | Days before return to notify |
| `PICKUP_REMINDER_HOURS` | `24` | Hours before pickup to remind |
| `RETURN_REMINDER_DAYS` | `2` | Days before return to remind |
| `LATE_FEE_PER_DAY` | `100` | Late fee per day (INR) |
| `INVOICE_DIR` | `./tmp/invoices` | Invoice storage directory |
| `NOTIFICATION_RETENTION_DAYS` | `30` | Notification cleanup period |

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string and credentials
   - Verify network connectivity

2. **JWT Authentication Errors**
   - Check if JWT_SECRET is set in environment
   - Verify token format in Authorization header
   - Check token expiration

3. **File Permission Issues**
   - Ensure write permissions for `tmp/invoices` directory
   - Check available disk space

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:8000 | xargs kill`

### Logs and Debugging

- Check console output for error messages
- Enable debug mode: `NODE_ENV=development`
- Monitor MongoDB logs for database issues
- Check file system permissions for PDF generation

## 📈 Performance Considerations

- **Database Indexing**: All models include appropriate indexes
- **Pagination**: All list endpoints support pagination
- **Caching**: Consider implementing Redis for session storage
- **File Storage**: Consider cloud storage for production (AWS S3, etc.)
- **Monitoring**: Implement application monitoring (New Relic, DataDog, etc.)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error messages without sensitive data
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Consider implementing for production

## 🚀 Production Deployment

### Additional Production Setup
1. **Environment Variables**: Set all required production values
2. **Database**: Use MongoDB Atlas or dedicated MongoDB instance
3. **File Storage**: Configure cloud storage for invoices
4. **Email Service**: Configure SMTP for real email notifications
5. **SSL Certificate**: Enable HTTPS
6. **Process Manager**: Use PM2 for process management
7. **Monitoring**: Set up application and infrastructure monitoring
8. **Backup**: Implement database backup strategy

### Production Environment Variables
```env
NODE_ENV=production
PORT=8000
JWT_SECRET=your-production-jwt-secret
MONGODB_URI=your-production-mongodb-uri
MAIL_HOST=your-production-smtp-host
# ... other production variables
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for troubleshooting guides
