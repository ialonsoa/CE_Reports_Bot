# CE Reports Bot

An intelligent assistant that learns from your past reports and monitors your daily app usage to automatically generate report suggestions for your team.

## Features

- **Report Learning** — Upload past reports (PDF/Word/Excel) so the bot learns your format and writing style
- **Activity Monitoring** — Tracks which apps you use throughout the day (e.g., Tableau, Excel, Slack)
- **AI Report Generation** — Combines your activity data + report templates to draft daily/weekly reports
- **Team Sharing** — Review, edit, and send generated reports directly to your team

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, OpenAI API, python-docx, pdfplumber, psutil
- **Frontend:** React, Vite, Tailwind CSS

## Project Structure

```
CE_Reports_Bot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── routers/
│   │   │   ├── reports.py       # Upload & analyze reports
│   │   │   ├── activity.py      # Screen/app activity tracking
│   │   │   └── generate.py      # AI report generation
│   │   ├── services/
│   │   │   ├── report_parser.py # Parse PDF/Word/Excel files
│   │   │   ├── activity_monitor.py # Track active apps
│   │   │   └── ai_generator.py  # AI generation logic
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── uploads/             # Uploaded report files
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/          # Reusable UI components
    │   ├── pages/               # Dashboard, Upload, Generate
    │   ├── hooks/               # Custom React hooks
    │   └── services/            # API calls
    ├── package.json
    └── vite.config.js
```

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add your OpenAI/Anthropic API key
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` with the API at `http://localhost:8000`.
