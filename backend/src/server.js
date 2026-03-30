const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de Firebase
const { db, auth } = require('./config/firebase');

// Importar rutas
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;
const budgetsRoutes = require('./routes/budgets');

// ===== MIDDLEWARES =====
app.use(cors()); // Permitir solicitudes desde el frontend
app.use(express.json()); // Parsear JSON

// ===== RUTAS PÚBLICAS =====

/**
 * GET /api/health
 * Verifica si el servidor está funcionando
 */
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Servidor funcionando correctamente',
    timestamp: new Date(),
  });
});

// ===== RUTAS PROTEGIDAS =====

/**
 * Rutas de categorías
 * Todas requieren autenticación
 */
app.use('/api/categories', categoriesRoutes);

/**
 * Rutas de transacciones
 * Todas requieren autenticación
 */
app.use('/api/transactions', transactionsRoutes);


app.use('/api/budgets', budgetsRoutes);
// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`🔥 Firebase conectado - Proyecto: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log('\n📚 Rutas disponibles:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/categories');
  console.log('   GET  /api/categories/predefined');
  console.log('   POST /api/categories');
  console.log('   PUT  /api/categories/:id');
  console.log('   DELETE /api/categories/:id');
  console.log('   GET  /api/transactions');
  console.log('   GET  /api/transactions/summary');
  console.log('   POST /api/transactions');
  console.log('   PUT  /api/transactions/:id');
  console.log('   DELETE /api/transactions/:id\n');
});

module.exports = app;
