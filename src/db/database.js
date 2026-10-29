import * as SQLite from 'expo-sqlite';

let dbPromise = null;

// Opens the DB once and creates the table on first run.
function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('records.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'General',
          image_file TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function getRecords({ query = '', category = null } = {}) {
  const db = await getDb();
  const where = [];
  const params = [];
  const q = query.trim();
  if (q) {
    where.push('(title LIKE ? OR notes LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  const sql =
    'SELECT * FROM records' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY updated_at DESC';
  return db.getAllAsync(sql, params);
}

export async function getRecord(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM records WHERE id = ?', [id]);
}

export async function getCategoryCounts() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    'SELECT category, COUNT(*) AS c FROM records GROUP BY category'
  );
  const map = {};
  rows.forEach((r) => (map[r.category] = r.c));
  return map;
}

export async function insertRecord({ title, notes, category, imageFile }) {
  const db = await getDb();
  const now = Date.now();
  const res = await db.runAsync(
    'INSERT INTO records (title, notes, category, image_file, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [title, notes, category, imageFile, now, now]
  );
  return res.lastInsertRowId;
}

export async function updateRecord(id, { title, notes, category, imageFile }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE records SET title = ?, notes = ?, category = ?, image_file = ?, updated_at = ? WHERE id = ?',
    [title, notes, category, imageFile, Date.now(), id]
  );
}

export async function deleteRecord(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM records WHERE id = ?', [id]);
}
