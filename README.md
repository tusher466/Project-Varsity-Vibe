# Varsity Vibe

A modern university jersey ordering and management platform built with
React, TypeScript, Firebase authentication, and Google Sheets
integration. Varsity Vibe enables students to explore available jersey
designs, place orders, track order progress, and allows authorized
administrators to manage designs and orders efficiently.

## 📌 Project Overview

Varsity Vibe is designed for universities and student communities that
need a simple digital solution for managing custom jersey sales. The
platform replaces manual order collection with a structured online
workflow where students can select jerseys, customize details, submit
orders, and monitor updates.

The system provides separate experiences for students and store owners:

-   Students can browse jersey collections and submit orders.
-   Students can search and track their order status.
-   Administrators can manage jersey designs, monitor orders, and
    synchronize order data with Google Sheets.

------------------------------------------------------------------------

## ✨ Key Features

### Student Features

-   Browse available varsity jersey designs.
-   View jersey details:
    -   Edition name
    -   Price
    -   Fabric type
    -   Available sizes
    -   Color information
-   Place customized jersey orders.
-   Provide student information:
    -   Name
    -   Student ID
    -   Department
    -   Phone number
    -   Jersey size
    -   Back name and number
-   Track order status using order information.
-   Receive order completion confirmation.

### Admin / Owner Features

-   Secure owner authentication using Google authentication.
-   Manage jersey inventory and designs.
-   View and manage student orders.
-   Update order progress through different stages:
    -   Pending
    -   Confirmed
    -   Printing
    -   Ready for Pickup
    -   Delivered
    -   Completed
    -   Cancelled
-   Configure Google Sheets synchronization.
-   Export and synchronize order information.

------------------------------------------------------------------------

## 🛠️ Technology Stack

### Frontend

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS
-   Lucide React Icons
-   Motion animations

### Backend / Services

-   Firebase Authentication
-   Google Sheets API integration
-   Browser storage services

### Development Tools

-   Bun / npm
-   TypeScript Compiler
-   Vite Build System

------------------------------------------------------------------------

## 📂 Project Structure

    Project-Varsity-Vibe-main/
    │
    ├── src/
    │   ├── components/
    │   │   ├── StudentStore.tsx
    │   │   ├── OwnerPortal.tsx
    │   │   ├── OrderModal.tsx
    │   │   ├── Navbar.tsx
    │   │   └── ...
    │   │
    │   ├── services/
    │   │   ├── googleAuth.ts
    │   │   ├── sheetsService.ts
    │   │   └── storageService.ts
    │   │
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   └── types.ts
    │
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── vercel.json

------------------------------------------------------------------------

## 🚀 Installation and Setup

### Prerequisites

Make sure you have installed:

-   Node.js
-   npm or Bun
-   Firebase project configuration

### Clone the Repository

``` bash
git clone <repository-url>
cd Project-Varsity-Vibe-main
```

### Install Dependencies

Using npm:

``` bash
npm install
```

or using Bun:

``` bash
bun install
```

------------------------------------------------------------------------

## ▶️ Running the Project

Start the development server:

``` bash
npm run dev
```

or:

``` bash
bun run dev
```

The application will run on:

    http://localhost:3000

------------------------------------------------------------------------

## 🏗️ Build for Production

Create an optimized production build:

``` bash
npm run build
```

Preview the production build:

``` bash
npm run preview
```

------------------------------------------------------------------------

## 🔐 Environment Configuration

Create a `.env` file based on `.env.example`.

Required configuration may include:

-   Firebase authentication settings
-   Google API credentials
-   Application-specific environment variables

Never expose private API keys or credentials publicly.

------------------------------------------------------------------------

## 🔄 Order Workflow

1.  Student selects a jersey design.
2.  Student enters personal and customization details.
3.  Order is submitted and stored.
4.  Admin reviews the order.
5.  Order status is updated through production stages.
6.  Student tracks the latest order progress.

------------------------------------------------------------------------

## 📊 Google Sheets Integration

Varsity Vibe supports Google Sheets synchronization for order
management.

Benefits:

-   Centralized order records.
-   Easy administrative tracking.
-   Simple data export and reporting.
-   Reduced manual record keeping.

------------------------------------------------------------------------

## 🔒 Security

The project includes:

-   Google authentication for administrators.
-   Authorized admin verification.
-   Protected owner management features.
-   Secure handling of application configuration.

------------------------------------------------------------------------

## 🌐 Deployment

The project is configured for modern hosting platforms such as Vercel.

Deployment steps:

1.  Connect the repository to your hosting provider.
2.  Configure environment variables.
3.  Run the production build.
4.  Deploy the generated application.

------------------------------------------------------------------------

## 🤝 Contribution

Contributions are welcome.

To contribute:

1.  Fork the repository.
2.  Create a new feature branch.
3.  Make your changes.
4.  Submit a pull request.

------------------------------------------------------------------------

## 📄 License

This project is intended for educational and university community use.
Add an appropriate open-source license before public distribution.

------------------------------------------------------------------------

## 👨‍💻 Author

**Varsity Vibe Development Team**

Built to simplify university jersey ordering and management through
modern web technology.
