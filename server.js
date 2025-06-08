const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Тимчасове сховище в пам'яті (для тестування)
let trips = [];
let nextId = 1;

console.log('🚀 Сервер запускається...');
console.log('📊 Режим: тестування без бази даних');

// API Routes
app.get('/api/trips', (req, res) => {
  console.log('📥 Запит на отримання рейсів');
  res.json(trips);
});

app.post('/api/trips', (req, res) => {
  console.log('📝 Додавання нового рейсу');
  const tripData = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  trips.push(tripData);
  res.status(201).json(tripData);
});

app.put('/api/trips/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = trips.findIndex(trip => trip.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Рейс не знайдено' });
  }
  
  trips[index] = { ...trips[index], ...req.body };
  res.json(trips[index]);
});

app.delete('/api/trips/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = trips.findIndex(trip => trip.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Рейс не знайдено' });
  }
  
  trips.splice(index, 1);
  res.json({ message: 'Рейс видалено успішно' });
});

// Тестовий endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CRM система bus0011.com працює!',
    timestamp: new Date().toISOString(),
    tripsCount: trips.length
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error('❌ Помилка сервера:', err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`✅ CRM сервер запущено на порту ${PORT}`);
  console.log(`🌐 URL: https://your-app.up.railway.app`);
  console.log(`🏠 Домен: bus0011.com (буде налаштовано)`);
  console.log(`📊 Тестовий API: /api/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Отримано сигнал завершення');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Отримано сигнал переривання');
  process.exit(0);
});
