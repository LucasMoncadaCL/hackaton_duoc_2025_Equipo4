# Chat-Based Assessment Implementation

## Overview
The assessment page has been transformed from a multi-step form into a conversational chat interface that collects health data naturally through conversation.

## What Was Implemented

### 1. Message Types (`src/lib/types/message.ts`)
Created comprehensive TypeScript interfaces for the chat system:
- `ConversationMessage`: Individual chat messages with role, content, timestamp
- `MessageRequest`: Payload sent to backend with message, history, and session data
- `MessageResponse`: Backend response with extracted data, predictions, and navigation actions
- `PredictionResult`: Structure for ML model predictions
- `ConversationState`: State management for the conversation

### 2. API Client Enhancement (`src/lib/api/client.ts`)
Added `message()` method to `healthAPI`:
- Sends user messages to `/api/health/message` endpoint
- Includes conversation history for context
- Passes partial assessment data
- Handles mock responses when backend is unavailable
- Returns structured response with extracted data and actions

### 3. Data Extraction Card Component (`src/components/DataExtractionCard.tsx`)
Visual component that displays collected health data in real-time:
- Shows progress (e.g., "5/9 fields collected")
- Groups fields by category (Anthropometry, Lifestyle, Diet)
- Color-coded by category (Blue, Green, Lime)
- Visual checkmarks for collected fields
- Formatted display of values with units
- Responsive grid layout

### 4. Chat Assessment Page (`src/app/(app)/assess/page.tsx`)
Complete redesign of the assessment experience:

**Features:**
- Conversational chat interface similar to coach page
- Real-time message exchange with backend
- Data extraction cards showing collected information
- Progress tracking and visual feedback
- localStorage persistence (auto-save drafts)
- Error handling with user-friendly messages
- Auto-redirect to results page when complete
- Keyboard shortcuts (Enter to send)
- Mobile-responsive design

**User Flow:**
1. User opens `/assess` → sees chat interface with welcome message
2. User types naturally: "Tengo 35 años, mido 170cm, peso 75kg..."
3. Frontend sends to backend `/api/health/message`
4. Backend extracts structured data and responds
5. Frontend updates data extraction cards
6. Conversation continues until all required fields collected
7. Backend runs prediction and returns results
8. Frontend saves to Supabase and redirects to `/results/[id]`

**State Management:**
- Messages array with conversation history
- Extracted data (partial AssessmentData)
- Loading states for async operations
- Error states with clear messaging
- Auto-save to localStorage every change
- Load draft on page reload

**Navigation Actions:**
- `continue`: Keep conversing
- `redirect_results`: Save assessment and go to results page
- `redirect_coach`: Navigate to coaching page

## Backend Requirements

The frontend expects the backend to implement:

### POST `/api/health/message`

**Request:**
```json
{
  "message": "Tengo 35 años, mido 170cm y peso 75kg",
  "conversation_history": [
    {"role": "assistant", "content": "Hola! Cuéntame sobre ti..."},
    {"role": "user", "content": "Tengo 35 años..."}
  ],
  "session_data": {
    "age": 35,
    "height_cm": 170,
    "weight_kg": 75
  }
}
```

**Response:**
```json
{
  "reply": "Perfecto! He registrado tu edad (35 años), altura (170cm) y peso (75kg). ¿Me puedes contar sobre tu circunferencia de cintura?",
  "extracted_data": {
    "age": 35,
    "height_cm": 170,
    "weight_kg": 75
  },
  "is_ready": false,
  "action": "continue"
}
```

**When ready for prediction:**
```json
{
  "reply": "¡Perfecto! Tengo todos los datos necesarios. Voy a calcular tu riesgo cardiometabólico...",
  "extracted_data": { /* all fields */ },
  "is_ready": true,
  "prediction": {
    "score": 0.45,
    "risk_level": "moderate",
    "drivers": [...],
    "model_used": "diabetes"
  },
  "action": "redirect_results",
  "assessment_id": "123"
}
```

## Files Created/Modified

### Created:
1. `front/src/lib/types/message.ts` - Message type definitions
2. `front/src/components/DataExtractionCard.tsx` - Data display component
3. `front/CHAT_ASSESSMENT_IMPLEMENTATION.md` - This documentation

### Modified:
1. `front/src/lib/types/index.ts` - Added message types export
2. `front/src/lib/api/client.ts` - Added message() method
3. `front/src/components/index.ts` - Added DataExtractionCard export
4. `front/src/app/(app)/assess/page.tsx` - Complete redesign

## Design Choices

1. **Conversational UX**: Natural language input instead of rigid forms
2. **Real-time Feedback**: Immediate visual confirmation of extracted data
3. **Progressive Disclosure**: Show collected data cards only when data exists
4. **Graceful Degradation**: Mock responses when backend unavailable
5. **Persistence**: Auto-save to localStorage to prevent data loss
6. **Accessibility**: Clear visual hierarchy, keyboard navigation, screen reader friendly
7. **Responsive**: Works on mobile, tablet, and desktop
8. **Error Recovery**: Clear error messages with actionable guidance

## Testing Checklist

- [ ] Chat interface loads correctly
- [ ] Welcome message appears
- [ ] User can send messages
- [ ] Data extraction cards appear when data is collected
- [ ] Progress bar updates correctly
- [ ] localStorage persistence works (refresh page)
- [ ] Mock responses work when backend is down
- [ ] Real backend integration works
- [ ] Redirect to results page works
- [ ] Mobile responsive layout works
- [ ] Keyboard shortcuts work (Enter to send)
- [ ] Error handling shows appropriate messages

## Next Steps (Backend Team)

1. Implement `/api/health/message` endpoint
2. Add OpenAI function calling for data extraction
3. Implement conversation intent classification
4. Add model selection logic (diabetes vs hypertension)
5. Generate conversational responses
6. Detect when all required fields are collected
7. Run prediction and return results
8. Test integration with frontend

## Notes

- The frontend is ready and will work with mock data until backend is implemented
- All TypeScript types are defined and exported
- Component follows existing design system and color scheme
- Error handling includes network errors and backend errors
- Conversation history is limited to last 5 messages for API calls (performance)
- Assessment is automatically saved to Supabase before redirect

