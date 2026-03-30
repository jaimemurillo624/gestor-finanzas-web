const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const budgetsController = require('../controllers/budgetsController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/budgets/summary/:month
 * Obtener resumen de presupuestos
 * DEBE IR ANTES de /:id
 */
router.get('/summary/:month', budgetsController.getBudgetsSummary);

/**
 * GET /api/budgets
 * Obtener presupuestos del usuario
 */
router.get('/', budgetsController.getBudgets);

/**
 * POST /api/budgets
 * Crear un nuevo presupuesto
 */
router.post('/', budgetsController.createBudget);

/**
 * PUT /api/budgets/:id
 * Actualizar un presupuesto
 */
router.put('/:id', budgetsController.updateBudget);

/**
 * DELETE /api/budgets/:id
 * Eliminar un presupuesto
 */
router.delete('/:id', budgetsController.deleteBudget);

module.exports = router;