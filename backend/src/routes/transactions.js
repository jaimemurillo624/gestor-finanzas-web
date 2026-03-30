const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionsController = require('../controllers/transactionsController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las dinámicas
 */

/**
 * GET /api/transactions/summary
 * Obtener resumen de transacciones
 * DEBE IR ANTES de /:id
 */
router.get('/summary', transactionsController.getTransactionsSummary);

/**
 * GET /api/transactions
 * Obtener transacciones del usuario
 * Query params opcionales: type, categoryId, startDate, endDate
 */
router.get('/', transactionsController.getTransactions);

/**
 * POST /api/transactions
 * Crear una nueva transacción
 */
router.post('/', transactionsController.createTransaction);

/**
 * PUT /api/transactions/:id
 * Actualizar una transacción
 */
router.put('/:id', transactionsController.updateTransaction);

/**
 * DELETE /api/transactions/:id
 * Eliminar una transacción
 */
router.delete('/:id', transactionsController.deleteTransaction);

module.exports = router;