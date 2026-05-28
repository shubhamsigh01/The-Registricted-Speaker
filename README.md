# The Restricted Speaker (HeadsUp! Game)

A modern, premium, and fully responsive word-guessing party game inspired by "Heads Up!". The game is designed to adapt seamlessly across all mobile, tablet, and desktop devices, featuring dynamic animations, beautiful dark-mode styling, category selection, and real-time score tracking.

## Features

- **Modern Responsive Design**: Optimized layout that adapts to any screen size (mobile, tablet, desktop).
- **Vibrant Dark-Themed UI**: Built using React, Tailwind CSS v4, Radix UI primitives, and Framer Motion (via `motion`) for smooth animations and transitions.
- **Multiple Word Packs & Categories**: Choose from various curated packs (Classic, Family, Party, Everything) and categories (Superheroes, Movies, Animals, Food, etc.).
- **Interactive Gameplay**:
  - Auto-revealing hints after 8 seconds of inactivity.
  - Keyboard shortcuts (`ArrowLeft` for Skip, `ArrowRight` for Correct) for easy testing and desktop gameplay.
  - Interactive tap actions for Skip and Correct.
- **Dynamic Feedback & Streaks**: Visual streak indicators, particle confetti effects on the results screen, and a round accuracy breakdown.
- **Deployment-Ready**: Configured for Vercel deployment with necessary security headers and device orientation permissions policy.

---

## Tech Stack

- **Framework**: React 18 & TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Components & Icons**: Radix UI Primitives, Lucide Icons, Material UI Icons
- **Animations**: Framer Motion / Motion, Canvas Confetti

---

## Getting Started

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 2. Install Dependencies
Run the following command to install the required packages:
```bash
npm install
```

### 3. Run Development Server
Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
To build the application for production:
```bash
npm run build
```
This generates a highly optimized static build in the `dist/` directory.

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── components/  # ActionButton, HoldButton, CategoryCard, GameWordCard, UI components
│   │   ├── data/        # Game category and word pack datasets
│   │   ├── screens/     # Screens (Home, Pack Select, Category Select, Game, Results, HowTo)
│   │   ├── types/       # TypeScript type declarations
│   │   └── App.tsx      # Main application router and state management
│   ├── styles/          # Tailwind, theme, font, and global stylesheets
│   └── main.tsx         # Application entry point
├── package.json         # Project dependencies and script configurations
├── vite.config.ts       # Vite bundler configuration
└── vercel.json          # Deployment and header configurations
```

---

## License

This project is configured for private use. Design reference is available at the [Responsive Game App Design on Figma](https://www.figma.com/design/3WQ96yBzQQTKp7mKBDy2b7/Responsive-Game-App-Design).