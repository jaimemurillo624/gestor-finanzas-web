const { db } = require('../config/firebase');

/**
 * Obtener todas las categorías del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de categorías
 */
const getUserCategories = async (userId) => {
  try {
    const snapshot = await db
      .collection('categories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return categories;
  } catch (error) {
    throw new Error(`Error al obtener categorías: ${error.message}`);
  }
};

/**
 * Crear una nueva categoría
 * @param {string} userId - ID del usuario
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} - Categoría creada
 */
const createCategory = async (userId, categoryData) => {
  try {
    // Validación
    if (!categoryData.name || !categoryData.icon || !categoryData.color) {
      throw new Error('Nombre, icono y color son requeridos');
    }

    const newCategory = {
      name: categoryData.name,
      icon: categoryData.icon,
      color: categoryData.color,
      userId,
      createdAt: new Date(),
    };

    const docRef = await db.collection('categories').add(newCategory);

    return {
      id: docRef.id,
      ...newCategory,
    };
  } catch (error) {
    throw new Error(`Error al crear categoría: ${error.message}`);
  }
};

/**
 * Actualizar una categoría
 * @param {string} userId - ID del usuario
 * @param {string} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Categoría actualizada
 */
const updateCategory = async (userId, categoryId, updateData) => {
  try {
    // Verificar que el usuario es dueño de la categoría
    const categoryDoc = await db
      .collection('categories')
      .doc(categoryId)
      .get();

    if (!categoryDoc.exists) {
      throw new Error('Categoría no encontrada');
    }

    if (categoryDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para actualizar esta categoría');
    }

    // Actualizar
    await db.collection('categories').doc(categoryId).update(updateData);

    return {
      id: categoryId,
      ...categoryDoc.data(),
      ...updateData,
    };
  } catch (error) {
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }
};

/**
 * Eliminar una categoría
 * @param {string} userId - ID del usuario
 * @param {string} categoryId - ID de la categoría
 * @returns {Promise<void>}
 */
const deleteCategory = async (userId, categoryId) => {
  try {
    // Verificar que el usuario es dueño
    const categoryDoc = await db
      .collection('categories')
      .doc(categoryId)
      .get();

    if (!categoryDoc.exists) {
      throw new Error('Categoría no encontrada');
    }

    if (categoryDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta categoría');
    }

    // Eliminar
    await db.collection('categories').doc(categoryId).delete();
  } catch (error) {
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
};

/**
 * Obtener categorías predefinidas
 * Retorna categorías de ejemplo que el usuario puede usar
 * @returns {Array} - Categorías predefinidas
 */
const getPredefinedCategories = () => {
  return [
    { name: 'Comida', icon: '🍔', color: '#FF5733' },
    { name: 'Transporte', icon: '🚗', color: '#3498DB' },
    { name: 'Entretenimiento', icon: '🎬', color: '#9B59B6' },
    { name: 'Salud', icon: '🏥', color: '#E74C3C' },
    { name: 'Educación', icon: '📚', color: '#F39C12' },
    { name: 'Compras', icon: '🛍️', color: '#E91E63' },
    { name: 'Servicios', icon: '🔧', color: '#00BCD4' },
    { name: 'Viajes', icon: '✈️', color: '#4CAF50' },
    { name: 'Suscripciones', icon: '📱', color: '#2196F3' },
    { name: 'Otro', icon: '📌', color: '#95A5A6' },
  ];
};

module.exports = {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPredefinedCategories,
};