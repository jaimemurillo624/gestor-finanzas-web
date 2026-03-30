<template>
  <div class="transaction-form-container">
    <div class="form-card">
      <h2>{{ isEditing ? '✏️ Editar Transacción' : '➕ Agregar Transacción' }}</h2>

      <!-- Mensaje de error -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
        ✅ {{ isEditing ? 'Transacción actualizada' : 'Transacción creada' }} correctamente
        <button type="button" class="btn-close" @click="success = false"></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Tipo de Transacción -->
        <div class="mb-3">
          <label class="form-label">📊 Tipo de Transacción</label>
          <div class="btn-group w-100" role="group">
            <input
              type="radio"
              class="btn-check"
              name="type"
              id="type-ingreso"
              value="ingreso"
              v-model="formData.type"
              :disabled="loading"
            />
            <label class="btn btn-outline-success" for="type-ingreso">
              ⬆️ Ingreso
            </label>

            <input
              type="radio"
              class="btn-check"
              name="type"
              id="type-gasto"
              value="gasto"
              v-model="formData.type"
              :disabled="loading"
            />
            <label class="btn btn-outline-danger" for="type-gasto">
              ⬇️ Gasto
            </label>
          </div>
        </div>

        <!-- Monto -->
        <div class="mb-3">
          <label for="amount" class="form-label">💰 Monto</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              min="0.01"
              class="form-control"
              placeholder="0.00"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Categoría -->
        <div class="mb-3">
          <label for="category" class="form-label">🏷️ Categoría</label>
          <div class="category-selector">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="category-btn"
              :class="{ active: formData.categoryId === cat.id }"
              @click="selectCategory(cat)"
              :disabled="loading"
            >
              <span class="category-icon">{{ cat.icon }}</span>
              <span class="category-name">{{ cat.name }}</span>
            </button>
          </div>
          <small class="text-danger" v-if="categoryError">
            {{ categoryError }}
          </small>
        </div>

        <!-- Descripción -->
        <div class="mb-3">
          <label for="description" class="form-label">📝 Descripción</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-control"
            placeholder="Ej: Almuerzo en restaurante"
            rows="3"
            required
            :disabled="loading"
          ></textarea>
        </div>

        <!-- Fecha -->
        <div class="mb-3">
          <label for="date" class="form-label">📅 Fecha</label>
          <input
            id="date"
            v-model="formData.date"
            type="datetime-local"
            class="form-control"
            required
            :disabled="loading"
          />
        </div>

        <!-- Botones -->
        <div class="button-group">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            @click="resetForm"
            :disabled="loading"
          >
            Limpiar
          </button>

          <button
            v-if="isEditing"
            type="button"
            class="btn btn-danger ms-auto"
            @click="handleDelete"
            :disabled="loading"
          >
            🗑️ Eliminar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getCategories, getPredefinedCategories } from '../services/categoriesService';
import { createTransaction, updateTransaction, deleteTransaction } from '../services/transactionsService';

const emit = defineEmits(['transaction-created', 'transaction-updated', 'transaction-deleted']);
const props = defineProps({
  transactionToEdit: {
    type: Object,
    default: null,
  },
});

// Estados reactivos
const formData = ref({
  type: 'gasto',
  amount: null,
  categoryId: '',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 16),
});

const categories = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref(false);
const categoryError = ref('');

// Computed
const isEditing = computed(() => !!props.transactionToEdit);

// Cargar categorías
onMounted(async () => {
  // Intentar obtener categorías del usuario
  const userCategoriesResult = await getCategories();
  
  if (userCategoriesResult.success && userCategoriesResult.data.length > 0) {
    categories.value = userCategoriesResult.data;
  } else {
    // Si no hay categorías, cargar predefinidas
    const predefinedResult = await getPredefinedCategories();
    if (predefinedResult.success) {
      categories.value = predefinedResult.data.map((cat, index) => ({
        id: index.toString(),
        ...cat,
      }));
    }
  }

  // Si estamos editando, cargar datos
  if (isEditing.value) {
    const transaction = props.transactionToEdit;
    formData.value = {
      type: transaction.type,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().slice(0, 16),
    };
  }
});

// Seleccionar categoría
const selectCategory = (category) => {
  formData.value.categoryId = category.id;
  formData.value.category = category.name;
  categoryError.value = '';
};

// Enviar formulario
const handleSubmit = async () => {
  // Validación
  if (!formData.value.categoryId) {
    categoryError.value = 'Por favor selecciona una categoría';
    return;
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    error.value = 'El monto debe ser mayor a 0';
    return;
  }

  if (!formData.value.description.trim()) {
    error.value = 'La descripción no puede estar vacía';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    if (isEditing.value) {
      // Actualizar
      const result = await updateTransaction(
        props.transactionToEdit.id,
        {
          type: formData.value.type,
          amount: formData.value.amount,
          categoryId: formData.value.categoryId,
          category: formData.value.category,
          description: formData.value.description,
          date: new Date(formData.value.date),
        }
      );

      if (result.success) {
        success.value = true;
        emit('transaction-updated', result.data);
        setTimeout(() => {
          resetForm();
        }, 1500);
      } else {
        error.value = result.error;
      }
    } else {
      // Crear
      const result = await createTransaction({
        type: formData.value.type,
        amount: formData.value.amount,
        categoryId: formData.value.categoryId,
        category: formData.value.category,
        description: formData.value.description,
        date: new Date(formData.value.date),
      });

      if (result.success) {
        success.value = true;
        emit('transaction-created', result.data);
        resetForm();
      } else {
        error.value = result.error;
      }
    }
  } catch (err) {
    error.value = 'Error inesperado: ' + err.message;
  } finally {
    loading.value = false;
  }
};

// Eliminar transacción
const handleDelete = async () => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await deleteTransaction(props.transactionToEdit.id);

    if (result.success) {
      success.value = true;
      emit('transaction-deleted', props.transactionToEdit.id);
      setTimeout(() => {
        resetForm();
      }, 1500);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = 'Error al eliminar: ' + err.message;
  } finally {
    loading.value = false;
  }
};

// Limpiar formulario
const resetForm = () => {
  if (!isEditing.value) {
    formData.value = {
      type: 'gasto',
      amount: null,
      categoryId: '',
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
    };
    error.value = '';
    success.value = false;
  }
};
</script>

<style scoped>
.transaction-form-container {
  padding: 20px;
}

.form-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 30px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.form-card h2 {
  color: var(--text-primary);
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

/* Alertas */
.alert {
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

/* Botones de tipo */
.btn-group {
  border-radius: 8px;
  overflow: hidden;
}

.btn-outline-success {
  color: #28a745;
  border-color: #28a745;
  background-color: transparent;
  transition: all 0.3s ease;
}

.btn-outline-success:hover,
.btn-outline-success.active {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  background-color: transparent;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover,
.btn-outline-danger.active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

/* Input group */
.input-group-text {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-control {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-control::placeholder {
  color: var(--text-secondary);
}

/* Selector de categorías */
.category-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  color: var(--text-primary);
}

.category-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.category-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.category-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.category-name {
  font-weight: 500;
  text-align: center;
}

/* Grupo de botones */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 25px;
  flex-wrap: wrap;
}

.btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--hover-bg);
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(220, 53, 69, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

/* Mensajes de error */
.text-danger {
  color: #dc3545 !important;
  font-size: 12px;
  margin-top: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .transaction-form-container {
    padding: 10px;
  }
  
  .form-card {
    padding: 20px;
  }
  
  .form-card h2 {
    font-size: 20px;
  }
  
  .category-selector {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .category-btn {
    padding: 10px;
  }
  
  .category-icon {
    font-size: 20px;
  }
  
  .category-name {
    font-size: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .ms-auto {
    margin-left: 0 !important;
  }
}
</style>