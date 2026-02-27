# 🌾 Farmingo - A Modern Platform for Farmers

Welcome to **Farmingo**, your all-in-one web platform engineered to empower farmers with modern technology. Built with a powerful stack including Next.js, Firebase, and Google's Gemini AI, this application provides a robust suite of tools designed to enhance decision-making, foster a strong community, and streamline agricultural commerce.

---

## ✨ Core Features

Farmingo is designed with the modern farmer in mind, providing a comprehensive set of tools to tackle daily challenges and seize new opportunities.

### 🤖 AI-Powered Intelligence Hub
-   **📈 Crop Price Prediction**: Leverage sophisticated AI models to forecast market prices for various crops. Make informed decisions on when to sell to maximize your profits.
-   **🌿 Crop Disease Diagnosis**: Instantly diagnose crop diseases by simply uploading a photo. Our AI provides a detailed analysis, severity assessment, and actionable treatment recommendations.
-   **🌦️ Weather Prediction & Advisory**: Access hyper-localized weather forecasts and receive intelligent farming advice tailored to current and upcoming weather patterns, helping you optimize your activities from planting to harvest.
-   **🗣️ Smart Translation**: Break down language barriers with seamless, AI-powered text translation across the platform, including community posts and marketplace listings.

### ⚙️ Integrated Platform Tools
-   **🛒 Dual Marketplace**: A versatile e-commerce system:
    -   **Verified Market**: A trusted space for certified sellers to list high-quality products directly.
    -   **Indirect Market**: A community-driven forum where any user can post items for sale, trade, or hire.
-   **💬 Community Hub**: A dynamic social forum where farmers can connect, ask questions, share knowledge, and build a supportive network with peers and agricultural experts.
-   **👤 User Profiles & Messaging**: Manage your public profile, set a default location for weather predictions, follow other users, and engage in private one-on-one conversations with direct messaging.
-   **🛒 Shopping Cart & Orders**: A full-featured e-commerce experience, from adding products to a persistent cart to managing order history.

---

## 🛠️ Technology Stack

This project is built on a modern, robust, and scalable technology stack, ensuring a high-quality user experience and developer-friendly codebase.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Generative AI**: [Google's Gemini models](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS-in-JS for theming
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Deployment**: Optimized for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or newer recommended)
-   npm (or your preferred package manager like yarn or pnpm)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SwapCodesDev/farmingo.git
    cd farmingo
    ```

2.  **Install Dependencies:**
    This command installs all the necessary packages for the project.
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    Once dependencies are installed, start the Next.js development server.
    ```bash
    npm run dev
    ```

4.  **Open the App:**
    The application will be available at [http://localhost:9002](http://localhost:9002).

### Running Genkit Flows (Optional)

If you are developing AI features, you may want to run the Genkit development UI to inspect and test your flows.

```bash
npm run genkit:watch
```
This will start the Genkit inspector, typically on [http://localhost:4000](http://localhost:4000).

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please refer to the project's contributing guidelines for more information.
