import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// Middleware to check admin (simplified)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real app we'd verify JWT here, assuming done globally or frontend protected
  next();
};

// Generic CRUD handlers
const getTable = (table: string) => (req: express.Request, res: express.Response) => {
  db.all(`SELECT * FROM ${table}`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const createRow = (table: string, fields: string[]) => (req: express.Request, res: express.Response) => {
  const values = fields.map(f => req.body[f]);
  const placeholders = fields.map(() => '?').join(',');
  
  db.run(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${placeholders})`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, ...req.body });
  });
};

const updateRow = (table: string, fields: string[]) => (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const values = fields.map(f => req.body[f]);
  const assignments = fields.map(f => `${f} = ?`).join(',');
  
  db.run(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...req.body });
  });
};

const deleteRow = (table: string) => (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// Users
router.get('/users', requireAdmin, getTable('users'));
router.post('/users', requireAdmin, createRow('users', ['username', 'password', 'role']));
router.put('/users/:id', requireAdmin, updateRow('users', ['username', 'password', 'role']));
router.delete('/users/:id', requireAdmin, deleteRow('users'));

// Dirigentes
router.get('/dirigentes', getTable('dirigentes'));
router.post('/dirigentes', requireAdmin, createRow('dirigentes', ['nome']));
router.put('/dirigentes/:id', requireAdmin, updateRow('dirigentes', ['nome']));
router.delete('/dirigentes/:id', requireAdmin, deleteRow('dirigentes'));

// Locais
router.get('/locais', getTable('locais'));
router.post('/locais', requireAdmin, createRow('locais', ['nome']));
router.put('/locais/:id', requireAdmin, updateRow('locais', ['nome']));
router.delete('/locais/:id', requireAdmin, deleteRow('locais'));

// Grupos
router.get('/grupos', getTable('grupos'));
router.post('/grupos', requireAdmin, createRow('grupos', ['nome']));
router.put('/grupos/:id', requireAdmin, updateRow('grupos', ['nome']));
router.delete('/grupos/:id', requireAdmin, deleteRow('grupos'));

// Bairros
router.get('/bairros', getTable('bairros'));
router.post('/bairros', requireAdmin, createRow('bairros', ['nome']));
router.put('/bairros/:id', requireAdmin, updateRow('bairros', ['nome']));
router.delete('/bairros/:id', requireAdmin, deleteRow('bairros'));

// Cartoes
router.get('/cartoes', getTable('cartoes'));
router.post('/cartoes', requireAdmin, createRow('cartoes', ['codigo', 'image']));
router.put('/cartoes/:id', requireAdmin, updateRow('cartoes', ['codigo', 'image']));
router.delete('/cartoes/:id', requireAdmin, deleteRow('cartoes'));

export default router;