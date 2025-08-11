# 🚀 RentHive API Testing Guide

This comprehensive guide will help you test all the APIs using Swagger UI at `http://localhost:8000/api-docs/`

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Authentication APIs](#authentication-apis)
- [Product APIs](#product-apis)
- [Order APIs](#order-apis)
- [Payment APIs](#payment-apis)
- [Notification APIs](#notification-apis)
- [Report APIs](#report-apis)
- [Pricelist APIs](#pricelist-apis)
- [Testing Workflows](#testing-workflows)

## 🏁 Getting Started

### Prerequisites
1. **Start the Server**: `npm run dev` (in `/server` directory)
2. **Database**: Ensure MongoDB Atlas is seeded with data: `npm run seed:fixed`
3. **Access Swagger**: Open `http://localhost:8000/api-docs/`

### Test Credentials
```
👤 Customer Account:
Email: john.smith@email.com
Password: password123

🔧 Admin Account:
Email: Admin@email.com
Password: admin123
```

## 🔐 Authentication APIs

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Required**: No authentication
- **Test Data**:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543219",
  "role": "customer"
}
```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Required**: No authentication
- **Test Data**:
```json
{
  "email": "john.smith@email.com",
  "password": "password123"
}
```
- **Important**: Copy the `token` from response for other API calls!

### 3. Setting Up Authentication in Swagger
1. After successful login, copy the JWT token
2. Click the **"Authorize"** button (🔒) at the top of Swagger UI
3. Enter: `Bearer YOUR_JWT_TOKEN_HERE`
4. Click **"Authorize"**
5. Now all protected endpoints will use this token

## 📦 Product APIs

### 1. Get All Products
- **Endpoint**: `GET /api/products`
- **Authentication**: Optional
- **Query Parameters** (optional):
  - `category`: Electronics, Sports, Events, etc.
  - `rentable`: true/false
  - `minPrice`: 10
  - `maxPrice`: 500
  - `startDate`: 2025-08-20
  - `endDate`: 2025-08-25

### 2. Get Product by ID
- **Endpoint**: `GET /api/products/{id}`
- **Test ID**: Use any product ID from the products list
- **Example ID**: `67832f0ca45b2c001f123456` (get from products list)

### 3. Create Product (Admin Only)
- **Endpoint**: `POST /api/products`
- **Authentication**: Admin token required
- **Test Data**:
```json
{
  "name": "Test Camera",
  "category": "Electronics",
  "description": "Test camera for API testing",
  "rentable": true,
  "pricing": {
    "hour": 20,
    "day": 100,
    "week": 600,
    "month": 2000
  },
  "stock": 5,
  "images": ["https://example.com/test-camera.jpg"]
}
```

### 4. Check Product Availability
- **Endpoint**: `GET /api/products/{id}/availability`
- **Query Parameters**:
  - `start`: 2025-08-20T00:00:00Z
  - `end`: 2025-08-25T23:59:59Z

## 📋 Order APIs

### 1. Create Order Quote
- **Endpoint**: `POST /api/orders/quote`
- **Authentication**: Customer token required
- **Test Data**:
```json
{
  "customerId": "USER_ID_FROM_LOGIN_RESPONSE",
  "items": [
    {
      "productId": "PRODUCT_ID_FROM_PRODUCTS_LIST",
      "quantity": 1,
      "startDate": "2025-08-20T00:00:00Z",
      "endDate": "2025-08-23T23:59:59Z"
    }
  ]
}
```

### 2. Confirm Order
- **Endpoint**: `POST /api/orders`
- **Authentication**: Customer token required
- **Test Data**:
```json
{
  "customerId": "USER_ID_FROM_LOGIN_RESPONSE",
  "items": [
    {
      "productId": "PRODUCT_ID_FROM_PRODUCTS_LIST",
      "quantity": 1,
      "rentalDuration": {
        "startDate": "2025-08-20T00:00:00Z",
        "endDate": "2025-08-23T23:59:59Z"
      }
    }
  ],
  "depositAmount": 200
}
```

### 3. Get All Orders
- **Endpoint**: `GET /api/orders`
- **Authentication**: Required (customers see their orders, admins see all)

### 4. Get Order by ID
- **Endpoint**: `GET /api/orders/{id}`
- **Test ID**: Use order ID from orders list

### 5. Mark Order as Picked Up (Admin Only)
- **Endpoint**: `PATCH /api/orders/{id}/pickup`
- **Authentication**: Admin token required

### 6. Mark Order as Returned (Admin Only)
- **Endpoint**: `PATCH /api/orders/{id}/return`
- **Authentication**: Admin token required

### 7. Cancel Order
- **Endpoint**: `DELETE /api/orders/{id}`
- **Authentication**: Required (ownership checked)

### 8. Extend Order
- **Endpoint**: `POST /api/orders/{id}/extend`
- **Authentication**: Required (ownership checked)
- **Test Data**:
```json
{
  "newEndDate": "2025-08-27T23:59:59Z",
  "reason": "Need extra days for the event"
}
```

## 💳 Payment APIs

### 1. Process Payment
- **Endpoint**: `POST /api/payments/process`
- **Authentication**: Customer token required
- **Test Data**:
```json
{
  "orderId": "ORDER_ID_FROM_ORDERS_LIST",
  "amount": 500,
  "method": "mock"
}
```

### 2. Get Payment by ID
- **Endpoint**: `GET /api/payments/{id}`
- **Authentication**: Required
- **Test ID**: Use payment ID from payment response

## 🔔 Notification APIs

### 1. Get User Notifications
- **Endpoint**: `GET /api/notifications`
- **Authentication**: Required

### 2. Send Test Notification
- **Endpoint**: `POST /api/notifications/test`
- **Authentication**: Required

## 📊 Report APIs (Admin Only)

### 1. Most Rented Products
- **Endpoint**: `GET /api/reports/most-rented-products`
- **Authentication**: Admin token required
- **Query Parameters** (optional):
  - `startDate`: 2025-01-01
  - `endDate`: 2025-12-31

### 2. Total Revenue
- **Endpoint**: `GET /api/reports/total-revenue`
- **Authentication**: Admin token required
- **Query Parameters** (optional):
  - `startDate`: 2025-01-01
  - `endDate`: 2025-12-31

### 3. Top Customers
- **Endpoint**: `GET /api/reports/top-customers`
- **Authentication**: Admin token required

### 4. Inventory Report
- **Endpoint**: `GET /api/reports/inventory`
- **Authentication**: Admin token required

### 5. Export Reports
- **Endpoint**: `GET /api/reports/export`
- **Authentication**: Admin token required
- **Query Parameters**:
  - `type`: most-rented-products, total-revenue, top-customers, or inventory
  - `format`: pdf or csv
- **Example**: `/api/reports/export?type=most-rented-products&format=pdf`

## 💰 Pricelist APIs

### 1. Get All Pricelists
- **Endpoint**: `GET /api/pricelists`
- **Authentication**: Required

### 2. Get Active Pricelists
- **Endpoint**: `GET /api/pricelists/active`
- **Authentication**: Not required
- **Query Parameters** (optional):
  - `date`: 2025-08-20

### 3. Create Pricelist (Admin Only)
- **Endpoint**: `POST /api/pricelists`
- **Authentication**: Admin token required
- **Test Data**:
```json
{
  "name": "Summer Special",
  "type": "seasonal",
  "rules": [
    {
      "productCategory": "Electronics",
      "discountType": "percentage",
      "discountValue": 15,
      "durationUnit": "week"
    }
  ],
  "validity": {
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z"
  }
}
```

## 🔄 Testing Workflows

### Complete Customer Journey
1. **Register/Login** as customer
2. **Browse Products** - GET /api/products
3. **Check Availability** - GET /api/products/{id}/availability
4. **Create Quote** - POST /api/orders/quote
5. **Confirm Order** - POST /api/orders
6. **Process Payment** - POST /api/payments/process
7. **Check Order Status** - GET /api/orders/{id}
8. **Extend Order** (if needed) - POST /api/orders/{id}/extend

### Admin Management Workflow
1. **Login** as admin
2. **Add New Product** - POST /api/products
3. **View All Orders** - GET /api/orders
4. **Mark Pickup** - PATCH /api/orders/{id}/pickup
5. **Mark Return** - PATCH /api/orders/{id}/return
6. **Generate Reports** - GET /api/reports/*
7. **Export Reports** - GET /api/reports/export

### Error Testing Scenarios
1. **Unauthorized Access**: Try admin endpoints with customer token
2. **Invalid Data**: Send malformed JSON or missing required fields
3. **Resource Not Found**: Use non-existent IDs
4. **Availability Conflicts**: Try to book unavailable products
5. **Payment Failures**: Test with invalid payment data

## 🐛 Common Issues & Solutions

### 1. Authentication Issues
- **Problem**: 401 Unauthorized
- **Solution**: Ensure you're using the correct JWT token in Authorization header

### 2. Validation Errors
- **Problem**: 400 Bad Request with validation messages
- **Solution**: Check required fields and data types in the request body

### 3. Permission Denied
- **Problem**: 403 Forbidden
- **Solution**: Ensure you're using the correct role (admin vs customer)

### 4. Resource Not Found
- **Problem**: 404 Not Found
- **Solution**: Verify the ID exists by first listing all resources

## 📝 Testing Checklist

### Authentication ✅
- [ ] Register new user
- [ ] Login with existing user
- [ ] Test with invalid credentials
- [ ] Test token expiration

### Products ✅
- [ ] List all products
- [ ] Filter products by category
- [ ] Get product details
- [ ] Check product availability
- [ ] Create product (admin)
- [ ] Update product (admin)

### Orders ✅
- [ ] Create quote
- [ ] Confirm order
- [ ] List orders (customer vs admin view)
- [ ] Cancel order
- [ ] Extend order
- [ ] Mark pickup/return (admin)

### Payments ✅
- [ ] Process payment
- [ ] Test different payment methods
- [ ] Test payment failures

### Reports ✅
- [ ] Generate all report types
- [ ] Export reports as PDF
- [ ] Export reports as CSV
- [ ] Test date filtering

### Edge Cases ✅
- [ ] Invalid IDs
- [ ] Malformed requests
- [ ] Unauthorized access
- [ ] Concurrent bookings
- [ ] Inventory limits

## 🎯 Success Criteria

A successful API test should:
1. **Return correct HTTP status codes**
2. **Include proper response structure** with `success`, `data`, `message` fields
3. **Handle errors gracefully** with meaningful error messages
4. **Respect authentication** and authorization rules
5. **Validate input data** and return appropriate validation errors

---

## 📞 Need Help?

If you encounter issues:
1. Check the server logs in your terminal
2. Verify your MongoDB Atlas connection
3. Ensure the database is seeded with test data
4. Check the Swagger UI for detailed error responses

**Happy Testing! 🎉**
