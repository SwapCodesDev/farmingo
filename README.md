
# 🌾 Farmingo - A Platform for Farmers

Welcome to **Farmingo**, an all-in-one web platform designed to empower farmers with modern technology. Built with Next.js, Firebase, and cutting-edge AI, this application provides a suite of tools to enhance decision-making, foster community, and streamline commerce in the agricultural sector.

---

## ✨ Features

Farmingo is packed with features to support every aspect of modern farming:

### 🤖 AI-Powered Insights
-   **📈 Crop Price Prediction**: Leverages AI to forecast market prices for various crops, helping you sell at the right time for the best price.
-   **🌿 Crop Disease Diagnosis**: Instantly diagnose crop diseases by uploading a photo. Get AI-driven analysis, severity assessment, and treatment recommendations.
-   **🌦️ Weather Prediction & Advice**: Get localized weather forecasts and actionable farming tips tailored to current and upcoming weather conditions to optimize your activities.

### ⚙️ Platform Tools
-   **🛒 Marketplace**: A built-in e-commerce platform for buying and selling agricultural products and supplies directly with other farmers.
-   **💬 Community Hub**: A social forum for farmers to connect, ask questions, share knowledge, and build a supportive network with peers and experts.
-   **👤 User Profiles**: Manage your account, set a default location for weather predictions, and customize your experience.

---

## 🛠️ Technology Stack

This project is built on a modern, robust, and scalable tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Generative AI**: [Google's Gemini models](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
-   **Styling**: CSS-in-JS with `tailwindcss-animate`
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm (or yarn/pnpm)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SwapCodesDev/farmingo.git
    cd farmingo
    ```

2.  **Install Dependencies:**
    This command will install all the necessary packages for the project.
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    Once the dependencies are installed, start the Next.js development server.
    ```bash
    npm run dev
    ```

4.  **Open the App:**
    The application will be available at [http://localhost:9002](http://localhost:9002).

### Running Genkit Flows (Optional)

If you are developing AI features, you may want to run the Genkit development server to inspect and test your flows.

```bash
npm run genkit:watch
```
This will start the Genkit development UI, typically on [http://localhost:4000](http://localhost:4000).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please refer to the project's contributing guidelines for more information.
