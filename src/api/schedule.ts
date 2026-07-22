import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

router.get('/week/:week_start', (req, res) => {
  const { week_start } = req.params;
  db.all(`SELECT * FROM schedule WHERE week_start = ?`, [week_start], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/week/:week_start', (req, res) => {
  const { week_start } = req.params;
  const scheduleData = req.body.schedule; // Array of items
  
  db.serialize(() => {
    db.run(`DELETE FROM schedule WHERE week_start = ?`, [week_start]);
    const stmt = db.prepare(`INSERT INTO schedule (week_start, day, time, cartao_id, local_id, dirigente_id) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const item of scheduleData) {
      stmt.run(week_start, item.day, item.time, item.cartao_id, item.local_id, item.dirigente_id);
    }
    stmt.finalize();
    res.json({ success: true });
  });
});

router.get('/territory/:week_start', (req, res) => {
  const { week_start } = req.params;
  db.all(`SELECT * FROM territory_coverage WHERE week_start = ?`, [week_start], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/territory/:week_start', (req, res) => {
  const { week_start } = req.params;
  const coverageData = req.body.coverage; // Array of items
  
  db.serialize(() => {
    db.run(`DELETE FROM territory_coverage WHERE week_start = ?`, [week_start]);
    const stmt = db.prepare(`INSERT INTO territory_coverage (week_start, grupo_id, turno, local_id, bairro_id, cartao_id, dirigentes_json) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const item of coverageData) {
      stmt.run(week_start, item.grupo_id, item.turno, item.local_id, item.bairro_id, item.cartao_id, JSON.stringify(item.dirigentes || []));
    }
    stmt.finalize();
    res.json({ success: true });
  });
});

export default router;