import apiClient from './apiService';

/**
 * Obtener todas las transacciones del usuario
 * @param {Object} filters - Filtros opcionales (type, categoryId, startDate, endDate)
 * @returns {Promise<Array>} - Array de transacciones
 */
export const getTransactions = async (filters = {}) => {
  try {
    const response = await apiClient.get('/transactions', {
      params: filters, // ✅ CORRECTO: Pasar como objeto params
    });
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getTransactions:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Obtener resumen de transacciones
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} - Resumen (ingresos, gastos, balance)
 */
export const getTransactionsSummary = async (filters = {}) => {
  try {
    const response = await apiClient.get('/transactions/summary', {
      params: filters, // ✅ CORRECTO: Pasar como objeto params
    });
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getTransactionsSummary:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Crear una nueva transacción
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Promise<Object>} - Transacción creada
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post('/transactions', transactionData);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en createTransaction:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Actualizar una transacción
 * @param {string} transactionId - ID de la transacción
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Transacción actualizada
 */
export const updateTransaction = async (transactionId, updateData) => {
  try {
    const response = await apiClient.put(
      `/transactions/${transactionId}`,
      updateData
    );
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en updateTransaction:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Eliminar una transacción
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<Object>}
 */
export const deleteTransaction = async (transactionId) => {
  try {
    await apiClient.delete(`/transactions/${transactionId}`);
    
    return {
      success: true,
      message: 'Transacción eliminada',
    };
  } catch (error) {
    console.error('Error en deleteTransaction:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};