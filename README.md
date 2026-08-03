# 🍳 AI Recipe Studio — AI-Powered Recipe Generator

A full-stack AI-powered web application that transforms available ingredients into personalized recipes using Large Language Models (LLMs). Simply enter the ingredients you have, and AI Recipe Studio generates complete recipes with cooking instructions, making everyday meal planning easier and smarter.

---

# 🚀 Live Application

### 🌐 Live Demo
https://ai-recipe-studio-8xe6-frgqcjkko-buildingon.vercel.app

---

# 📌 About the Project

Many people struggle to decide what to cook with the ingredients already available in their kitchen. Traditional recipe websites require users to search manually and often suggest recipes that require additional ingredients.

AI Recipe Studio solves this problem by allowing users to enter the ingredients they already have and using AI to generate personalized recipes instantly.

The application combines a modern React frontend with an Express backend and integrates the Groq LLM API to generate recipes dynamically.

The goal of this project is to demonstrate how Generative AI can be integrated into a real-world full-stack application while maintaining an intuitive and responsive user experience.

---

# ✨ Key Features

## 🤖 AI Recipe Generation
Generate complete recipes using Groq's Large Language Model based on the ingredients provided by the user.

---

## 🥗 Ingredient-Based Search

Search recipes simply by entering available ingredients instead of searching recipe names.

---

## 🎙️ Voice Search

Supports voice input, allowing users to speak ingredients instead of typing them manually.

---

## 🔍 Smart Ingredient Suggestions

Provides dynamic ingredient suggestions while typing for a smoother search experience.

---

## 🍛 Popular Recipe Categories

Browse popular cuisines and recipe categories directly from the landing page.

---

## 🎨 Modern User Interface

- Clean minimal design
- Responsive layout
- Interactive animations
- Mobile-friendly experience
- Dark and Light theme support

---

## ⚡ Optimized Performance

- Debounced search
- Fast API communication
- Efficient state management
- Component-based architecture

---

## ☁️ Cloud Deployment

Frontend and backend are deployed using Vercel for fast and reliable access.

---

# 🧠 AI Workflow

The recipe generation pipeline follows these steps:

```
User Ingredients
        │
        ▼
React Frontend
        │
        ▼
Express Backend API
        │
        ▼
Groq AI Model
        │
        ▼
Recipe Generation
        │
        ▼
Structured JSON Response
        │
        ▼
Interactive Recipe Interface
```

---

# 🔄 Application Workflow

1. Open AI Recipe Studio
2. Enter ingredients or use voice input
3. Submit the request
4. Backend validates the input
5. Request is sent to Groq AI
6. AI generates a personalized recipe
7. Recipe is formatted and displayed
8. Users can continue exploring new recipes

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

---

## Backend

- Node.js
- Express.js
- TypeScript

---

## AI Integration

- Groq API
- Large Language Model (LLM)

---

## State Management

- Zustand

---

## Development Tools

- Git
- GitHub
- ESLint
- npm

---

## Deployment

- Vercel

---

# 📂 Project Structure

```
ai-recipe-studio/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── schemas/
│   │   ├── data/
│   │   └── constants/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

# 💻 Run Locally

## 1. Clone the Repository

```bash
git clone https://github.com/sadankumar-20/ai-recipe-studio.git
```

---

## 2. Navigate to the Project

```bash
cd ai-recipe-studio
```

---

## 3. Install Frontend Dependencies

```bash
cd client

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## 4. Install Backend Dependencies

```bash
cd ../server

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

# 📸 Screenshots

> Add screenshots of the following pages:

- Landing Page
- AI Recipe Generator
- Recipe Results
- Workspace
- Mobile View

---

# 🎯 Learning Outcomes

This project helped strengthen my understanding of:

- Building scalable full-stack applications
- Integrating Generative AI into web applications
- API design using Express
- State management with Zustand
- Responsive UI development using React
- TypeScript best practices
- Component-based architecture
- Production deployment with Vercel

---

# 🔮 Future Enhancements

Some planned improvements include:

- User authentication
- Save favorite recipes
- Recipe history
- Nutritional information
- Grocery list generation
- Meal planner
- AI image generation for recipes
- Multi-language support
- Recipe sharing
- OCR-based ingredient detection
- Barcode scanning for packaged foods

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "feat: add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---



# 👨‍💻 Developer

**Sadan K**

B.Tech – Data Science & Artificial Intelligence  
Indian Institute of Information Technology (IIIT) Dharwad

### GitHub

https://github.com/sadankumar-20

---

# ⭐ Project Links

### 🌐 Live Application

https://ai-recipe-studio-8xe6-frgqcjkko-buildingon.vercel.app

### 📂 GitHub Repository

https://github.com/sadankumar-20/ai-recipe-studio

---

⭐ If you found this project interesting, consider giving it a star!
