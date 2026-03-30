import apiClient from './apiService';

/**
 * Obtener presupuestos del usuario
 * @returns {Promise<Array>} - Array de presupuestos
 */
export const getBudgets = async () => {
  try {
    const response = await apiClient.get('/budgets');
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getBudgets:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Obtener resumen de presupuestos para un mes
 * @param {string} month - Mes (YYYY-MM)
 * @returns {Promise<Array>} - Resumen de presupuestos
 */
export const getBudgetsSummary = async (month) => {
  try {
    const response = await apiClient.get(`/budgets/summary/${month}`);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getBudgetsSummary:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Crear un nuevo presupuesto
 * @param {Object} budgetData - Datos del presupuesto
 * @returns {Promise<Object>} - Presupuesto creado
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await apiClient.post('/budgets', budgetData);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en createBudget:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Actualizar un presupuesto
 * @param {string} budgetId - ID del presupuesto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Presupuesto actualizado
 */
export const updateBudget = async (budgetId, updateData) => {
  try {
    const response = await apiClient.put(`/budgets/${budgetId}`, updateData);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en updateBudget:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Eliminar un presupuesto
 * @param {string} budgetId - ID del presupuesto
 * @returns {Promise<Object>}
 */
export const deleteBudget = async (budgetId) => {
  try {
    await apiClient.delete(`/budgets/${budgetId}`);
    
    return {
      success: true,
      message: 'Presupuesto eliminado',
    };
  } catch (error) {
    console.error('Error en deleteBudget:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};