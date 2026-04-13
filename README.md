# Solas Operating System

**Solas OS** is a premium, privacy-first Emotional Operating System. Designed as an intelligent mental wellness companion, Solas integrates Cognitive Behavioral Therapy (CBT) principles, dynamic AI personas, and structured emotional tracking into a sleek, minimal SaaS interface.

![Solas OS Banner](https://via.placeholder.com/1200x400/0a0a0b/8b5cf6?text=SOLAS+OS)

## 🌟 Core Features

- **The Sanctuary (Dynamic Chat):** Engage in end-to-end encrypted, therapeutic reflection. Solas can instantly shift its interaction paradigm across multiple certified modalities:
  - *Stoic Philosophy*
  - *Gentle Validation*
  - *Direct Accountability*
  - *Attachment Theory*
  - *Trauma-Sensitive Empathy*
- **Insights Dashboard:** Automatic tracking of your emotional intensity, identified cognitive distortions, and recurring environmental triggers using continuous `Recharts` data visualization.
- **Guided Journaling (CBT):** A dedicated console for Cognitive Restructuring to logically process automatic thoughts and formulate rational reframes over time.
- **Crisis Detection Middleware:** Built-in semantic analysis capable of bypassing LLM generation to immediately suggest grounding techniques out-of-band.

## ⚙️ Tech Stack

*   **Framework:** Next.js (App Router, React 18/19)
*   **Styling:** TailwindCSS V4 & Framer Motion
*   **Authentication:** Supabase Auth (SSR + Google OAuth)
*   **AI Orchestration:**
    *   **Cloud Layer:** Groq SDK (Llama 3 70B via standard OpenAI specifications)
    *   **Local Layer:** HuggingFace `Transformers.js` for on-device sentiment pre-processing.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/pratikshit19/Solas.git
cd Solas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and configure your backend parameters:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI Integrations
NEXT_PUBLIC_GROQ_API_KEY=your_groq_llama_key
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## 🔒 Security & Privacy Notice
Solas is architected for absolute privacy. Authentic user logs are intended to be processed through strict RLS (Row Level Security) policies within Supabase to ensure sessions remain entirely private to the authenticated Pilot.
