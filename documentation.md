
# Farmingo Project Documentation

## 1. Introduction

Welcome to the official documentation for **Farmingo**, an all-in-one web platform designed to empower farmers with modern technology. This document provides a comprehensive overview of the project's architecture, features, technology stack, and setup instructions.

---

## 2. Features

Farmingo is built with a suite of tools to enhance decision-making, foster community, and streamline commerce in the agricultural sector.

### 🏠 Core Experience
- **Dashboard**: A central hub for authenticated users to quickly access all the platform's features.
- **Welcome Page**: A landing page for new and unauthenticated users, guiding them to sign up or log in.

### 🤖 AI-Powered Insights

-   **Crop Price Prediction**: Leverages AI to forecast market prices for various crops.
-   **Crop Disease Diagnosis**: Instantly diagnose crop diseases by uploading a photo. Get AI-driven analysis, severity assessment, and treatment recommendations.
-   **Weather Prediction & Advice**: Get localized weather forecasts and actionable farming tips tailored to current and upcoming weather conditions.

### ⚙️ Platform Tools

-   **Marketplace**: A dual-market system:
    -   **Verified Market**: For certified sellers to list products directly.
    -   **Indirect Market**: A community-driven space where any user can post items for sale, trade, or hire.
-   **Community Hub**: A social forum for farmers to connect, ask questions, and share knowledge in topic-specific communities.
-   **User Profiles & Settings**:
    -   **Public Profiles**: View user profiles with their posts, followers, and following lists.
    -   **Settings**: A dedicated section for users to manage their profile details, account security, and notification preferences.
-   **Direct Messaging**: Allows users to engage in private one-on-one conversations.
-   **Shopping Cart & Checkout**: A full-featured e-commerce experience for purchasing products from the marketplace.


---

## 3. Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (React App Router)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Generative AI**: [Google's Gemini models](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
-   **State Management**: React Context API for Cart and User Profile Dialogs.
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 4. Project Structure

The project follows a standard Next.js App Router structure with some key organizational choices.

```
/
├── docs/                 # Backend schema and documentation
│   └── backend.json      # Defines Firestore structure and data entities
├── public/               # Static assets
├── src/                  # Application source code
│   ├── app/              # Next.js routes and pages
│   ├── ai/               # Genkit AI flows and configuration
│   ├── components/       # Reusable UI components (ShadCN, custom)
│   ├── context/          # React context providers (state management)
│   ├── firebase/         # Firebase initialization, hooks, and actions
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and server actions
├── .env                  # Environment variables
├── firestore.rules       # Firestore security rules
└── next.config.ts        # Next.js configuration
```

### Key Directories Explained

-   **`src/app`**: Contains all the routes for the application. Each folder represents a URL segment. The main `page.tsx` handles routing for authenticated vs. unauthenticated users.
-   **`src/ai`**: All Generative AI logic resides here. Genkit flows are defined in `src/ai/flows` and are responsible for interacting with the Gemini models.
-   **`src/components`**:
    -   `features`: High-level components that are specific to a feature (e.g., `MarketplaceClient`, `ProfileClient`).
    -   `layout`: Components that define the overall structure of the app (e.g., `Header`, `SidebarNav`).
    -   `ui`: Low-level, reusable UI elements from ShadCN (e.g., `Button`, `Card`).
-   **`src/context`**: Houses React Context providers for global state management, such as the shopping cart (`CartProvider`) and the user profile modal (`UserProfileDialogProvider`).
-   **`src/firebase`**: Core Firebase setup.
    -   `config.ts`: Contains the Firebase project configuration.
    -   `provider.tsx` & `client-provider.tsx`: Initialize and provide Firebase services to the React component tree.
    -   `auth/` & `firestore/`: Contain custom hooks like `useUser`, `useCollection`, and `useDoc`.
-   **`src/lib`**: Contains server-side logic and utility functions.
    -   `actions`: Server Actions for interacting with the database (e.g., creating posts, adding comments). This is where most client-side calls to Firestore are abstracted.
-   **`docs/`**: Holds documentation and the backend definition file. `backend.json` is a critical file that provides a schema for all data entities, acting as a single source of truth for the database structure.

---

## 5. Firebase Backend

### `docs/backend.json`

This file is the "blueprint" for the Firestore database. It defines:
-   **Entities**: JSON Schema definitions for every data model in the application (e.g., `UserProfile`, `Post`, `Product`).
-   **Firestore Paths**: Maps collection and subcollection paths to their corresponding entity schemas.

This file is used as a reference to ensure consistency when writing Firestore security rules and data access code.

### `firestore.rules`

This file defines the security rules for the Firestore database. It controls who can read, write, update, or delete documents in each collection. The rules are written in Firebase's Common Expression Language (CEL) and are critical for securing user data.

### Data Models

-   **UserProfile**: Managed by Firebase Authentication and supplemented by a `UserProfile` document in the `/users` collection. Includes roles like `admin`, `moderator`, `farmer`, and `user`.
-   **Community**: Represents a topic or group (e.g., "Organic Farming"). Stored in the `/communities` collection.
-   **Post**: A user-submitted post within a community. Stored in the `/posts` collection.
-   **Comment**: A reply to a post. Stored in a subcollection at `/posts/{postId}/comments/{commentId}`.
-   **Product**: An item for sale in the **Verified Marketplace**. Stored in `/products`.
-   **MarketplacePost**: An item for sale/trade in the **Indirect Market**. Stored in `/marketplacePosts`.
-   **Conversation & Message**: Used for the direct messaging feature.

---

## 6. AI Flows with Genkit

The application's AI capabilities are powered by Google's Gemini models, orchestrated through **Genkit**.

-   **Location**: All flows are defined in `src/ai/flows/`.
-   **Structure**: Each flow file typically defines:
    1.  An **Input Schema** (using Zod) for the data the flow expects.
    2.  An **Output Schema** (using Zod) for the data the flow will return.
    3.  A **Prompt** that instructs the AI model on how to process the input.
    4.  A **Flow Function** that ties the prompt, input, and output together.
    5.  An exported async **wrapper function** that allows client components to easily call the flow.

**Example (`crop-disease-diagnosis.ts`):**
1.  Takes a photo (as a data URI).
2.  Sends it to the Gemini model with a prompt asking it to act as an expert diagnostician.
3.  Returns a structured JSON object with the disease name, confidence, and recommended steps, as defined by the `DiagnoseCropDiseaseOutputSchema`.

---

## 7. Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm

### Installation & Setup

1.  **Clone the repository.**
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:** Create a `.env` file at the root of the project. You will need to populate it with your Firebase project configuration if it's not already there.
4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:9002](http://localhost:9002).

5.  **Run the Genkit Inspector (Optional):** To inspect and test AI flows, run the Genkit development UI.
    ```bash
    npm run genkit:watch
    ```
    This will start the UI on [http://localhost:4000](http://localhost:4000).
