import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("dososupli.db");


export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS supplement_name (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      SUPPLEMENT_NAME TEXT,
      BRAND TEXT,
      PURPOSE TEXT,
      DESCRIPTION TEXT,
      DOSE TEXT,
      SIDE_EFFECTS TEXT,
      EFFECT_TERMINATES TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      free_additional_information TEXT
    );

 

  CREATE TABLE IF NOT EXISTS supplement_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplement_id INTEGER,
    SUPPLEMENT_NAME TEXT,
    day TEXT,
    hour TEXT,
    week_number INTEGER,
    year INTEGER,
    dose TEXT,
    month INTEGER,
    taken INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );
  `);
}

const result = db.getAllSync(
  `SELECT COUNT(*) as count FROM supplement_name`
) as { count: number }[];

  if (result[0].count === 0) {
    seedData();
  }
 
 


const addToCalendar = (item) => {
  const now = new Date().toISOString();
 
  const currentYear = new Date().getFullYear();

  try {
db.runSync(
  `INSERT INTO supplement_calendar
  (supplement_id, SUPPLEMENT_NAME, day, hour, week_number, year, month, dose, taken, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  [
    item.id,
    item.SUPPLEMENT_NAME,
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

    console.log("Added to calendar:", item.SUPPLEMENT_NAME);

  } catch (error) {
    console.log("ADD TO CALENDAR ERROR:", error);
  }
};

function seedData() {
  db.runSync(
    `INSERT INTO supplement_name 
    (SUPPLEMENT_NAME, BRAND, PURPOSE, DESCRIPTION, DOSE, SIDE_EFFECTS, EFFECT_TERMINATES, createdAt, updatedAt, free_additional_information)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Kreatina",
      "-",
      "lihasmassa",
      "mono hydraatti",
      "3-5g",
      "-",
      "no",
      "2023",
      "2023",
      "test"
    ]
  );

  db.runSync(
    `INSERT INTO supplement_name 
    (SUPPLEMENT_NAME, BRAND, PURPOSE, DESCRIPTION, DOSE, SIDE_EFFECTS, EFFECT_TERMINATES, createdAt, updatedAt, free_additional_information)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "L-arginiini",
      "-",
      "verenkierto",
      "aminohappo",
      "katso pakkaus",
      null,
      null,
      "2023",
      "2023",
      "test"
    ]
  );
}

  

export function getSupplements(callback) {
  const data = db.getAllSync("SELECT * FROM supplement_name");
  callback(data);
}