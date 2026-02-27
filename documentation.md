# Farmingo Project Documentation

## 1. Introduction

Welcome to the official documentation for **Farmingo**, an all-in-one web platform designed to empower farmers with modern technology. This document provides a comprehensive overview of the project's architecture, features, technology stack, and setup instructions. Our goal is to provide a robust, scalable, and intuitive application for the agricultural community.

---

## 2. Features

Farmingo is built with a suite of tools to enhance decision-making, foster community, and streamline commerce in the agricultural sector.

### 🏠 Core Experience
- **Dashboard**: A central hub for authenticated users to quickly access all the platform's features, with a modern, dark-themed UI and feature search.
- **Welcome Page**: A sleek, professional landing page for new and unauthenticated users, guiding them to sign up or log in.
- **Responsive Design**: A fully responsive interface optimized for desktop, tablet, and mobile devices.

### 🤖 AI-Powered Insights
-   **Crop Price Prediction**: Leverages AI to forecast market prices for various crops based on region and variety.
-   **Crop Disease Diagnosis**: Instantly diagnose crop diseases. Users select from supported crops (Chilli, Corn, Melon, Onion, Tomato, Wheat, Groundnut) and upload a photo for AI-driven analysis, severity assessment, and treatment recommendations.
-   **Live Weather Advisory**: Fetches real-time weather data from OpenWeatherMap using the user's geolocation. Groq AI analyzes metrics like humidity, wind speed, and rain to provide actionable farming tips and harvesting recommendations.
-   **Smart Translation**: Integrated AI-powered text translation for community posts and comments, supporting major Indian languages.

### ⚙️ Platform Tools
-   **Dual Marketplace**: 
    -   **Verified Market**: Certified sellers can list products. Includes a persistent shopping cart and checkout system.
    -   **Indirect Market**: A community-driven space where any user can post items for sale, trade, or hire. Features include image cropping, tagging, and location details.
-   **Content Management**: Authors of posts and listings can edit content, delete items, and pin important comments to the top of discussions.
-   **Community Hub**: A social forum for farmers to connect, ask questions, and share knowledge in topic-specific communities (c/community_name).
-   **User Profiles & Messaging**:
    -   **Public Profiles**: View user history, followers, and roles (Farmer, User, Moderator).
    -   **Direct Messaging**: Real-time conversation threads between users with read receipts.
-   **Shopping Cart & Checkout**: A full-featured e-commerce experience including order history and status tracking.

---

## 3. Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Generative AI**: [Groq Cloud](https://groq.com/) (Llama 3.3/3.2) orchestrated via [Genkit](https://firebase.google.com/docs/genkit)
-   **External APIs**: [OpenWeatherMap](https://openweathermap.org/) for real-time meteorological data.
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/) with Tailwind CSS.
-   **State Management**: React Context API for Cart, Search, and User Profile Dialogs.
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 4. Project Structure

```
/
├── docs/                 # Backend schema and documentation
├── messages/             # Localization files (en, hi, mr)
├── public/               # Static assets
├── src/                  
│   ├── app/              # Next.js routes, pages, and API routes
│   ├── ai/               # Genkit AI flows and Groq configuration
│   ├── components/       
│   │   ├── features/     # Feature-specific logic (AI tools, Marketplace)
│   │   ├── layout/       # App structure (Sidebar, Header)
│   │   └── ui/           # Reusable ShadCN components
│   ├── context/          # React context providers (Cart, Search)
│   ├── firebase/         # Client-side SDK initialization and hooks
│   ├── hooks/            # Custom React hooks (useAuthActions, useDebounce)
│   ├── lib/              # Shared utilities and Firestore server actions
├── .env                  # Environment variables (API Keys)
├── firestore.rules       # Firestore security rules (Robust Ownership Model)
└── next.config.ts        # Next.js configuration
```

---

## 5. Firebase Backend

### `docs/backend.json`
The source of truth for the database structure. Defines entities like `UserProfile`, `Post`, `Product`, and `MarketplacePost`.

### `firestore.rules`
Implements a robust security model:
-   **Ownership**: Users can only edit/delete their own content.
-   **Moderation**: Post authors can delete or pin comments on their own posts.
-   **Immutability**: Protected fields like `uid` and `createdAt` cannot be modified during updates.
-   **Verification**: Only users with the `isVerified` flag can list items in the Verified Market.

### Data Models
-   **MarketplacePost**: Includes `itemName`, `description`, `price`, `quantity`, `tags`, and location metadata.
-   **Conversation**: Manages `participants`, `participantDetails` (for fast UI rendering), and `lastMessage` for inbox previews.

---

## 6. AI Flows with Genkit

The AI logic is separated into discrete "flows" in `src/ai/flows/`:

1.  **Weather Analysis**: Uses `fetchWeatherData` tool to get coordinates-based data, then prompts Groq to generate an agricultural advisory.
2.  **Crop Diagnosis**: Takes a crop name and photo, returning a structured JSON diagnosis with severity and steps.
3.  **Translation**: A multi-string translation flow that preserves Markdown formatting while translating agricultural terms.
4.  **Price Prediction**: Analyzes market factors to suggest optimal listing prices.

---

## 7. Getting Started

### Prerequisites
-   Node.js (v18 or later)
-   OpenWeatherMap API Key
-   Groq API Key

### Installation
1.  **Clone & Install**: `npm install`
2.  **Environment Setup**: Create a `.env` file with:
    -   `GROQ_API_KEY`
    -   `OPENWEATHER_API_KEY`
    -   Standard Firebase config variables.
3.  **Run**: `npm run dev` (Port 9002)
4.  **Genkit Inspector**: `npm run genkit:watch` (Port 4000) for debugging AI prompts.
