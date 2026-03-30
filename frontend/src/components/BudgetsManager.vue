<template>
  <div class="budgets-manager">
    <div class="manager-card">
      <h2>💼 Mis Presupuestos</h2>

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

      <!-- Selector de mes -->
      <div class="month-selector">
        <label class="form-label">Mes:</label>
        <input
          v-model="selectedMonth"
          type="month"
          class="form-control"
          @change="loadBudgetsSummary"
        />
      </div>

      <!-- Crear nuevo presupuesto -->
      <div class="create-form">
        <h3>➕ Crear Presupuesto</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select
              v-model="newBudget.categoryId"
              class="form-select"
              :disabled="loading"
            >
              <option value="">Selecciona una categoría</option>
              <option
                v-for="cat in availableCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Límite ($)</label>
            <input
              v-model.number="newBudget.limit"
              type="number"
              step="0.01"
              min="0.01"
              class="form-control"
              placeholder="100.00"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <button
              type="button"
              class="btn btn-primary"
              @click="handleCreateBudget"
              :disabled="loading || !newBudget.categoryId || !newBudget.limit"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de presupuestos -->
      <div class="budgets-list">
        <h3>📊 Presupuestos de {{ monthLabel }}</h3>

        <div v-if="budgetsSummary.length === 0" class="empty-message">
          📭 No hay presupuestos para este mes
        </div>

        <div v-else class="budgets-grid">
          <div
            v-for="budget in budgetsSummary"
            :key="budget.id"
            class="budget-card"
            :class="{ exceeded: budget.isExceeded }"
          >
            <div class="budget-header">
              <h4>{{ budget.categoryName }}</h4>
              <span v-if="budget.isExceeded" class="badge-exceeded">⚠️ Excedido</span>
            </div>

            <div class="budget-progress">
              <div class="progress">
                <div
                  class="progress-bar"
                  :class="budget.isExceeded ? 'bg-danger' : 'bg-success'"
                  :style="{ width: budget.percentage + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                <span>${{ budget.spent.toFixed(2) }} de ${{ budget.limit.toFixed(2) }}</span>
                <span class="percentage">{{ Math.round(budget.percentage) }}%</span>
              </div>
            </div>

            <div class="budget-remaining" :class="budget.isExceeded ? 'text-danger' : 'text-success'">
              {{ budget.isExceeded ? 'Exceso: ' : 'Disponible: ' }}
              ${{ Math.abs(budget.remaining).toFixed(2) }}
            </div>

            <button
              class="btn btn-sm btn-outline-danger"
              @click="handleDeleteBudget(budget.id)"
              :disabled="loading"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getCategories, getPredefinedCategories } from '@/services/categoriesService';
import { createBudget, deleteBudget, getBudgetsSummary } from '@/services/budgetsService';

const emit = defineEmits(['budget-created', 'budget-deleted']);

// Estados
const selectedMonth = ref(getCurrentMonth());
const budgetsSummary = ref([]);
const availableCategories = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref(false);
const successMessage = ref('');

const newBudget = ref({
  categoryId: '',
  limit: null,
});

// Computed
const monthLabel = computed(() => {
  const [year, month] = selectedMonth.value.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
});

// Cargar datos al montar
onMounted(async () => {
  await loadCategories();
  await loadBudgetsSummary();
});

// Obtener mes actual en formato YYYY-MM
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Cargar categorías
const loadCategories = async () => {
  // Obtener categorías del usuario
  const userResult = await getCategories();
  if (userResult.success && userResult.data.length > 0) {
    availableCategories.value = userResult.data;
  } else {
    // Cargar predefinidas
    const predefinedResult = await getPredefinedCategories();
    if (predefinedResult.success) {
      availableCategories.value = predefinedResult.data.map((cat, index) => ({
        id: index.toString(),
        ...cat,
      }));
    }
  }
};

// Cargar resumen de presupuestos
const loadBudgetsSummary = async () => {
  loading.value = true;
  const result = await getBudgetsSummary(selectedMonth.value);
  
  if (result.success) {
    budgetsSummary.value = result.data;
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
};

// Crear presupuesto
const handleCreateBudget = async () => {
  if (!newBudget.value.categoryId || !newBudget.value.limit) {
    error.value = 'Por favor completa todos los campos';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const category = availableCategories.value.find(
      (c) => c.id === newBudget.value.categoryId
    );

    const result = await createBudget({
      categoryId: newBudget.value.categoryId,
      categoryName: category?.name || 'Sin nombre',
      limit: newBudget.value.limit,
      month: selectedMonth.value,
    });

    if (result.success) {
      success.value = true;
      successMessage.value = `Presupuesto para ${category?.name} creado`;
      
      // Limpiar formulario
      newBudget.value = {
        categoryId: '',
        limit: null,
      };

      // Recargar
      await loadBudgetsSummary();
      emit('budget-created', result.data);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = 'Error inesperado: ' + err.message;
  } finally {
    loading.value = false;
  }
};

// Eliminar presupuesto
const handleDeleteBudget = async (budgetId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await deleteBudget(budgetId);

    if (result.success) {
      success.value = true;
      successMessage.value = 'Presupuesto eliminado';
      await loadBudgetsSummary();
      emit('budget-deleted', budgetId);
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
.budgets-manager {
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

.month-selector {
  margin-bottom: 25px;
  max-width: 200px;
}

.month-selector .form-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.create-form {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-select,
.form-control {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.form-select:focus,
.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.budgets-list {
  margin-top: 30px;
}

.empty-message {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #999;
}

.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.budget-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.budget-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.budget-card.exceeded {
  border-color: #dc3545;
  background: #fff5f5;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.budget-header h4 {
  color: #333;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.badge-exceeded {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.budget-progress {
  margin-bottom: 15px;
}

.progress {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.percentage {
  font-weight: 600;
  color: #333;
}

.budget-remaining {
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 14px;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn {
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .budgets-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>