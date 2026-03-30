<template>
  <div class="categories-manager">
    <div class="manager-card">
      <h2>🏷️ Mis Categorías</h2>

      <!-- Mensaje de error -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
        ✅ {{ successMessage }}
        <button type="button" class="btn-close" @click="success = false"></button>
      </div>

      <!-- Formulario para crear categoría -->
      <div class="create-form">
        <h3>➕ Nueva Categoría</h3>
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input
            v-model="newCategory.name"
            type="text"
            class="form-control"
            placeholder="Ej: Cine"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Icono (emoji)</label>
          <div class="emoji-grid">
            <button
              v-for="emoji in availableEmojis"
              :key="emoji"
              type="button"
              class="emoji-btn"
              :class="{ active: newCategory.icon === emoji }"
              @click="newCategory.icon = emoji"
              :disabled="loading"
            >
              {{ emoji }}
            </button>
          </div>
          <input
            v-model="newCategory.icon"
            type="text"
            class="form-control mt-2"
            placeholder="O escribe un emoji"
            maxlength="2"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-picker">
            <input
              v-model="newCategory.color"
              type="color"
              class="color-input"
              :disabled="loading"
            />
            <span class="color-value">{{ newCategory.color }}</span>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary w-100"
          @click="handleCreateCategory"
          :disabled="loading || !newCategory.name || !newCategory.icon"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Creando...' : 'Crear Categoría' }}
        </button>
      </div>

      <!-- Lista de categorías creadas -->
      <div class="categories-list">
        <h3>📚 Tus Categorías</h3>

        <div v-if="userCategories.length === 0" class="empty-message">
          📭 Aún no has creado categorías personalizadas
        </div>

        <div v-else class="categories-grid">
          <div
            v-for="category in userCategories"
            :key="category.id"
            class="category-item"
            :style="{ borderLeftColor: category.color }"
          >
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>

            <div class="category-actions">
              <button
                class="btn btn-sm btn-outline-danger"
                @click="handleDeleteCategory(category.id)"
                :disabled="loading"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorías predefinidas -->
      <div class="predefined-categories">
        <h3>📌 Categorías Predefinidas</h3>
        <p class="text-muted">Puedes usar estas categorías directamente en tus transacciones</p>

        <div class="categories-grid">
          <div
            v-for="(category, index) in predefinedCategories"
            :key="index"
            class="category-item predefined"
            :style="{ borderLeftColor: category.color }"
          >
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getCategories,
  getPredefinedCategories,
  createCategory,
  deleteCategory,
} from '../services/categoriesService';

const emit = defineEmits(['category-created', 'category-deleted']);

// Estados
const userCategories = ref([]);
const predefinedCategories = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref(false);
const successMessage = ref('');

const availableEmojis = [
  '🍔', '🚗', '🎬', '🏥', '📚',
  '🛍️', '🔧', '✈️', '📱', '🎮',
  '⚽', '🎵', '💄', '🏠', '🌍',
];

const newCategory = ref({
  name: '',
  icon: '📌',
  color: '#667eea',
});

// Cargar datos al montar
onMounted(async () => {
  await loadCategories();
});

// Cargar categorías
const loadCategories = async () => {
  // Cargar categorías del usuario
  const userResult = await getCategories();
  if (userResult.success) {
    userCategories.value = userResult.data;
  }

  // Cargar categorías predefinidas
  const predefinedResult = await getPredefinedCategories();
  if (predefinedResult.success) {
    predefinedCategories.value = predefinedResult.data;
  }
};

// Crear categoría
const handleCreateCategory = async () => {
  if (!newCategory.value.name || !newCategory.value.icon) {
    error.value = 'Por favor completa todos los campos';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const result = await createCategory({
      name: newCategory.value.name,
      icon: newCategory.value.icon,
      color: newCategory.value.color,
    });

    if (result.success) {
      success.value = true;
      successMessage.value = `Categoría "${newCategory.value.name}" creada`;
      
      // Limpiar formulario
      newCategory.value = {
        name: '',
        icon: '📌',
        color: '#667eea',
      };

      // Recargar categorías
      await loadCategories();
      emit('category-created', result.data);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = 'Error inesperado: ' + err.message;
  } finally {
    loading.value = false;
  }
};

// Eliminar categoría
const handleDeleteCategory = async (categoryId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await deleteCategory(categoryId);

    if (result.success) {
      success.value = true;
      successMessage.value = 'Categoría eliminada';
      await loadCategories();
      emit('category-deleted', categoryId);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = 'Error al eliminar: ' + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.categories-manager {
  padding: 20px;
}

.manager-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.manager-card h2 {
  color: #333;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
}

.manager-card h3 {
  color: #555;
  font-size: 18px;
  font-weight: 600;
  margin: 25px 0 15px 0;
}

.create-form {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-control {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  padding: 0;
}

.emoji-btn:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.emoji-btn.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.emoji-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  color: #666;
  font-weight: 500;
}

.categories-list {
  margin: 30px 0;
}

.empty-message {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #999;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.category-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.category-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.category-item.predefined {
  background: #f9f9f9;
  cursor: default;
}

.category-item.predefined:hover {
  box-shadow: none;
  transform: none;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.category-icon {
  font-size: 24px;
  min-width: 30px;
  text-align: center;
}

.category-name {
  font-weight: 600;
  color: #333;
  word-break: break-word;
}

.category-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.predefined-categories {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.predefined-categories .text-muted {
  font-size: 13px;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }
}
</style>