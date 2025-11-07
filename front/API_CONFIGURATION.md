# API Configuration Guide

## Environment Variables

Create a `.env.local` file in the `front/` directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Set to "false" to enable demo mode when backend is not available
# NEXT_PUBLIC_API_AVAILABLE=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Demo Mode (No Backend Required)

If you don't have the backend running yet, the frontend will automatically work in **demo mode**:

### What Works in Demo Mode:
- ✅ All UI and navigation
- ✅ Authentication with Supabase
- ✅ Risk assessment form (shows mock data)
- ✅ Coach chatbot (shows demo responses)
- ✅ Dashboard and history viewing
- ✅ All visual components

### Mock Data Provided:
- **Risk Prediction**: Returns a moderate risk score (45/100) with 5 sample drivers
- **Coach Responses**: Returns helpful demo messages explaining the system is in demo mode

### Enabling Demo Mode Explicitly:

Add this to your `.env.local`:
```env
NEXT_PUBLIC_API_AVAILABLE=false
```

## Connecting to Real Backend

### 1. Start the Backend

```bash
cd back
# Install dependencies and run
uvicorn main:app --reload --port 8000
```

### 2. Update Environment Variable

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Remove or comment out NEXT_PUBLIC_API_AVAILABLE
```

### 3. Verify Connection

The frontend will automatically:
- Check if the backend is available
- Show an orange banner if connection fails
- Fall back to demo mode if needed

## Required Backend Endpoints

The frontend expects these endpoints:

### POST /api/health/predict
Request:
```json
{
  "assessment_data": {
    "age": 35,
    "sex": "M",
    "height_cm": 170,
    "weight_kg": 75,
    "waist_cm": 85,
    "sleep_hours": 7,
    "smokes_cig_day": 0,
    "days_mvpa_week": 3,
    "fruit_veg_portions_day": 4
  }
}
```

Response:
```json
{
  "score": 0.45,
  "risk_level": "moderate",
  "drivers": [
    {
      "feature": "waist_cm",
      "value": 85,
      "contribution": 0.15,
      "description": "Circunferencia de cintura"
    }
  ]
}
```

### POST /api/health/coach
Request:
```json
{
  "query": "¿Cómo puedo mejorar mi salud?",
  "assessment_data": { ... },
  "risk_score": 0.45,
  "chat_history": []
}
```

Response:
```json
{
  "message": "Recomendaciones personalizadas...",
  "citations": [
    {
      "source": "Guía de prevención cardiovascular",
      "text": "Evidencia científica..."
    }
  ]
}
```

## Troubleshooting

### "404 Not Found" Errors

**Problem**: Getting 404 errors when using coach or assessment.

**Solution**: 
1. Backend is not running → Start it or enable demo mode
2. Wrong API URL → Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. CORS issues → Make sure backend allows `http://localhost:3000`

### Orange Banner Shows Up

This is normal! It means:
- The frontend couldn't connect to the backend
- Demo mode is active
- You can still use all UI features

To hide it: Start the backend at the configured URL.

### Changes Not Reflecting

After changing `.env.local`:
1. Stop the dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

## API Status Detection

The frontend automatically checks API availability by:
1. Attempting to fetch `${API_URL}/` on page load
2. 3-second timeout for the check
3. Shows banner if unreachable
4. Falls back to mock data gracefully

