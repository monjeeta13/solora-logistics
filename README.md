Solora Logistics

Solora Logistics is a modern, full-stack logistics and shipping platform built to optimize transit routes and reduce carbon footprints through intelligent hub-and-spoke consolidation.

The platform offers a seamless booking experience, an integrated prepaid wallet system, real-time Google Maps tracking with dynamic multi-node eco-routes, and automated A6 PDF shipping label generation.

🚀 Key Features

Dynamic Eco-Routing Engine: Calculates the geographical midpoint between origin and destination to automatically route sustainable shipments through a network of 21 major regional consolidation hubs.

Integrated Digital Wallet: Users manage a prepaid ledger for seamless one-click bookings. Features Razorpay checkout integration for top-ups and atomic transaction rollbacks for instant refunds upon shipment cancellation.

Real-Time Shipment Tracking: Interactive tracking dashboard utilizing the Google Maps JavaScript API to visualize direct polylines and hub-and-spoke transit breadcrumbs.

Automated Label Generation: Client-side A6 shipping label generation using jsPDF and jsBarcode, complete with AWB barcodes, product declarations, and dynamic multi-address layout.

Multi-Step Booking Wizard: Intuitive booking flow with live PIN code validation, transparent pricing, and robust form validation.

Secure Authentication: Passwordless Google OAuth integration powered by Firebase Admin SDK.

🛠️ Technology Stack

Frontend

Angular 17+ (Standalone Components, SSR bypassed for SPA delivery)

Tailwind CSS & Angular Material

Google Maps JavaScript API

jsPDF & jsBarcode (Client-side document generation)

Backend

Node.js & Express.js

MongoDB Atlas (Mongoose Object Modeling)

Firebase Admin SDK (Auth token verification)

Razorpay Node SDK (Payment gateway)

Infrastructure

Monorepo Architecture: Centralized repository for both client and server applications.

Deployment: Firebase Hosting (Frontend) & Render (Backend API).

📁 Repository Structure

solora-logistics/
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route logic (Auth, Shipments, Wallet)
│   │   ├── middleware/     # Auth guards, Error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   └── server.js       # Entry point
│   └── package.json
└── frontend/               # Angular SPA
    ├── src/
    │   ├── app/
    │   │   ├── core/       # Singleton services, Guards, Interceptors
    │   │   ├── features/   # Booking, Tracking, Wallet, Auth modules
    │   │   └── layout/     # Navigation, Sidebar, Footer
    │   ├── environments/   # API URLs and Firebase config
    │   └── index.html
    └── package.json


⚙️ Local Development Setup

Prerequisites

Node.js (v18 or higher)

MongoDB Atlas Account

Firebase Project (for Authentication)

Razorpay Test Account (for Wallet features)

1. Clone the repository

git clone https://github.com/your-username/solora-logistics.git
cd solora-logistics


2. Configure Backend Environment

Navigate to the backend directory, install dependencies, and set up your environment variables.

cd backend
npm install
touch .env


Populate the backend/.env file:

PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret


Start the local backend server:

node src/server.js
# Runs on http://localhost:3000


3. Configure Frontend Environment

In a new terminal instance, navigate to the frontend directory and install dependencies.

cd frontend
npm install


Update frontend/src/environments/environment.ts with your Firebase client configuration and the local API URL (http://localhost:3000/api).

Start the Angular development server:

npx ng serve
# Runs on http://localhost:4200


📄 License & Copyright

© 2026 - Monjeeta Sinha Roy. All rights reserved.
