import apiClient from './apiService';

/**
 * Obtener categorías predefinidas
 * @returns {Promise<Array>} - Array de categorías predefinidas
 */
export const getPredefinedCategories = async () => {
  try {
    const response = await apiClient.get('/categories/predefined');
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getPredefinedCategories:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Obtener categorías del usuario
 * @returns {Promise<Array>} - Array de categorías
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en getCategories:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Crear una nueva categoría
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} - Categoría creada
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en createCategory:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Actualizar una categoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Categoría actualizada
 */
export const updateCategory = async (categoryId, updateData) => {
  try {
    const response = await apiClient.put(
      `/categories/${categoryId}`,
      updateData
    );
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error en updateCategory:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Eliminar una categoría
 * @param {string} categoryId - ID de la categoría
 * @returns {Promise<Object>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    await apiClient.delete(`/categories/${categoryId}`);
    
    return {
      success: true,
      message: 'Categoría eliminada',
    };
  } catch (error) {
    console.error('Error en deleteCategory:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};
