const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const categoriesController = require('../controllers/categoriesController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las dinámicas
 */

/**
 * GET /api/categories/predefined
 * Obtener categorías predefinidas
 * DEBE IR ANTES de /:id
 */
router.get('/predefined', categoriesController.getPredefinedCategories);

/**
 * GET /api/categories
 * Obtener categorías del usuario
 */
router.get('/', categoriesController.getCategories);

/**
 * POST /api/categories
 * Crear una nueva categoría
 */
router.post('/', categoriesController.createCategory);

/**
 * PUT /api/categories/:id
 * Actualizar una categoría
 */
router.put('/:id', categoriesController.updateCategory);

/**
 * DELETE /api/categories/:id
 * Eliminar una categoría
 */
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;