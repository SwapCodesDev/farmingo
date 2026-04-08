# Project Overview: Farmingo

This document serves as a comprehensive technical reference for the Farmingo project, an all-in-one agricultural platform built with Next.js, Firebase, and Genkit AI.

## 🏗 Core Architecture

### 1. Generative AI (Genkit & Groq)
- **`src/ai/genkit.ts`**: Initializes the Genkit instance and configures the Groq SDK.
- **`src/ai/flows/weather-prediction.ts`**: Orchestrates weather data fetching (OpenWeatherMap) and generates agricultural advisories using Llama 3.3.
- **`src/ai/flows/crop-disease-diagnosis.ts`**: Uses vision models to analyze plant photos and provide diagnosis, severity, and treatment steps.
- **`src/ai/flows/crop-price-prediction.ts`**: Analyzes regional market data to forecast crop values.
- **`src/ai/flows/translate-text.ts`**: Handles multi-string translation while preserving Markdown formatting for agricultural content.

### 2. Server Actions & API Integrations
- **`src/app/actions/predict-price.ts`**: Queries a specialized Hugging Face endpoint for coordinate-based APMC price data.
- **`src/app/actions/demand-supply.ts`**: Processes market trends to calculate supply gaps and price shifts.
- **`src/app/actions/recommend-crop.ts`**: Fetches crop recommendations based on location and weather metrics.
- **`src/app/actions/predict-disease-api.ts`**: Proxy for external crop-specific diagnosis models.

### 3. Firebase & Database Layer
- **`src/firebase/index.ts`**: The central entry point for Firebase Client SDK initialization (Auth, Firestore).
- **`src/firebase/provider.tsx`**: React context provider making Firebase services available throughout the component tree.
- **`src/firebase/firestore/use-collection.tsx`**: A custom hook for real-time Firestore collection syncing with automatic error handling.
- **`src/firebase/firestore/use-doc.tsx`**: A custom hook for real-time document tracking.
- **`src/lib/actions/community.ts`**: Core logic for creating/editing posts, voting, and nested comment management in the community hub.
- **`src/lib/actions/marketplace-post.ts`**: Handles the lifecycle of indirect marketplace listings and their social interactions.
- **`src/lib/actions/messages.ts`**: Manages real-time 1-on-1 conversations, message persistence, and read receipts.

### 4. Application Logic & Context
- **`src/context/cart-provider.tsx`**: Manages a persistent shopping cart for the verified marketplace using local storage.
- **`src/context/search-provider.tsx`**: Provides global search state for the dashboard and feature filtering.
- **`src/context/user-profile-dialog-provider.tsx`**: Controls the visibility and content of the shared public profile view.
- **`src/hooks/use-auth-actions.ts`**: A wrapper hook that injects toast notifications and auth checks into standard server actions.

### 5. Internationalization (I18n)
- **`src/i18n/routing.ts`**: Defines supported locales (`en`, `hi`, `mr`) and exports localized navigation components (`Link`, `useRouter`).
- **`messages/*.json`**: Translation dictionaries containing all UI strings for supported languages.
- **`src/middleware.ts`**: Intercepts requests to handle locale detection and redirection.

### 6. UI Components (`src/components/`)
- **`layout/`**: Contains the `AppLayout`, `SidebarNav`, and `Header` which define the application's shell.
- **`features/`**: Modular components for specific tools:
    - `marketplace-client.tsx`: The dual-market view.
    - `weather-prediction-client.tsx`: Coordinates-based weather dashboard.
    - `post-detail-client.tsx`: High-complexity thread rendering for community discussions.
    - `image-crop-dialog.tsx`: Reusable utility for processing user uploads before AI analysis or listing creation.

## 🔒 Security & Standards
- **`firestore.rules`**: Implements a robust "deny-list" ownership model, protecting immutable metadata while allowing authors to manage their content.
- **`docs/backend.json`**: The architectural blueprint defining the schema for `UserProfile`, `Post`, `Product`, and `Conversation` entities.
- **`src/lib/image-processing.ts`**: Handles client-side WebP conversion and cropping to optimize bandwidth and AI processing costs.