import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

// שימוש בכתובת ה-DNS המלאה בתוך הקלאסטר לחיבור יציב למסד הנתונים
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres-service.default.svc.cluster.local:5432/translations'
});

async function translateText(text, target) {
  try {
    // שימוש בשם השירות הנכון: translator-service
    const host = process.env.TRANSLATOR_HOST || 'translator-service';
    const url = `http://${host}:5000/translate`;
    
    console.log(`DEBUG: Sending request to translation service at: ${url}`);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'auto', target: target, format: 'text' })
    });
    
    const data = await res.json();
    return data.translatedText;
  } catch (err) {
    console.error("DEBUG: Translation service error:", err.message);
    return '(שגיאה בתרגום)';
  }
}

app.post('/translate', async (req, res) => {
  console.log("DEBUG: Body is", JSON.stringify(req.body));
  console.log("DEBUG: Query is", JSON.stringify(req.query));

  const text = req.body.text || req.query.text;
  const to = req.body.to || req.query.to;

  if (!text || !to) {
    return res.status(400).json({ 
      error: 'Missing text or target', 
      debug_received_body: req.body,
      debug_received_query: req.query 
    });
  }

  try {
    const translatedText = await translateText(text, to);
    
    // ניסיון כתיבה ל-DB
    await pool.query('INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1,$2,$3)', [text, to, translatedText]);
    
    res.json({ translation: translatedText });
  } catch (dbErr) {
    console.error("DEBUG: Database error:", dbErr.message);
    res.status(500).json({ error: 'Database error', details: dbErr.message });
  }
});

app.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM translations ORDER BY id DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error("DEBUG: History error:", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.listen(3001, '0.0.0.0', () => console.log('✅ Backend running on 0.0.0.0:3001'));
