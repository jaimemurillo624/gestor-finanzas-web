const { db } = require('../config/firebase');

/**
 * Obtener todas las transacciones del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} filters - Filtros (opcional)
 * @returns {Promise<Array>} - Array de transacciones
 */
const getUserTransactions = async (userId, filters = {}) => {
  try {
    let query = db
      .collection('transactions')
      .where('userId', '==', userId);

    // Filtro por tipo (ingreso/gasto)
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    // Filtro por categoría
    if (filters.categoryId) {
      query = query.where('categoryId', '==', filters.categoryId);
    }

    // Filtro por fecha (desde)
    if (filters.startDate) {
      query = query.where('date', '>=', filters.startDate);
    }

    // Filtro por fecha (hasta)
    if (filters.endDate) {
      query = query.where('date', '<=', filters.endDate);
    }

    // Ordenar por fecha descendente
    query = query.orderBy('date', 'desc');

    const snapshot = await query.get();

    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(), // Convertir timestamp a Date
      });
    });

    return transactions;
  } catch (error) {
    throw new Error(`Error al obtener transacciones: ${error.message}`);
  }
};

/**
 * Crear una nueva transacción
 * @param {string} userId - ID del usuario
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Promise<Object>} - Transacción creada
 */
const createTransaction = async (userId, transactionData) => {
  try {
    // Validación
    const requiredFields = ['type', 'amount', 'categoryId', 'description', 'date'];
    for (const field of requiredFields) {
      if (!(field in transactionData)) {
        throw new Error(`Campo requerido: ${field}`);
      }
    }

    if (!['ingreso', 'gasto'].includes(transactionData.type)) {
      throw new Error('El tipo debe ser "ingreso" o "gasto"');
    }

    if (transactionData.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    const newTransaction = {
      type: transactionData.type,
      amount: parseFloat(transactionData.amount),
      categoryId: transactionData.categoryId,
      category: transactionData.category || 'Sin categoría',
      description: transactionData.description.trim(),
      date: new Date(transactionData.date),
      userId,
      createdAt: new Date(),
    };

    const docRef = await db.collection('transactions').add(newTransaction);

    return {
      id: docRef.id,
      ...newTransaction,
    };
  } catch (error) {
    throw new Error(`Error al crear transacción: ${error.message}`);
  }
};

/**
 * Actualizar una transacción
 * @param {string} userId - ID del usuario
 * @param {string} transactionId - ID de la transacción
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Transacción actualizada
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  try {
    // Verificar que existe
    const transactionDoc = await db
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      throw new Error('Transacción no encontrada');
    }

    const transaction = transactionDoc.data();

    // Verificar permisos
    if (transaction.userId !== userId) {
      throw new Error('No tienes permiso para actualizar esta transacción');
    }

    // Validar datos actualizados
    if (updateData.type && !['ingreso', 'gasto'].includes(updateData.type)) {
      throw new Error('El tipo debe ser "ingreso" o "gasto"');
    }

    if (updateData.amount && updateData.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Preparar datos para actualizar
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.amount) {
      dataToUpdate.amount = parseFloat(dataToUpdate.amount);
    }
    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date);
    }

    // Actualizar
    await db
      .collection('transactions')
      .doc(transactionId)
      .update(dataToUpdate);

    return {
      id: transactionId,
      ...transaction,
      ...dataToUpdate,
    };
  } catch (error) {
    throw new Error(`Error al actualizar transacción: ${error.message}`);
  }
};

/**
 * Eliminar una transacción
 * @param {string} userId - ID del usuario
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<void>}
 */
const deleteTransaction = async (userId, transactionId) => {
  try {
    // Verificar que existe
    const transactionDoc = await db
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      throw new Error('Transacción no encontrada');
    }

    const transaction = transactionDoc.data();

    // Verificar permisos
    if (transaction.userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta transacción');
    }

    // Eliminar
    await db.collection('transactions').doc(transactionId).delete();
  } catch (error) {
    throw new Error(`Error al eliminar transacción: ${error.message}`);
  }
};

/**
 * Obtener resumen de transacciones
 * @param {string} userId - ID del usuario
 * @param {Object} filters - Filtros (opcional)
 * @returns {Promise<Object>} - Resumen (ingresos, gastos, balance)
 */
const getTransactionsSummary = async (userId, filters = {}) => {
  try {
    const transactions = await getUserTransactions(userId, filters);

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'ingreso') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'gasto') {
        totalExpenses += transaction.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      transactionCount: transactions.length,
    };
  } catch (error) {
    throw new Error(`Error al obtener resumen: ${error.message}`);
  }
};

module.exports = {
  getUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary,
};