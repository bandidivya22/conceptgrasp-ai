# ConceptGrasp AI
A complete, production-ready AI-powered learning platform. ConceptGrasp AI helps students learn smarter with AI-generated flashcards, quizzes, study plans, personalized recommendations, and an AI tutor — all in one beautiful, modern interface

---

## 🚀 Live Demo

### 🌐 Frontend
 
 https://conceptgrasp-ai.onrender.com

### ⚡ Backend API

https://conceptgrasp-api.onrender.com

---

# 📌 Features

## 🔐 Authentication

- User Registration
- Login with JWT Authentication
- Protected Routes
- User Profile Management
- Password Encryption using bcrypt

---

## 📊 Dashboard

- Beautiful Glassmorphism UI
- Responsive Design
- Dark/Light Theme
- Study Statistics
- Weekly Study Hours Chart
- Quiz Performance Graph
- Subject Progress Chart
- Recent Activities

---

## 📄 Document Management

- Upload PDF Files
- Upload DOCX Files
- Upload TXT Files
- AI Document Summary
- Search Documents
- Filter by Subject
- Delete Documents

---

## 🧠 AI Flashcards

- Generate Flashcards from Documents
- Flip Card Animation
- Bookmark Flashcards
- Shuffle Cards
- Mark as Learned

---

## 📝 AI Quiz Generator

- Multiple Choice Questions
- True / False Questions
- Short Answer Questions
- Timer
- Progress Tracking
- Quiz History
- Instant Score & Review

---

## 📅 AI Study Planner

Generate personalized

- Daily Study Plans
- Weekly Study Plans
- Revision Schedule

based on

- Subjects
- Available Study Hours
- Exam Date
- Weak Topics

---

## 🤖 AI Tutor

- AI Chat Assistant
- Instant Doubt Solving
- Conversation History
- Markdown Support

---

## 📈 Progress Tracker

- Study Hours Analytics
- Subject Progress
- Quiz Performance
- Learning Streak
- Achievement Tracking

---

## 🎯 AI Recommendations

Personalized recommendations including

- Topics to Revise
- Weak Subjects
- Practice Suggestions
- Daily Goals
- Learning Strategy

---

# 🖼 Screenshots

## Login

<img width="1897" height="915" alt="image" src="https://github.com/user-attachments/assets/b3aa7343-6d82-4595-b0bf-081a04378e64" />



---

## Dashboard

<img width="1907" height="912" alt="image" src="https://github.com/user-attachments/assets/63b21344-7882-45f5-9ad4-67cc1041a782" />

---

## Documents

<img width="1900" height="922" alt="image" src="https://github.com/user-attachments/assets/31476a26-56cb-4b5c-b05f-45dc4961edd5" />



---

## Flashcards

<img width="1897" height="897" alt="image" src="https://github.com/user-attachments/assets/d6f702d9-3d7a-4ecc-9045-ce5f501f72a1" />


---

## Quiz

<img width="1882" height="922" alt="image" src="https://github.com/user-attachments/assets/3d5734a4-5ff6-427e-9884-f1a3247891a0" />


---

## AI Tutor
<img width="1865" height="896" alt="image" src="https://github.com/user-attachments/assets/2abe1e80-d05e-49b6-a8a4-6d7e606eaae9" />


---

## Study Planner

<img width="1900" height="897" alt="image" src="https://github.com/user-attachments/assets/c006910e-f9ef-48da-a596-5890957aabd7" />


---

## Progress

<img width="1901" height="922" alt="image" src="https://github.com/user-attachments/assets/7aebbb0d-9531-4bdf-afd6-7937114b9185" />


---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Query
- Axios
- Framer Motion
- React Hook Form
- Zod
- Recharts
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Multer
- Google Gemini AI API
- pdfjs-dist
- Mammoth
  
```text
ConceptGrasp/
├── client/                  
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          
│   │   │   ├── layout/      # App layout, Sidebar, Navbar
│   │   │   └── charts/      # Recharts wrappers
│   │   ├── context/         # Auth & Theme providers
│   │   ├── lib/             
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, Forgot/Reset
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Flashcards.tsx
│   │   │   ├── Quizzes.tsx
│   │   │   ├── QuizTake.tsx
│   │   │   ├── AIChat.tsx
│   │   │   ├── StudyPlanner.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/       
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Helpers
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                  # Backend Express + MongoDB reference
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # auth, error, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Gemini AI service
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
├── .env.example

# ⚙ Installation

Open http://localhost:5173, register an account, and start using ConceptGrasp AI.
=======
---

<<<<<<< HEAD
## Backend Setup
=======
=======


# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/bandidivya22/conceptgrasp-ai.git

cd conceptgrasp-ai
```


## Backend Setup

```bash
cd server

npm install

npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

# 🔑 Environment Variables

## Backend (.env)

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🧠 AI Features

✔ AI Document Summarization

✔ AI Flashcard Generation

✔ AI Quiz Generation

✔ AI Study Planner

✔ AI Tutor Chat

✔ Personalized Learning Recommendations

---

# 📌 REST API Modules

- Authentication
- Dashboard
- Documents
- Flashcards
- Quizzes
- Study Planner
- AI Tutor
- Recommendations
- Progress Tracker

---

# 🚀 Future Improvements

- OCR Support for Images
- Voice-enabled AI Tutor
- Pomodoro Timer
- Mobile App
- Calendar Integration
- Group Study Rooms
- Leaderboards

---

# 👩‍💻 Author

**Divya Bandi**

GitHub

https://github.com/bandidivya22

LinkedIn

https://www.linkedin.com/in/bandi-hema-mahalakshmi-sri-divya-105615276/

---

# ⭐ Show Your Support

If you like this project, please consider giving it a ⭐ on GitHub.

It really helps and motivates me to build more awesome projects.
