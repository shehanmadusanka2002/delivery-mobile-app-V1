# Delivery & Taxi Service Platform

A comprehensive full-stack delivery and taxi service platform featuring real-time tracking, multi-role management, and seamless booking experience. Built with modern technologies for web, mobile, and backend systems.

## 🚀 Features

### Customer Features
- **Easy Booking**: Intuitive booking form for delivery and taxi services
- **Real-time Tracking**: Live map integration to track drivers in real-time
- **Order History**: View complete history of past bookings
- **Wallet System**: Integrated digital wallet for seamless payments
- **Review & Rating**: Rate and review completed services
- **Profile Management**: Manage personal information and preferences

### Driver Features
- **Driver Dashboard**: Comprehensive dashboard for managing orders
- **Earnings Tracking**: Monitor earnings and transaction history
- **Document Management**: Upload and manage required documents
- **Bank Details**: Secure storage of banking information
- **Order Management**: Accept, decline, and manage delivery/taxi requests
- **Profile & Settings**: Customize driver profile and app settings

### Admin Features
- **Admin Dashboard**: Complete overview of platform operations
- **Driver Management**: Approve/block drivers and review pending applications
- **Order Monitoring**: Real-time monitoring of all active and completed orders
- **Financial Management**: Track platform revenue and driver payouts
- **Review Management**: Monitor and manage customer reviews
- **Pricing Configuration**: Dynamic vehicle pricing and service fee settings
- **Analytics**: Comprehensive reporting and insights

## 🛠️ Tech Stack

### Frontend (Web)
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Leaflet/MapBox** for maps and location services

### Mobile Application
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Expo Location** for GPS services
- Android and iOS support

### Backend
- **Java Spring Boot**
- **Spring Security** for authentication
- **MySQL** database
- **Maven** for dependency management
- **RESTful API** architecture
- **JWT** for token-based authentication

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Java JDK** (v11 or higher)
- **Maven** (v3.6 or higher)
- **MySQL** (v8.0 or higher)
- **Expo CLI** (for mobile development)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "delivey and texi app"
```

### 2. Backend Setup (Spring Boot)
```bash
cd deliveryapp

# Configure database
# Edit src/main/resources/application.properties with your MySQL credentials

# Run the application
./mvnw spring-boot:run
```

The backend server will start at `http://localhost:8080`

### 3. Frontend Setup (Web)
```bash
cd delivery-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The web application will be available at `http://localhost:5173`

### 4. Mobile App Setup
```bash
cd delivery-mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# For Android
npx expo start --android

# For iOS
npx expo start --ios
```

## 🗄️ Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE delivery_app;
```

2. Run the migration script:
```bash
mysql -u your_username -p delivery_app < deliveryapp/database_migration_add_isblocked.sql
```

3. Update database credentials in `application.properties`

## 📱 API Configuration

Update the API base URL in configuration files:

**Frontend**: `delivery-frontend/src/config/api.config.js`
**Mobile**: `delivery-mobile/config/api.config.js`

See [HOW_TO_CHANGE_IP.md](HOW_TO_CHANGE_IP.md) for detailed instructions.

## 🏗️ Project Structure

```
├── deliveryapp/           # Spring Boot backend
├── delivery-frontend/     # React web application
├── delivery-mobile/       # React Native mobile app
└── uploads/              # File storage for documents and images
```

## 🔐 User Roles

- **Customer**: Book services, track orders, manage wallet
- **Driver**: Accept orders, manage earnings, upload documents
- **Admin**: Manage platform, users, pricing, and analytics

## 🌟 Key Highlights

- **Real-time Location Tracking**: Live updates of driver location
- **Multi-platform Support**: Web and mobile applications
- **Secure Authentication**: JWT-based authentication system
- **Role-based Access Control**: Separate interfaces for different user types
- **Financial Management**: Integrated wallet and payment system
- **Document Verification**: Secure driver onboarding process
- **Responsive Design**: Mobile-first approach for all screens

## 🚦 Running in Production

### Backend
```bash
cd deliveryapp
./mvnw clean package
java -jar target/deliveryapp-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd delivery-frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Mobile
```bash
cd delivery-mobile
expo build:android  # For Android
expo build:ios      # For iOS
```

## 📝 Environment Variables

Create appropriate configuration files:

**.env (Backend)**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=delivery_app
JWT_SECRET=your_secret_key
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: This is a full-stack project demonstrating enterprise-level application development with modern technologies and best practices.
