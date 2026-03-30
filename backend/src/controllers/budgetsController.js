const budgetsService = require('../services/budgetsService');

/**
 * GET /api/budgets
 * Obtener presupuestos del usuario
 */
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.uid;
    const budgets = await budgetsService.getUserBudgets(userId);

    res.json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    console.error('Error en getBudgets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/budgets/summary/:month
 * Obtener resumen de presupuestos para un mes
 * Params: month (YYYY-MM)
 */
const getBudgetsSummary = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { month } = req.params;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de mes inválido. Use YYYY-MM',
      });
    }

    const summary = await budgetsService.getBudgetsSummary(userId, month);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error en getBudgetsSummary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/budgets
 * Crear un nuevo presupuesto
 */
const createBudget = async (req, res) => {
  try {
    const userId = req.user.uid;
    const budgetData = req.body;

    const budget = await budgetsService.createBudget(userId, budgetData);

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error('Error en createBudget:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PUT /api/budgets/:id
 * Actualizar un presupuesto
 */
const updateBudget = async (req, res) => {
  try {
    const userId = req.user.uid;
    const budgetId = req.params.id;
    const updateData = req.body;

    const budget = await budgetsService.updateBudget(
      userId,
      budgetId,
      updateData
    );

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error('Error en updateBudget:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * DELETE /api/budgets/:id
 * Eliminar un presupuesto
 */
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.uid;
    const budgetId = req.params.id;

    await budgetsService.deleteBudget(userId, budgetId);

    res.json({
      success: true,
      message: 'Presupuesto eliminado correctamente',
    });
  } catch (error) {
    console.error('Error en deleteBudget:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  getBudgetsSummary,
  createBudget,
  updateBudget,
  deleteBudget,
};