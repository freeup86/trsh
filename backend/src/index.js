const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Save prediction endpoint
app.post('/api/predictions', async (req, res) => {
  try {
    const {
      changeDescription,
      classification,
      daysDelay,
      justification,
      analysisDetails,
      userId,
      sessionId
    } = req.body;

    // Validate required fields
    if (!changeDescription || !classification || daysDelay === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: changeDescription, classification, daysDelay'
      });
    }

    // Extract analysis details if provided
    const complexityScore = analysisDetails?.complexityScore || null;
    const confidenceLevel = analysisDetails?.confidence || null;
    const valueStreams = analysisDetails?.valueStreams || [];
    const riskFactors = analysisDetails?.riskFactors || [];

    // Insert into database
    const query = `
      INSERT INTO training_impact_predictions (
        change_description,
        classification,
        days_delay,
        justification,
        complexity_score,
        confidence_level,
        value_streams,
        risk_factors,
        user_id,
        session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      changeDescription,
      classification,
      daysDelay,
      justification,
      complexityScore,
      confidenceLevel,
      valueStreams,
      riskFactors,
      userId || null,
      sessionId || null
    ];

    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Prediction saved successfully'
    });

  } catch (error) {
    console.error('Error saving prediction:', error);
    res.status(500).json({
      error: 'Failed to save prediction',
      details: error.message
    });
  }
});

// Get all predictions endpoint (with optional filters)
app.get('/api/predictions', async (req, res) => {
  try {
    const { classification, userId, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM training_impact_predictions WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (classification) {
      paramCount++;
      query += ` AND classification = $${paramCount}`;
      values.push(classification);
    }

    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      values.push(userId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch predictions',
      details: error.message
    });
  }
});

// Get prediction by ID
app.get('/api/predictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM training_impact_predictions WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Prediction not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({
      error: 'Failed to fetch prediction',
      details: error.message
    });
  }
});

// Get statistics endpoint
app.get('/api/predictions/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        classification,
        COUNT(*) as count,
        AVG(days_delay) as avg_delay,
        AVG(complexity_score) as avg_complexity,
        AVG(confidence_level) as avg_confidence
      FROM training_impact_predictions
      GROUP BY classification
    `;
    
    const result = await pool.query(statsQuery);
    
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});