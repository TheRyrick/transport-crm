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

4. **Натисніть "Commit new file"**

### Файл 3: Створення папки public
1. **"Add file" → "Create new file"**
2. **Ім'я файлу:** `public/index.html` (слеш створить папку)
3. **Вставте код:**

```html



    
    
    CRM для вантажних перевезень - bus0011.com
    
    
    
    
    
    
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    


    
        
            
                
                CRM bus0011.com
                Завантаження системи управління перевезеннями...
            
        
    
    
    
        const { useState, useEffect } = React;
        
        // Іконки
        const Plus = () => React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, 
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4v16m8-8H4' })
        );
        
        const Edit2 = () => React.createElement('svg', { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, 
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' }),
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' })
        );
        
        const Trash2 = () => React.createElement('svg', { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, 
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
        );

        const API_BASE_URL = '/api';

        const TransportCRM = () => {
            const [trips, setTrips] = useState([]);
            const [loading, setLoading] = useState(true);
            const [showForm, setShowForm] = useState(false);
            const [editingTrip, setEditingTrip] = useState(null);
            const [activeTab, setActiveTab] = useState('trips');
            const [formData, setFormData] = useState({
                speedometerStart: '', speedometerEnd: '', startDate: '', endDate: '',
                carNumber: '', driverName: '', route: '', fuelAmount: '', fuelLiters: '',
                freightSum: '', repairCosts: '', unexpectedExpenses: ''
            });

            useEffect(() => { fetchTrips(); }, []);

            const fetchTrips = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/trips`);
                    const data = await response.json();
                    setTrips(data);
                } catch (error) {
                    console.error('Помилка:', error);
                } finally {
                    setLoading(false);
                }
            };

            const calculateDailyAllowance = (startDate, endDate) => {
                if (!startDate || !endDate) return 0;
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays * 200;
            };

            const calculateDriverSalary = (freightSum, fuelCost, dailyAllowance) => {
                const result = (freightSum - fuelCost - dailyAllowance) / 4;
                return Math.max(0, result);
            };

            const handleSubmit = async () => {
                if (!formData.speedometerStart || !formData.freightSum) {
                    alert('Заповніть обов\'язкові поля');
                    return;
                }
                
                const dailyAllowance = calculateDailyAllowance(formData.startDate, formData.endDate);
                const fuelCost = parseFloat(formData.fuelAmount) || 0;
                const freightSum = parseFloat(formData.freightSum) || 0;
                const driverSalary = calculateDriverSalary(freightSum, fuelCost, dailyAllowance);
                const distance = (parseFloat(formData.speedometerEnd) || 0) - (parseFloat(formData.speedometerStart) || 0);
                
                const tripData = {
                    speedometerStart: parseFloat(formData.speedometerStart) || 0,
                    speedometerEnd: parseFloat(formData.speedometerEnd) || 0,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    carNumber: formData.carNumber,
                    driverName: formData.driverName,
                    route: formData.route,
                    fuelAmount: fuelCost,
                    fuelLiters: parseFloat(formData.fuelLiters) || 0,
                    freightSum: freightSum,
                    repairCosts: parseFloat(formData.repairCosts) || 0,
                    unexpectedExpenses: parseFloat(formData.unexpectedExpenses) || 0,
                    dailyAllowance: dailyAllowance,
                    driverSalary: driverSalary,
                    distance: distance,
                    pricePerKm: distance > 0 ? freightSum / distance : 0
                };

                try {
                    const url = editingTrip ? `${API_BASE_URL}/trips/${editingTrip.id}` : `${API_BASE_URL}/trips`;
                    const method = editingTrip ? 'PUT' : 'POST';
                    
                    await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tripData),
                    });
                    
                    fetchTrips();
                    resetForm();
                } catch (error) {
                    alert('Помилка збереження');
                }
            };

            const resetForm = () => {
                setFormData({
                    speedometerStart: '', speedometerEnd: '', startDate: '', endDate: '',
                    carNumber: '', driverName: '', route: '', fuelAmount: '', fuelLiters: '',
                    freightSum: '', repairCosts: '', unexpectedExpenses: ''
                });
                setShowForm(false);
                setEditingTrip(null);
            };

            const editTrip = (trip) => {
                setFormData({
                    speedometerStart: trip.speedometerStart.toString(),
                    speedometerEnd: trip.speedometerEnd.toString(),
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    carNumber: trip.carNumber,
                    driverName: trip.driverName || '',
                    route: trip.route,
                    fuelAmount: trip.fuelAmount.toString(),
                    fuelLiters: trip.fuelLiters?.toString() || '',
                    freightSum: trip.freightSum.toString(),
                    repairCosts: trip.repairCosts?.toString() || '',
                    unexpectedExpenses: trip.unexpectedExpenses.toString()
                });
                setEditingTrip(trip);
                setShowForm(true);
            };

            const deleteTrip = async (id) => {
                if (!confirm('Видалити рейс?')) return;
                try {
                    await fetch(`${API_BASE_URL}/trips/${id}`, { method: 'DELETE' });
                    fetchTrips();
                } catch (error) {
                    alert('Помилка видалення');
                }
            };

            if (loading) {
                return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
                    React.createElement('div', { className: 'text-center' },
                        React.createElement('div', { className: 'animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto' }),
                        React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Завантаження даних...')
                    )
                );
            }

            return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-4' },
                React.createElement('div', { className: 'max-w-7xl mx-auto' },
                    React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-8' }, '🚚 CRM bus0011.com'),
                    
                    React.createElement('div', { className: 'mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded' },
                        '✅ Підключено до Railway PostgreSQL'
                    ),
                    
                    React.createElement('button', {
                        onClick: () => setShowForm(true),
                        className: 'mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2'
                    },
                        React.createElement(Plus),
                        React.createElement('span', null, 'Додати рейс')
                    ),

                    showForm && React.createElement('div', { className: 'bg-white rounded-lg shadow-md p-6 mb-6' },
                        React.createElement('h2', { className: 'text-xl font-semibold mb-4' },
                            editingTrip ? 'Редагувати рейс' : 'Новий рейс'
                        ),
                        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
                            // Поля форми
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Спідометр початок'),
                                React.createElement('input', {
                                    type: 'number',
                                    value: formData.speedometerStart,
                                    onChange: (e) => setFormData({...formData, speedometerStart: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Спідометр кінець'),
                                React.createElement('input', {
                                    type: 'number',
                                    value: formData.speedometerEnd,
                                    onChange: (e) => setFormData({...formData, speedometerEnd: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Номер авто'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.carNumber,
                                    onChange: (e) => setFormData({...formData, carNumber: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Водій'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.driverName,
                                    onChange: (e) => setFormData({...formData, driverName: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Маршрут'),
                                React.createElement('input', {
                                    type: 'text',
                                    value: formData.route,
                                    onChange: (e) => setFormData({...formData, route: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', null,
                                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Сума фрахту (грн)'),
                                React.createElement('input', {
                                    type: 'number',
                                    step: '0.01',
                                    value: formData.freightSum,
                                    onChange: (e) => setFormData({...formData, freightSum: e.target.value}),
                                    className: 'w-full border rounded-lg px-3 py-2'
                                })
                            ),
                            React.createElement('div', { className: 'md:col-span-2 lg:col-span-3 flex space-x-2' },
                                React.createElement('button', {
                                    onClick: handleSubmit,
                                    className: 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
                                }, editingTrip ? 'Оновити' : 'Зберегти'),
                                React.createElement('button', {
                                    onClick: resetForm,
                                    className: 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600'
                                }, 'Скасувати')
                            )
                        )
                    ),

                    React.createElement('div', { className: 'bg-white rounded-lg shadow-md overflow-hidden' },
                        React.createElement('div', { className: 'overflow-x-auto' },
                            React.createElement('table', { className: 'w-full' },
                                React.createElement('thead', { className: 'bg-gray-50' },
                                    React.createElement('tr', null,
                                        React.createElement('th', { className: 'px-4 py-3 text-left text-sm font-medium text-gray-900' }, 'Авто'),
                                        React.createElement('th', { className: 'px-4 py-3 text-left text-sm font-medium text-gray-900' }, 'Водій'),
                                        React.createElement('th', { className: 'px-4 py-3 text-left text-sm font-medium text-gray-900' }, 'Маршрут'),
                                        React.createElement('th', { className: 'px-4 py-3 text-left text-sm font-medium text-gray-900' }, 'Фрахт'),
                                        React.createElement('th', { className: 'px-4 py-3 text-left text-sm font-medium text-gray-900' }, 'Дії')
                                    )
                                ),
                                React.createElement('tbody', { className: 'divide-y divide-gray-200' },
                                    trips.map(trip => 
                                        React.createElement('tr', { key: trip.id, className: 'hover:bg-gray-50' },
                                            React.createElement('td', { className: 'px-4 py-3 text-sm' }, trip.carNumber),
                                            React.createElement('td', { className: 'px-4 py-3 text-sm' }, trip.driverName || '-'),
                                            React.createElement('td', { className: 'px-4 py-3 text-sm' }, trip.route),
                                            React.createElement('td', { className: 'px-4 py-3 text-sm font-semibold text-green-600' }, 
                                                trip.freightSum?.toFixed(2) + ' грн'
                                            ),
                                            React.createElement('td', { className: 'px-4 py-3 text-sm' },
                                                React.createElement('div', { className: 'flex space-x-2' },
                                                    React.createElement('button', {
                                                        onClick: () => editTrip(trip),
                                                        className: 'text-blue-600 hover:text-blue-800'
                                                    }, React.createElement(Edit2)),
                                                    React.createElement('button', {
                                                        onClick: () => deleteTrip(trip.id),
                                                        className: 'text-red-600 hover:text-red-800'
                                                    }, React.createElement(Trash2))
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            trips.length === 0 && React.createElement('div', { className: 'text-center py-8 text-gray-500' },
                                'Рейсів поки що немає. Додайте перший рейс!'
                            )
                        )
                    )
                )
            );
        };

        // Запуск додатку
        ReactDOM.render(React.createElement(TransportCRM), document.getElementById('root'));
    


```
