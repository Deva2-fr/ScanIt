# SiteAuditor Backend

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (especially GOOGLE_PAGESPEED_API_KEY)
```

### 5. Run the Server

```bash
python run.py
```

Or directly with uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📖 API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Main Analysis
```
POST /api/analyze
Body: {"url": "https://example.com"}
```

### Individual Modules
```
POST /api/analyze/seo      - SEO & Performance only
POST /api/analyze/security - Security headers & SSL only
POST /api/analyze/tech     - Technology detection only
POST /api/analyze/links    - Broken links check only
```

### Health Check
```
GET /api/health
```

## 🔑 Google PageSpeed API Key

To use the SEO/Performance module, you need a Google PageSpeed API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "PageSpeed Insights API"
4. Create credentials (API Key)
5. Add the key to your `.env` file

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          # Configuration management
│   ├── main.py            # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── analyze.py     # API routes
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py     # Pydantic models
│   └── services/
│       ├── __init__.py
│       ├── seo.py         # SEO & PageSpeed analysis
│       ├── security.py    # Security headers & SSL
│       ├── tech.py        # Technology detection
│       └── links.py       # Broken links checker
├── requirements.txt
├── run.py                 # Entry point
├── .env.example
└── README.md
```

## 🧪 Testing

```bash
# Test with curl
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```
