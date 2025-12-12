# BreatheThrough 🫁✨

> **An AI-powered crisis management and immersive therapy companion for Sickle Cell Anemia patients.**

## 📖 Overview

**BreatheThrough** is a holistic digital health application designed to empower individuals living with Sickle Cell Disease and chronic pain conditions. It bridges the gap between daily health management and crisis intervention by combining rigorous tracking tools with advanced Generative AI.

Whether managing a daily medication regimen, seeking immediate triage advice, or utilizing generative visualization for pain management, BreatheThrough acts as an intelligent, empathetic companion.

## 🌟 Key Features

### 1. 🏠 Medical Dashboard
*   **Health Vitals**: Tracks "Days Since Last Crisis" and "Medication Adherence" to provide a snapshot of patient stability.
*   **Status Indicator**: Automatically flags patient status as "Stable" or "Monitor Closely" based on recent pain logs.
*   **Regimen Tracker**: Interactive daily checklist for medications.

### 2. 🤖 Dr. Gemini Triage Agent
*   **AI Assessment**: Powered by **Gemini 2.5 Flash**, this medical agent assesses symptom severity and provides clinical advice.
*   **Location Intelligence**: Uses **Google Maps Grounding** to find real-time nearby hospitals and specialists based on the user's GPS location.
*   **Red Flag Detection**: Automatically detects emergency keywords (chest pain, fever, seizure) to prioritize urgent care.

### 3. 🥽 Immersive Therapy
*   **Generative Environments**: Utilizes **Gemini 3 Pro (Nano Banana Pro)** to generate photorealistic, serene VR-style backgrounds based on user text prompts (e.g., "A quiet snowy cabin").
*   **Guided Breathing**: Includes three evidence-based breathing animations:
    *   **Resonance (Coherent)**: 5s In / 5s Out for nervous system balance.
    *   **Box Breathing**: 4-4-4-4 pattern for focus and stress control.
    *   **4-7-8**: Deep relaxation technique for anxiety and sleep.

### 4. 📅 Intelligent Journaling
*   **Pain Calendar**: Visual grid tracking pain intensity (0-10), with specific indicators for "Zero Pain" (Wellness) days and Crisis events.
*   **Pattern Recognition**: Uses AI to analyze historical logs and identify potential triggers such as weather, specific activities, or contexts (School/Work).

### 5. 👤 Profile & Medical ID
*   **Condition Management**: Stores Sickle Cell Type (SS, SC, Beta Thalassemia, etc.), Blood Type, and Physician details.
*   **Emergency Card**: Quick access to emergency contact information.

## ⚡ Technology Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: TailwindCSS (Custom "Zinc & Sky" Dark Mode Theme)
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
*   **Models**: 
    *   `gemini-3.0-flash` (Triage & Analysis)
    *   `gemini-3-pro-image-preview` (Image Generation)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/axroux/breathethrough.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm start
    ```

## ⚠️ Medical Disclaimer

**BreatheThrough is a health support tool and does not provide medical diagnosis.** The AI features are simulations designed to aid in management. Always seek the advice of your physician or qualified health provider regarding a medical condition. In case of a medical emergency, call emergency services immediately.

---

*Designed with ❤️ for the Sickle Cell Warrior Community.*
