const categoriesService = require('../services/categoriesService');

/**
 * GET /api/categories
 * Obtener todas las categorías del usuario
 */
const getCategories = async (req, res) => {
  try {
    const userId = req.user.uid;
    const categories = await categoriesService.getUserCategories(userId);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error en getCategories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/categories/predefined
 * Obtener categorías predefinidas
 */
const getPredefinedCategories = (req, res) => {
  try {
    const categories = categoriesService.getPredefinedCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error en getPredefinedCategories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/categories
 * Crear una nueva categoría
 */
const createCategory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, icon, color } = req.body;

    const category = await categoriesService.createCategory(userId, {
      name,
      icon,
      color,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error en createCategory:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PUT /api/categories/:id
 * Actualizar una categoría
 */
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const categoryId = req.params.id;
    const updateData = req.body;

    const category = await categoriesService.updateCategory(
      userId,
      categoryId,
      updateData
    );

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error en updateCategory:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Eliminar una categoría
 */
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const categoryId = req.params.id;

    await categoriesService.deleteCategory(userId, categoryId);

    res.json({
      success: true,
      message: 'Categoría eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en deleteCategory:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getPredefinedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};