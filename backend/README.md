# TRSH Backend API

Backend service for the Training Impact Predictor application, providing PostgreSQL database integration for storing prediction results.

## Setup

### Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.template .env
   ```
   Edit `.env` with your PostgreSQL connection details.

3. **Set up the database:**
   - Connect to your PostgreSQL database
   - Run the schema script: `psql -d your_database -f schema.sql`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

The backend is configured to deploy on Render alongside the frontend. Make sure to set the following environment variables in your Render dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `FRONTEND_URL`: Your frontend URL (auto-configured via render.yaml)

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status and timestamp

### Save Prediction
- **POST** `/api/predictions`
- Body:
  ```json
  {
    "changeDescription": "string",
    "classification": "Minor Change|Significant Change|Major Change",
    "daysDelay": number,
    "justification": "string",
    "analysisDetails": {
      "complexityScore": number,
      "confidence": number,
      "valueStreams": ["string"],
      "riskFactors": ["string"]
    },
    "userId": "string (optional)",
    "sessionId": "string (optional)"
  }
  ```

### Get Predictions
- **GET** `/api/predictions`
- Query parameters:
  - `classification`: Filter by classification type
  - `userId`: Filter by user ID
  - `limit`: Number of records (default: 50)
  - `offset`: Pagination offset (default: 0)

### Get Single Prediction
- **GET** `/api/predictions/:id`
- Returns specific prediction by ID

### Get Statistics
- **GET** `/api/predictions/stats`
- Returns aggregated statistics by classification type

## Database Schema

The `training_impact_predictions` table stores:
- Change description and classification
- Delay estimates and justification
- Analysis details (complexity, confidence, value streams, risk factors)
- Timestamps and session tracking
- User identification (for future user management)