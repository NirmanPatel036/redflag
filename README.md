# 🚩 Red Flag Catcher

A brutally honest second opinion for your messages, job offers, and contracts. Get a blunt red-flag analysis with a clear verdict in seconds.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

## ✨ Features

- **Brutally Honest AI Analysis**: Powered by Anthropic Claude for sharp, no-sugarcoating verdicts.
- **Context-Aware**: Specialized judgment for Relationship Messages, Job Offers, and Contracts.
- **Privacy First**: Anonymous by default. Sessions are short-lived and data is auto-deleted.
- **Seamless UI**: Immersive 3D animations with Three.js and fluid Framer Motion transitions.
- **Exportable Results**: Share your verdict as high-quality PNG or multi-page PDF.
- **Supabase Integration**: Optional auth for persistent history and increased daily limits.

## 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-repo/redflag.git
   cd redflag
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`

4. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Database & Auth**: Supabase
- **Visuals**: Three.js (Fiber) + Framer Motion
- **Export**: html-to-image + jsPDF

---

*Because sometimes you just need to be told to walk away.*
