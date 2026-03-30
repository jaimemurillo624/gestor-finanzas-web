<template>
  <div class="transactions-container">
    <div class="transactions-header">
      <h2>📋 Historial de Transacciones</h2>
      <button
        class="btn btn-sm btn-outline"
        @click="showFilters = !showFilters"
      >
        🔍 {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
      </button>
    </div>

    <!-- Filtros -->
    <div v-if="showFilters" class="filters-card">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Tipo</label>
          <select v-model="filters.type" class="form-select">
            <option value="">Todos</option>
            <option value="ingreso">⬆️ Ingresos</option>
            <option value="gasto">⬇️ Gastos</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Desde</label>
          <input v-model="filters.startDate" type="date" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Hasta</label>
          <input v-model="filters.endDate" type="date" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">&nbsp;</label>
          <button class="btn btn-primary w-100" @click="applyFilters">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="loading-text">Cargando transacciones...</p>
    </div>

    <!-- Sin transacciones -->
    <div v-else-if="transactions.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No hay transacciones registradas</p>
      <small>Crea tu primera transacción para comenzar</small>
    </div>

    <!-- Lista de transacciones -->
    <div v-else class="transactions-list">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="transaction-item"
      >
        <div class="transaction-icon">
          {{ getCategoryIcon(transaction.category) }}
        </div>

        <div class="transaction-details">
          <div class="transaction-title">
            {{ transaction.description }}
          </div>
          <div class="transaction-meta">
            <span class="category-badge">{{ transaction.category }}</span>
            <span class="date-badge">
              {{ formatDate(transaction.date) }}
            </span>
          </div>
        </div>

        <div class="transaction-amount" :class="transaction.type">
          {{ transaction.type === 'ingreso' ? '+' : '-' }}
          ${{ transaction.amount.toFixed(2) }}
        </div>

        <div class="transaction-actions">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="editTransaction(transaction)"
            title="Editar"
          >
            ✏️
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            @click="deleteTransaction(transaction.id)"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="transactions.length > 0" class="summary-card">
      <div class="summary-row">
        <span>📊 Ingresos Totales:</span>
        <span class="amount income">
          +${{ calculateTotal('ingreso').toFixed(2) }}
        </span>
      </div>
      <div class="summary-row">
        <span>💸 Gastos Totales:</span>
        <span class="amount expense">
          -${{ calculateTotal('gasto').toFixed(2) }}
        </span>
      </div>
      <div class="summary-row total">
        <span>💰 Balance:</span>
        <span
          class="amount"
          :class="balance >= 0 ? 'positive' : 'negative'"
        >
          {{ balance >= 0 ? '+' : '' }}${{ balance.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getTransactions } from '../services/transactionsService';

const emit = defineEmits(['edit-transaction', 'refresh-needed']);

// Estados reactivos
const transactions = ref([]);
const loading = ref(false);
const showFilters = ref(false);

const filters = ref({
  type: '',
  startDate: '',
  endDate: '',
});

// Cargar transacciones
onMounted(async () => {
  await loadTransactions();
});

// Cargar transacciones de la API
const loadTransactions = async () => {
  loading.value = true;
  const result = await getTransactions();
  
  if (result.success) {
    transactions.value = result.data;
  }
  
  loading.value = false;
};

// Aplicar filtros
const applyFilters = async () => {
  loading.value = true;
  
  const filterParams = {};
  if (filters.value.type) filterParams.type = filters.value.type;
  if (filters.value.startDate) filterParams.startDate = filters.value.startDate;
  if (filters.value.endDate) filterParams.endDate = filters.value.endDate;

  const result = await getTransactions(filterParams);
  
  if (result.success) {
    transactions.value = result.data;
  }
  
  loading.value = false;
};

// Editar transacción
const editTransaction = (transaction) => {
  emit('edit-transaction', transaction);
};

// Eliminar transacción
const deleteTransaction = async (transactionId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
    return;
  }
  
  emit('refresh-needed');
};

// Formatear fecha
const formatDate = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Obtener icono de categoría
const getCategoryIcon = (category) => {
  const icons = {
    'Comida': '🍔',
    'Transporte': '🚗',
    'Entretenimiento': '🎬',
    'Salud': '🏥',
    'Educación': '📚',
    'Compras': '🛍️',
    'Servicios': '🔧',
    'Viajes': '✈️',
    'Suscripciones': '📱',
    'Otro': '📌',
  };
  return icons[category] || '📌';
};

// Calcular totales
const calculateTotal = (type) => {
  return transactions.value
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
};

const balance = computed(() => {
  const income = calculateTotal('ingreso');
  const expenses = calculateTotal('gasto');
  return income - expenses;
});
</script>

<style scoped>
/* Contenedor principal con fondo oscuro */
.transactions-container {
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  min-height: 100vh;
  transition: background 0.3s ease;
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.transactions-header h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;
}

.btn-outline {
  background-color: rgba(102, 126, 234, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Tarjeta de filtros con fondo oscuro */
.filters-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-label {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.form-select, .form-control {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-select:focus, .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.form-select option {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* Estado vacío */
.empty-state {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.empty-state small {
  color: var(--text-secondary);
}

/* Lista de transacciones */
.transactions-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
  flex-wrap: wrap;
  gap: 10px;
}

.transaction-item:hover {
  background-color: var(--hover-bg);
  transform: translateX(5px);
  cursor: pointer;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  font-size: 32px;
  margin-right: 15px;
  min-width: 45px;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.transaction-details {
  flex: 1;
  min-width: 150px;
}

.transaction-title {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 5px;
  transition: color 0.3s ease;
  font-size: 16px;
}

.transaction-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-badge {
  display: inline-block;
  background: var(--hover-bg);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.date-badge {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 3px;
  transition: color 0.3s ease;
}

.transaction-amount {
  font-weight: 700;
  font-size: 18px;
  min-width: 130px;
  text-align: right;
  margin-right: 15px;
}

.transaction-amount.ingreso {
  color: #28a745;
  text-shadow: 0 0 8px rgba(40, 167, 69, 0.3);
}

.transaction-amount.gasto {
  color: #dc3545;
  text-shadow: 0 0 8px rgba(220, 53, 69, 0.3);
}

.transaction-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-outline-primary {
  border: 1px solid #667eea;
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.btn-outline-primary:hover {
  background-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.btn-outline-danger {
  border: 1px solid #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
}

/* Tarjeta de resumen */
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
  color: white;
  font-size: 16px;
}

.summary-row.total {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 12px;
  font-size: 20px;
  font-weight: 700;
}

.amount {
  font-weight: 700;
}

.amount.income {
  color: #90ee90;
}

.amount.expense {
  color: #ffcccb;
}

.amount.positive {
  color: #90ee90;
}

.amount.negative {
  color: #ffcccb;
}

/* Spinner */
.spinner-border {
  color: var(--primary-color) !important;
  width: 40px;
  height: 40px;
}

.loading-text {
  color: var(--text-secondary);
  margin-top: 15px;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .transactions-container {
    padding: 10px;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .transaction-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .transaction-details {
    width: 100%;
  }
  
  .transaction-amount {
    margin-right: 0;
    text-align: left;
    width: 100%;
    font-size: 20px;
  }
  
  .transaction-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .transactions-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .transactions-header h2 {
    text-align: center;
  }
  
  .btn-outline {
    width: 100%;
  }
  
  .filters-card .row {
    gap: 15px;
  }
  
  .filters-card .col-md-3 {
    width: 100%;
  }
  
  .summary-card {
    margin-top: 15px;
  }
  
  .summary-row {
    font-size: 14px;
  }
  
  .summary-row.total {
    font-size: 18px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.transaction-item {
  animation: fadeIn 0.3s ease-out;
}

.transactions-list {
  animation: fadeIn 0.4s ease-out;
}
</style>