const transactionsService = require('../services/transactionsService');

/**
 * GET /api/transactions
 * Obtener transacciones del usuario con filtros opcionales
 * Query params: type, categoryId, startDate, endDate
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { type, categoryId, startDate, endDate } = req.query;

    // Construir filtros
    const filters = {};
    if (type) filters.type = type;
    if (categoryId) filters.categoryId = categoryId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const transactions = await transactionsService.getUserTransactions(
      userId,
      filters
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error en getTransactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/transactions/summary
 * Obtener resumen de transacciones (ingresos, gastos, balance)
 */
const getTransactionsSummary = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { type, categoryId, startDate, endDate } = req.query;

    // Construir filtros
    const filters = {};
    if (type) filters.type = type;
    if (categoryId) filters.categoryId = categoryId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const summary = await transactionsService.getTransactionsSummary(
      userId,
      filters
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error en getTransactionsSummary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/transactions
 * Crear una nueva transacción
 * Body: type, amount, categoryId, category, description, date
 */
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.uid;
    const transactionData = req.body;

    const transaction = await transactionsService.createTransaction(
      userId,
      transactionData
    );

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error en createTransaction:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PUT /api/transactions/:id
 * Actualizar una transacción
 */
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.uid;
    const transactionId = req.params.id;
    const updateData = req.body;

    const transaction = await transactionsService.updateTransaction(
      userId,
      transactionId,
      updateData
    );

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error en updateTransaction:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * DELETE /api/transactions/:id
 * Eliminar una transacción
 */
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.uid;
    const transactionId = req.params.id;

    await transactionsService.deleteTransaction(userId, transactionId);

    res.json({
      success: true,
      message: 'Transacción eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en deleteTransaction:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionsSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};