import * as SQLite from 'expo-sqlite';

let db;

/* Инициализация */
export async function initDB() {
  db = await SQLite.openDatabaseAsync('nutrition.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      calories INTEGER,
      protein INTEGER,
      fat INTEGER,
      carbs INTEGER,
      sex TEXT,
      goal TEXT,
      age INTEGER,
      height INTEGER,
      weight INTEGER
    );
  `);

  console.log('[DB] SQLite initialized');
}

/* Сохранение */
export async function saveCalculation(data) {
  if (!db) return;

  const {
    date,
    calories,
    bju,
    sex,
    goal,
    age,
    height,
    weight,
  } = data;

  await db.runAsync(
    `
    INSERT INTO history
    (date, calories, protein, fat, carbs, sex, goal, age, height, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      date,
      calories,
      bju.protein,
      bju.fat,
      bju.carbs,
      sex,
      goal,
      age,
      height,
      weight,
    ]
  );
}

/* Загрузка */
export async function loadHistory() {
  if (!db) return [];

  const rows = await db.getAllAsync(
    `SELECT * FROM history ORDER BY id DESC`
  );

  return rows.map(item => ({
    ...item,
    bju: {
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    },
  }));
}
