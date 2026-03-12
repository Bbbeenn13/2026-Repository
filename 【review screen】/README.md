# Screen Tracker - Windows Screen Tracking System

A Windows-only screen tracking system that captures screenshots every 5 minutes, analyzes them with local AI, and provides productivity insights through a web dashboard.

## Features

- **Automated Screenshot Capture**: Takes screenshots every 5 minutes on Windows
- **Privacy Protection**: Auto-blurs sensitive content (passwords, credit cards, emails)
- **AI-Powered Analysis**: Uses local Ollama with vision models for activity categorization
- **Daily Summaries**: Automatic generation of daily activity summaries
- **Time Allocation Statistics**: Detailed breakdown of time spent by app and category
- **Productivity Suggestions**: AI-generated recommendations for time management improvement
- **Web Dashboard**: Beautiful interface for viewing all tracked data

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js (API server)
- node-screenshots (Windows screenshot capture)
- active-win (active window detection)
- node-cron (scheduling)
- better-sqlite3 (embedded database)
- sharp (image processing)
- Tesseract.js (OCR for privacy detection)
- ollama (local AI integration)

### Frontend
- Next.js 15 with App Router
- React 19
- Tailwind CSS
- Lucide React (icons)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** with a vision model installed (e.g., `llava` or `bakllava`)

### Installing Ollama

```bash
# Download Ollama from https://ollama.ai
# Pull a vision model
ollama pull llava
```

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd "D:\Zhuobin Vide Coding\【review screen】"
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
```bash
# Copy the example .env file
cp backend/.env.example backend/.env

# Edit backend/.env with your settings
# Default values should work for most cases
```

## Usage

### Development Mode

Start both backend and frontend in development mode:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend dashboard on `http://localhost:3000`

### Production Mode

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Manual Controls

#### Start/Stop Tracking
- **Pause**: Click "Pause" button in the dashboard
- **Resume**: Click "Resume" button in the dashboard
- **Manual Capture**: Click "Capture Now" to take an immediate screenshot

#### Generate Daily Summary
```bash
# Via API
POST http://localhost:3001/api/analysis/generate/YYYY-MM-DD
```

## Configuration

Edit `backend/.env` to customize:

```env
# Server
PORT=3001

# Scheduling
CAPTURE_INTERVAL_MINUTES=5
IDLE_THRESHOLD_MINUTES=10

# Screenshot Quality
SCREENSHOT_QUALITY=85

# Data Retention
MAX_SCREENSHOT_AGE_DAYS=90

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llava

# Privacy Features
PRIVACY_BLUR_PASSWORDS=true
PRIVACY_BLUR_CREDIT_CARDS=true
PRIVACY_BLUR_EMAILS=true
PRIVACY_AI_DETECTION=true
```

## Dashboard Features

### Main Dashboard
- Today's activity overview
- Screenshot count and productivity score
- Time allocation by category
- Top applications used
- Daily summary text
- AI-generated suggestions

### API Endpoints

#### Screenshots
- `GET /api/screenshots` - List screenshots
- `GET /api/screenshots/:id` - Get single screenshot
- `GET /api/screenshots/:id/image` - Get screenshot image
- `GET /api/screenshots/today` - Get today's screenshots

#### Analysis
- `GET /api/analysis/:date` - Get analysis for date
- `GET /api/analysis/times/:startDate/:endDate` - Get time allocation
- `POST /api/analysis/generate/:date` - Generate daily summary

#### Dashboard
- `GET /api/dashboard/today` - Today's dashboard data
- `GET /api/dashboard/stats` - Quick statistics
- `GET /api/dashboard/suggestions` - Productivity suggestions

#### System
- `GET /api/system/status` - System status
- `POST /api/system/pause` - Pause tracking
- `POST /api/system/resume` - Resume tracking
- `POST /api/system/capture` - Manual capture

## Data Storage

All data is stored locally in the `data/` directory:

```
data/
├── screenshots/
│   ├── original/     # Original screenshots
│   ├── blurred/      # Privacy-blurred versions
│   └── thumbnails/   # Gallery thumbnails
└── exports/          # Exported reports
```

Database: `backend/database/screen-tracker.db` (SQLite)

## Privacy & Security

- **Local-Only**: All data stored locally, never uploaded
- **Automatic Blur**: Sensitive content detected and blurred before storage
- **OCR Detection**: Text detection for passwords, emails, credit cards
- **Pattern Matching**: Regex patterns for API keys, SSNs, etc.
- **Window Title Detection**: Blur known sensitive windows

## Troubleshooting

### Ollama Not Available
If Ollama is not running:
1. Start Ollama: `ollama serve`
2. Verify model is installed: `ollama list`
3. System will use fallback rule-based analysis

### Screenshots Not Capturing
1. Check system status in dashboard
2. Verify backend is running on port 3001
3. Check logs in `logs/` directory

### Database Errors
1. Ensure `backend/database/` directory exists
2. Check file permissions
3. Delete `.db` file and restart to recreate

## Project Structure

```
screen-tracker/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── core/        # Screenshot, privacy, Ollama, scheduler
│   │   ├── storage/     # Database and file system
│   │   ├── analysis/    # Summarizer, time tracker
│   │   ├── api/         # Express routes
│   │   ├── config/      # Settings and constants
│   │   └── utils/       # Logger, helpers
│   └── database/        # SQLite database
├── frontend/            # Next.js dashboard
│   └── app/            # Pages and components
├── data/               # Screenshot storage
└── logs/               # Application logs
```

## License

MIT

## Contributing

This is a personal project for time management and productivity tracking.
