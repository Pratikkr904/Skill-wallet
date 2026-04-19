
# SkillSwap

A full-stack web application for skill sharing and exchange.

## Project Structure

```
SkillSwap/
├── client/                      # React Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Buttons, etc.)
│   │   ├── pages/               # Full pages (Login, Dashboard, Profile)
│   │   ├── store/               # Redux state management
│   │   ├── App.jsx              # Main routing file
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Frontend environment variables
│   ├── .gitignore               # Git ignore file
│   ├── index.html               # HTML entry point
│   └── package.json             # Frontend dependencies
│
└── server/                      # Node.js Backend
    ├── config/                  # Database connection logic
    ├── controllers/             # Request handlers (business logic)
    ├── middleware/              # Auth & security middleware (JWT verification)
    ├── models/                  # Database schemas (User.js, Request.js)
    ├── routes/                  # API endpoints (authRoutes.js, userRoutes.js)
    ├── .env                     # Backend environment variables (DB keys, secrets)
    ├── .gitignore               # Git ignore file
    ├── index.js                 # Main server entry point
    └── package.json             # Backend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SkillSwap
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Technologies Used

### Frontend
- React
- React Router
- Redux
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication

## License

ISC
=======
# Skill-wallet
SkillSwap is a full-stack MERN web application that enables users to exchange skills by offering expertise and requesting learning opportunities. The platform includes authentication, user profiles, skill-based search, and a request management system to facilitate peer-to-peer learning.

