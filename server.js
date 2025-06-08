```javascript
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Створення таблиці
async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      speedometer_start INTEGER NOT NULL,
      speedometer_end INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      car_number VARCHAR(20) NOT NULL,
      driver_name VARCHAR(100) NOT NULL,
      route VARCHAR(200) NOT NULL,
      fuel_amount DECIMAL(10,2) NOT NULL,
      fuel_liters DECIMAL(8,2) NOT NULL,
      freight_sum DECIMAL(10,2) NOT NULL,
      repair_costs DECIMAL(10,2) DEFAULT 0,
      unexpected_expenses DECIMAL(10,2) DEFAULT 0,
      daily_allowance INTEGER NOT NULL,
      driver_salary DECIMAL(10,2) NOT NULL,
      distance INTEGER NOT NULL,
      price_per_km DECIMAL(8,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ База даних готова');
  } catch (err) {
    console.error('❌ Помилка бази:', err);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

createTable();

// API Routes
app.get('/api/trips', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        speedometer_start as "speedometerStart",
        speedometer_end as "speedometerEnd",
        start_date as "startDate",
        end_date as "endDate",
        car_number as "carNumber",
        driver_name as "driverName",
        route,
        fuel_amount as "fuelAmount",
        fuel_liters as "fuelLiters",
        freight_sum as "freightSum",
        repair_costs as "repairCosts",
        unexpected_expenses as "unexpectedExpenses",
        daily_allowance as "dailyAllowance",
        driver_salary as "driverSalary",
        distance,
        price_per_km as "pricePerKm"
      FROM trips 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

app.post('/api/trips', async (req, res) => {
  const {
    speedometerStart, speedometerEnd, startDate, endDate,
    carNumber, driverName, route, fuelAmount, fuelLiters,
    freightSum, repairCosts = 0, unexpectedExpenses = 0,
    dailyAllowance, driverSalary, distance, pricePerKm
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO trips (
        speedometer_start, speedometer_end, start_date, end_date,
        car_number, driver_name, route, fuel_amount, fuel_liters,
        freight_sum, repair_costs, unexpected_expenses, daily_allowance,
        driver_salary, distance, price_per_km
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      speedometerStart, speedometerEnd, startDate, endDate,
      carNumber, driverName, route, fuelAmount, fuelLiters,
      freightSum, repairCosts, unexpectedExpenses, dailyAllowance,
      driverSalary, distance, pricePerKm
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Помилка збереження' });
  }
});

app.put('/api/trips/:id', async (req, res) => {
  const { id } = req.params;
  const {
    speedometerStart, speedometerEnd, startDate, endDate,
    carNumber, driverName, route, fuelAmount, fuelLiters,
    freightSum, repairCosts = 0, unexpectedExpenses = 0,
    dailyAllowance, driverSalary, distance, pricePerKm
  } = req.body;

  try {
    await pool.query(`
      UPDATE trips SET
        speedometer_start = $1, speedometer_end = $2, start_date = $3,
        end_date = $4, car_number = $5, driver_name = $6, route = $7,
        fuel_amount = $8, fuel_liters = $9, freight_sum = $10,
        repair_costs = $11, unexpected_expenses = $12, daily_allowance = $13,
        driver_salary = $14, distance = $15, price_per_km = $16
      WHERE id = $17
    `, [
      speedometerStart, speedometerEnd, startDate, endDate,
      carNumber, driverName, route, fuelAmount, fuelLiters,
      freightSum, repairCosts, unexpectedExpenses, dailyAllowance,
      driverSalary, distance, pricePerKm, id
    ]);
    
    res.json({ message: 'Рейс оновлено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка оновлення' });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.json({ message: 'Рейс видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CRM bus0011.com запущено на порту ${PORT}`);
});
```
