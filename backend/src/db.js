const { Pool } = require('pg');
require('dotenv').config();

// Set SSL to not reject unauthorized certificates globally
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for cloud databases (Aiven requires SSL)
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { 
    rejectUnauthorized: false,
    require: true
  } : false,
  // Connection pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;