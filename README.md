# Idea Manager

A full-stack web application for systematically managing creative ideas and business concepts.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)

## Features

### Idea Management
- **CRUD Operations**: Create, read, update, and delete ideas
- **Status Tracking**: Draft, In Progress, Completed, Archived
- **Priority Levels**: High, Medium, Low
- **Category Classification**: Flexible category assignment
- **Tag System**: Multi-tag organization
- **History Tracking**: Automatic change log for all modifications

### Kanban Board
- **Drag & Drop**: Intuitive status updates
- **4 Columns**: Draft → In Progress → Completed → Archived
- **Real-time Updates**: Instant state persistence

### Dashboard
- **Statistics Cards**: Total ideas, completion rate, in-progress count, high priority items
- **Charts**: Status and priority distribution visualization
- **Recent Activity**: Recently modified ideas
- **Popular Categories/Tags**: Top usage statistics

### Daily Memos
- **Date-based Notes**: Daily record management
- **Quick Access**: Direct memo entry from dashboard

### AI Features
- **Auto-categorization**: Keyword-based category suggestions
- **Tag Recommendations**: Content-based tag proposals
- **Improvement Suggestions**: Enhancement guides for ideas

### User Interface
- **Responsive Design**: Desktop, tablet, and mobile support
- **Dark Mode**: Light/dark theme toggle
- **Keyboard Shortcuts**: Ctrl+N (new idea), Ctrl+K (search), and more
- **PWA Support**: Offline usage and app installation

## Tech Stack

### Frontend
- **React 19** + TypeScript 5.8
- **Vite 7** - Build tool
- **React Router DOM 7** - Routing
- **Recharts** - Chart visualization
- **@dnd-kit** - Drag and drop
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Backend
- **Express 5** - API server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password encryption

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL database

### Installation

```bash
# Clone repository
git clone https://github.com/araeLaver/idea_manager.git
cd idea_manager

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Database Configuration
DATABASE_HOST=your-database-host
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# API Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Frontend API URL
VITE_API_URL=http://localhost:3001/api
```

### Development

```bash
# Backend server only
npm run dev:server

# Frontend only
npm run dev

# Run both (recommended)
npm run dev:all
```

### Build

```bash
npm run build
```

## API Documentation

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Current user info |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

#### Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Ideas API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas` | List ideas (filter/search) |
| GET | `/api/ideas/:id` | Get idea details |
| POST | `/api/ideas` | Create idea |
| PUT | `/api/ideas/:id` | Update idea |
| DELETE | `/api/ideas/:id` | Delete idea |
| GET | `/api/ideas/stats/summary` | Get statistics |
| PATCH | `/api/ideas/bulk/status` | Bulk status update |

#### Create Idea
```bash
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "AI-based Recommendation System",
    "description": "Personalized recommendations based on user behavior",
    "category": "Technology",
    "tags": ["AI", "ML", "Recommendation"],
    "status": "draft",
    "priority": "high",
    "targetMarket": "E-commerce platforms",
    "potentialRevenue": "$10,000/month",
    "resources": "2 ML Engineers",
    "timeline": "6 months"
  }'
```

#### List Ideas (Filtering)
```bash
# Filter by status
curl "http://localhost:3001/api/ideas?status=in-progress" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search
curl "http://localhost:3001/api/ideas?search=AI" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined filters
curl "http://localhost:3001/api/ideas?status=draft&priority=high&category=Technology" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Memos API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memos` | List memos |
| GET | `/api/memos/date/:date` | Get memo by date |
| POST | `/api/memos` | Create/update memo |
| DELETE | `/api/memos/:id` | Delete memo |
| DELETE | `/api/memos/date/:date` | Delete by date |

#### Save Memo
```bash
curl -X POST http://localhost:3001/api/memos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2024-01-15",
    "content": "Today's brainstorming session notes..."
  }'
```

### History API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | All history |
| GET | `/api/history/idea/:ideaId` | History by idea |
| GET | `/api/history/recent` | Recent activity summary |

## Database Schema

### users Table
```sql
CREATE TABLE idea_manager.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### ideas Table
```sql
CREATE TABLE idea_manager.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  notes TEXT,
  target_market TEXT,
  potential_revenue TEXT,
  resources TEXT,
  timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### daily_memos Table
```sql
CREATE TABLE idea_manager.daily_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);
```

### idea_history Table
```sql
CREATE TABLE idea_manager.idea_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES idea_manager.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES idea_manager.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
idea_manager/
├── server/                    # Backend
│   └── src/
│       ├── index.ts          # Express server entry point
│       ├── database.ts       # DB connection and schema initialization
│       ├── middleware/
│       │   └── auth.ts       # JWT authentication middleware
│       └── routes/
│           ├── auth.ts       # Authentication routes
│           ├── ideas.ts      # Ideas CRUD
│           ├── memos.ts      # Memos CRUD
│           └── history.ts    # History queries
├── src/                       # Frontend
│   ├── components/           # Reusable components
│   │   ├── Layout.tsx
│   │   ├── AIAssistant.tsx
│   │   └── AIFeatures.tsx
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx
│   │   ├── IdeaList.tsx
│   │   ├── IdeaDetail.tsx
│   │   ├── IdeaForm.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── SearchPage.tsx
│   │   ├── History.tsx
│   │   ├── DailyMemos.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── contexts/             # React Context
│   │   ├── AuthContext.tsx
│   │   ├── DataContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/             # API services
│   │   ├── api.ts
│   │   └── aiService.ts
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   └── utils/                # Utilities
├── public/                    # Static files
├── .env                       # Environment variables
├── package.json
├── vite.config.ts
└── README.md
```

## Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl/Cmd + N` | Create new idea |
| `Ctrl/Cmd + K` | Search page |
| `Ctrl/Cmd + D` | Toggle dark mode |
| `1` | Dashboard |
| `2` | Ideas list |
| `3` | Kanban board |
| `4` | History |
| `G + D` | Go to dashboard |
| `G + L` | Go to list |
| `G + K` | Go to kanban |

## Scripts

```bash
npm run dev          # Frontend dev server
npm run dev:server   # Backend dev server
npm run dev:all      # Run both concurrently
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:ui      # Test UI
npm run test:coverage # Coverage report
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Koyeb.

