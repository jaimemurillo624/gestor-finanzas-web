const { db } = require('../config/firebase');

/**
 * Obtener presupuestos del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de presupuestos
 */
const getUserBudgets = async (userId) => {
  try {
    const snapshot = await db
      .collection('budgets')
      .where('userId', '==', userId)
      .get();

    const budgets = [];
    snapshot.forEach((doc) => {
      budgets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return budgets;
  } catch (error) {
    throw new Error(`Error al obtener presupuestos: ${error.message}`);
  }
};

/**
 * Crear un nuevo presupuesto
 * @param {string} userId - ID del usuario
 * @param {Object} budgetData - Datos del presupuesto
 * @returns {Promise<Object>} - Presupuesto creado
 */
const createBudget = async (userId, budgetData) => {
  try {
    // Validación
    if (!budgetData.categoryId || !budgetData.limit || budgetData.limit <= 0) {
      throw new Error('CategoryId y limit son requeridos');
    }

    const newBudget = {
      categoryId: budgetData.categoryId,
      categoryName: budgetData.categoryName || 'Sin nombre',
      limit: parseFloat(budgetData.limit),
      month: budgetData.month || new Date().toISOString().substring(0, 7), // YYYY-MM
      userId,
      createdAt: new Date(),
    };

    const docRef = await db.collection('budgets').add(newBudget);

    return {
      id: docRef.id,
      ...newBudget,
    };
  } catch (error) {
    throw new Error(`Error al crear presupuesto: ${error.message}`);
  }
};

/**
 * Actualizar un presupuesto
 * @param {string} userId - ID del usuario
 * @param {string} budgetId - ID del presupuesto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Presupuesto actualizado
 */
const updateBudget = async (userId, budgetId, updateData) => {
  try {
    const budgetDoc = await db
      .collection('budgets')
      .doc(budgetId)
      .get();

    if (!budgetDoc.exists) {
      throw new Error('Presupuesto no encontrado');
    }

    if (budgetDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para actualizar este presupuesto');
    }

    if (updateData.limit && updateData.limit <= 0) {
      throw new Error('El límite debe ser mayor a 0');
    }

    const dataToUpdate = { ...updateData };
    if (dataToUpdate.limit) {
      dataToUpdate.limit = parseFloat(dataToUpdate.limit);
    }

    await db.collection('budgets').doc(budgetId).update(dataToUpdate);

    return {
      id: budgetId,
      ...budgetDoc.data(),
      ...dataToUpdate,
    };
  } catch (error) {
    throw new Error(`Error al actualizar presupuesto: ${error.message}`);
  }
};

/**
 * Eliminar un presupuesto
 * @param {string} userId - ID del usuario
 * @param {string} budgetId - ID del presupuesto
 * @returns {Promise<void>}
 */
const deleteBudget = async (userId, budgetId) => {
  try {
    const budgetDoc = await db
      .collection('budgets')
      .doc(budgetId)
      .get();

    if (!budgetDoc.exists) {
      throw new Error('Presupuesto no encontrado');
    }

    if (budgetDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar este presupuesto');
    }

    await db.collection('budgets').doc(budgetId).delete();
  } catch (error) {
    throw new Error(`Error al eliminar presupuesto: ${error.message}`);
  }
};

/**
 * Obtener resumen de presupuestos (gasto vs presupuesto)
 * @param {string} userId - ID del usuario
 * @param {string} month - Mes (YYYY-MM)
 * @returns {Promise<Array>} - Resumen por categoría
 */
const getBudgetsSummary = async (userId, month) => {
  try {
    // Obtener presupuestos del mes
    const budgets = await getUserBudgets(userId);
    const monthBudgets = budgets.filter((b) => b.month === month);

    // Obtener transacciones del mes
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Consultar transacciones directamente desde Firestore
    const transactionsSnapshot = await db
      .collection('transactions')
      .where('userId', '==', userId)
      .where('type', '==', 'gasto')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    const transactions = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Agrupar gastos por categoría
    const spendingByCategory = {};
    transactions.forEach((t) => {
      const categoryId = t.categoryId;
      spendingByCategory[categoryId] = (spendingByCategory[categoryId] || 0) + t.amount;
    });

    // Construir resumen
    const summary = monthBudgets.map((budget) => {
      const spent = spendingByCategory[budget.categoryId] || 0;
      const remaining = budget.limit - spent;
      const percentage = (spent / budget.limit) * 100;

      return {
        ...budget,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentage: Math.min(percentage, 100),
        isExceeded: spent > budget.limit,
      };
    });

    return summary;
  } catch (error) {
    throw new Error(`Error al obtener resumen de presupuestos: ${error.message}`);
  }
};

module.exports = {
  getUserBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetsSummary,
};