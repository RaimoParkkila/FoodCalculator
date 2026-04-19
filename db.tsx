import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("food_app.db");

/*food_plan:
- date
- food_item_id
- planned_amount
- unit
- notes
*/

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT,
      protein REAL,
      carbohydrates REAL,
      fat REAL,
      unit TEXT,
      amount REAL,
      createdAt TEXT,
      updatedAt TEXT,
      notes TEXT
    );

    
CREATE TABLE IF NOT EXISTS food_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_item_id INTEGER,
  planned_amount REAL,
  unit TEXT,
  date TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  notes TEXT
);
  `);

  const result = db.getAllSync(
    `SELECT COUNT(*) as count FROM food_items`
  ) as { count: number }[];

  if (result[0].count === 0) {
    seedData();
  }
}



const addToCalendar = (item) => {
  const now = new Date().toISOString();

  const currentYear = new Date().getFullYear();

  try {
    db.runSync(
      `INSERT INTO supplement_calendar
  (supplement_id, food_item_name, day, hour, week_number, year, month, dose, taken, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        item.id,
        item.food_item_name,
        "Mon",
        "08:00",
        1,
        currentYear,
        new Date().getMonth() + 1,
        item.DOSE || "",
        now,
        now
      ]
    );

    console.log("Added to calendar:", item.food_item_name);

  } catch (error) {
    console.log("ADD TO CALENDAR ERROR:", error);
  }
};


function seedData() {
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO food_items 
    (food_name, protein, carbohydrates, fat, unit, amount, createdAt, updatedAt, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Chicken Breast",
      23,
      0,
      2,
      "100g",
      100,
      now,
      now,
      "test"
    ]
  );

  db.runSync(
    `INSERT INTO food_items 
    (food_name, protein, carbohydrates, fat, unit, amount, createdAt, updatedAt, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Rice",
      2.7,
      28,
      0.3,
      "100g",
      100,
      now,
      now,
      "test"
    ]
  );
}



export function getSupplements(callback) {
  const data = db.getAllSync("SELECT * FROM supplement_name");
  callback(data);
}