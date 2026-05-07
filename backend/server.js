import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres-service:5432/translations',
  max: 20, // מקסימום חיבורים בו זמנית
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

async function translateText(text, target) {
  try {
    // שימוש בשם השירות הנכון: translator-service
    const host = process.env.TRANSLATOR_HOST || 'translator-service';
    const url = `http://${host}:5000/translate`;
    
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'auto', target: target, format: 'text' })
    });
    
    if (!res.ok) throw new Error(`Translator responded with ${res.status}`);

    const data = await res.json();
    return data.translatedText;
  } catch (err) {
    console.error("ERROR: Translation failed:", err.message);
    return '(שגיאה בתרגום)';
  }
}

app.post('/translate', async (req, res) => {
  const text = req.body.text || req.query.text;
  const to = req.body.to || req.query.to;

  if (!text || !to) {
    return res.status(400).json({ 
      error: 'Missing text or target language', 
    });
  }

  try {
    const translatedText = await translateText(text, to);
    
    // ניסיון כתיבה ל-DB
    await pool.query('INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1,$2,$3)', [text, to, translatedText]);
    
    res.json({ translation: translatedText });
  } catch (dbErr) {
    console.error("DEBUG: Database error:", dbErr.message);
    res.status(500).json({ error: 'Internal Server Error', details: dbErr.message });
  }
});

app.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM translations ORDER BY id DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error("DEBUG: History error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend professional service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Closing HTTP server...');
  server.close(async () => {
    console.log('HTTP server closed. Closing database pool...');
    await pool.end();
    console.log('Database pool closed. Exiting process.');
    process.exit(0);
  });
});