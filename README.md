# Interview Task

A full-stack application with separate frontend and backend folders.

## Project Structure

```
Interview-Task/
├── frontend/          # React + Vite + Tailwind CSS + TypeScript
└── backend/           # Node.js + Express.js + MySQL
```

## Frontend Setup

The frontend is built with:
- React 18
- Vite
- Tailwind CSS
- TypeScript

### Getting Started

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Backend Setup

The backend is built with:
- Node.js
- Express.js
- MySQL (raw SQL queries, no ORM)

### Getting Started

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=interview_task
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

## Database

The backend uses MySQL with raw SQL queries. Make sure you have MySQL installed and running, and create the database specified in your `.env` file.

## Development

- Frontend runs on port 3000
- Backend runs on port 5000
- The frontend is configured to proxy API requests to the backend
