import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.json');

// Naive JSON db
let dbData: any = {
  users: [{ id: 1, username: 'admin', password: 'admin', role: 'admin' }],
  dirigentes: [],
  locais: [],
  grupos: [],
  bairros: [],
  cartoes: [],
  schedule: [],
  territory_coverage: []
};

let lastId = 100;

export function initDb() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      dbData = JSON.parse(data);
      lastId = dbData.lastId || 100;
    } catch (e) {
      console.error('Failed to load db, using defaults');
    }
  } else {
    saveDb();
  }
}

function saveDb() {
  dbData.lastId = lastId;
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
}

// Mocking the sqlite API we used
export const db = {
  serialize: (cb: any) => cb(),
  get: (sql: string, params: any[], cb: any) => {
    // very naive implementation just for login
    if (sql.includes('users') && sql.includes('username = ?')) {
      const user = dbData.users.find((u: any) => u.username === params[0]);
      return cb(null, user);
    }
    cb(null, null);
  },
  all: (sql: string, params: any, cb: any) => {
    let cbFunc = cb;
    let p = params;
    if (typeof params === 'function') {
      cbFunc = params;
      p = [];
    }
    for (const table of ['users', 'dirigentes', 'locais', 'grupos', 'bairros', 'cartoes']) {
      if (sql.includes(`FROM ${table}`)) return cbFunc(null, dbData[table] || []);
    }
    if (sql.includes('FROM schedule')) {
      return cbFunc(null, dbData.schedule.filter((s: any) => s.week_start === p[0]));
    }
    if (sql.includes('FROM territory_coverage')) {
      return cbFunc(null, dbData.territory_coverage.filter((s: any) => s.week_start === p[0]));
    }
    cbFunc(null, []);
  },
  run: function(sql: string, params: any, cb?: any) {
    let cbFunc = cb;
    let p = params;
    if (typeof params === 'function') {
      cbFunc = params;
      p = [];
    }
    
    // Deletes
    if (sql.startsWith('DELETE FROM')) {
      if (sql.includes('schedule')) {
        dbData.schedule = dbData.schedule.filter((s: any) => s.week_start !== p[0]);
      } else if (sql.includes('territory_coverage')) {
        dbData.territory_coverage = dbData.territory_coverage.filter((s: any) => s.week_start !== p[0]);
      } else {
        const match = sql.match(/DELETE FROM (\w+)/);
        if (match) {
          dbData[match[1]] = dbData[match[1]].filter((r: any) => r.id !== Number(p[0]));
        }
      }
      saveDb();
      if (cbFunc) cbFunc.call(this, null);
      return;
    }
    
    // Updates
    if (sql.startsWith('UPDATE')) {
      const match = sql.match(/UPDATE (\w+)/);
      if (match) {
        const table = match[1];
        const id = p[p.length - 1];
        const item = dbData[table].find((r: any) => r.id === Number(id));
        if (item) {
          // hacky update parser
          const fields = sql.match(/SET (.+) WHERE/)?.[1].split(',').map(f => f.split('=')[0].trim());
          if (fields) {
            fields.forEach((f, i) => { item[f] = p[i]; });
          }
        }
      }
      saveDb();
      if (cbFunc) cbFunc.call(this, null);
      return;
    }

    // Inserts
    if (sql.startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO (\w+) \((.+)\)/);
      if (match) {
        const table = match[1];
        const fields = match[2].split(',').map(f => f.trim());
        const newItem: any = { id: ++lastId };
        fields.forEach((f, i) => {
          newItem[f] = p[i];
        });
        if (!dbData[table]) dbData[table] = [];
        dbData[table].push(newItem);
        saveDb();
        if (cbFunc) cbFunc.call({ lastID: newItem.id }, null);
      } else {
        if (cbFunc) cbFunc.call(this, null);
      }
      return;
    }
    
    if (cbFunc) cbFunc.call(this, null);
  },
  prepare: (sql: string) => {
    return {
      run: (...params: any[]) => {
        db.run(sql, params);
      },
      finalize: () => {}
    };
  }
};