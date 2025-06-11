-- Create table for storing training impact predictions
CREATE TABLE IF NOT EXISTS training_impact_predictions (
    id SERIAL PRIMARY KEY,
    change_description TEXT NOT NULL,
    classification VARCHAR(50) NOT NULL,
    days_delay INTEGER NOT NULL,
    justification TEXT,
    complexity_score INTEGER,
    confidence_level INTEGER,
    value_streams TEXT[],
    risk_factors TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    session_id VARCHAR(255)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON training_impact_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_classification ON training_impact_predictions(classification);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON training_impact_predictions(user_id);