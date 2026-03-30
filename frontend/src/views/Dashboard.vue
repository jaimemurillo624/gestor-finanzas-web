<template>
  <div class="dashboard-container">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <span class="navbar-brand">💰 Gestor de Finanzas</span>
        <div class="ms-auto d-flex gap-3 align-items-center">
          <!-- Toggle de tema -->
          <ThemeToggle />
          
          <router-link to="/reports" class="btn btn-outline">
            📊 Reportes
          </router-link>
          <span class="user-email">👤 {{ userEmail }}</span>
          <button class="btn btn-outline" @click="handleLogout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <div class="container-fluid mt-5">
      <div class="row">
        <!-- Tarjeta de Resumen (si hay transacciones) -->
        <div v-if="summary" class="col-lg-12 mb-4">
          <div class="summary-cards">
            <div class="summary-card income">
              <div class="card-icon">📈</div>
              <div class="card-content">
                <h3>Ingresos</h3>
                <p class="card-amount">+${{ summary.totalIncome?.toFixed(2) || '0.00' }}</p>
              </div>
            </div>

            <div class="summary-card expense">
              <div class="card-icon">📉</div>
              <div class="card-content">
                <h3>Gastos</h3>
                <p class="card-amount">-${{ summary.totalExpenses?.toFixed(2) || '0.00' }}</p>
              </div>
            </div>

            <div class="summary-card balance" :class="balance >= 0 ? 'positive' : 'negative'">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <h3>Balance</h3>
                <p class="card-amount">
                  {{ balance >= 0 ? '+' : '' }}${{ balance.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Transacción -->
        <div class="col-lg-4">
          <TransactionForm
            :transactionToEdit="selectedTransaction"
            @transaction-created="onTransactionCreated"
            @transaction-updated="onTransactionUpdated"
            @transaction-deleted="onTransactionDeleted"
          />
        </div>

        <!-- Lista de Transacciones -->
        <div class="col-lg-8">
          <TransactionsList
            :key="refreshKey"
            @edit-transaction="onEditTransaction"
            @refresh-needed="refreshTransactions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '../services/authService';
import { auth } from '../services/firebaseConfig';
import { getTransactionsSummary } from '../services/transactionsService';
import TransactionForm from '../components/TransactionForm.vue';
import TransactionsList from '../components/TransactionsList.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const userEmail = ref('');
const selectedTransaction = ref(null);
const summary = ref(null);
const refreshKey = ref(0);

// Usar el composable de tema
const { isDark } = useTheme();

// Computed
const balance = computed(() => {
  if (!summary.value) return 0;
  return (summary.value.totalIncome || 0) - (summary.value.totalExpenses || 0);
});

// Cargar datos iniciales
onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;
  }

  await loadSummary();
});

// Cargar resumen
const loadSummary = async () => {
  const result = await getTransactionsSummary();
  if (result.success) {
    summary.value = result.data;
  }
};

// Cuando se crea una transacción
const onTransactionCreated = async (transaction) => {
  console.log('Transacción creada:', transaction);
  refreshTransactions();
  selectedTransaction.value = null;
  await loadSummary();
};

// Cuando se actualiza una transacción
const onTransactionUpdated = async (transaction) => {
  console.log('Transacción actualizada:', transaction);
  refreshTransactions();
  selectedTransaction.value = null;
  await loadSummary();
};

// Cuando se elimina una transacción
const onTransactionDeleted = async (transactionId) => {
  console.log('Transacción eliminada:', transactionId);
  refreshTransactions();
  selectedTransaction.value = null;
  await loadSummary();
};

// Editar transacción
const onEditTransaction = (transaction) => {
  selectedTransaction.value = transaction;
  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Refrescar lista
const refreshTransactions = () => {
  refreshKey.value += 1;
};

// Cerrar sesión
const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    localStorage.removeItem('authToken');
    router.push('/login');
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  transition: background 0.3s ease;
}

/* Navbar personalizada */
.navbar {
  background-color: var(--card-bg);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.user-email {
  color: var(--text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

/* Tarjetas de resumen */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.summary-card.income {
  border-left: 4px solid var(--success-color);
}

.summary-card.expense {
  border-left: 4px solid var(--danger-color);
}

.summary-card.balance.positive {
  border-left: 4px solid var(--success-color);
}

.summary-card.balance.negative {
  border-left: 4px solid var(--danger-color);
}

.card-icon {
  font-size: 40px;
  min-width: 60px;
  text-align: center;
}

.card-content h3 {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.card-amount {
  margin: 10px 0 0 0;
  font-size: 28px;
  font-weight: 700;
}

.income .card-amount {
  color: var(--success-color);
}

.expense .card-amount {
  color: var(--danger-color);
}

.balance.positive .card-amount {
  color: var(--success-color);
}

.balance.negative .card-amount {
  color: var(--danger-color);
}

/* Responsive */
@media (max-width: 992px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .row {
    flex-direction: column-reverse;
  }
  
  .navbar .container-fluid {
    flex-direction: column;
    gap: 15px;
  }
  
  .navbar .ms-auto {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn-outline {
    padding: 4px 12px;
    font-size: 12px;
  }
  
  .user-email {
    font-size: 12px;
  }
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card {
  animation: fadeInUp 0.4s ease-out;
}

.summary-card:nth-child(1) {
  animation-delay: 0s;
}

.summary-card:nth-child(2) {
  animation-delay: 0.1s;
}

.summary-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>