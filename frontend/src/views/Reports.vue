<template>
  <div class="reports-container">
  <!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <span class="navbar-brand">📊 Reportes</span>
    <div class="ms-auto d-flex gap-3 align-items-center">
      
      <ThemeToggle />
      <router-link to="/dashboard" class="btn btn-outline-info">
        💰 Gestor de Finanzas
      </router-link>
      <span class="text-light">👤 {{ userEmail }}</span>
      
      
      
      <button class="btn btn-outline-light" @click="handleLogout">
        Cerrar Sesión
      </button>
    </div>
  </div>
</nav>
   

    <!-- Contenido -->
    <div class="container-fluid mt-5">
      <!-- Tabs de navegación -->
      <ul class="nav nav-tabs mb-4" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="charts-tab" data-bs-toggle="tab" data-bs-target="#charts-panel" type="button">
      📊 Gráficas
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="budgets-tab" data-bs-toggle="tab" data-bs-target="#budgets-panel" type="button">
      💼 Presupuestos
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories-panel" type="button">
      🏷️ Categorías
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="export-tab" data-bs-toggle="tab" data-bs-target="#export-panel" type="button">
      📥 Exportar
    </button>
  </li>
</ul>

<div class="tab-content">
  <div class="tab-pane fade show active" id="charts-panel" role="tabpanel">
    <ChartsSection :refreshKey="chartsRefreshKey" />
  </div>

  <!-- ✅ NUEVO: Panel de Presupuestos -->
  <div class="tab-pane fade" id="budgets-panel" role="tabpanel">
    <BudgetsManager
      @budget-created="onBudgetCreated"
      @budget-deleted="onBudgetDeleted"
    />
  </div>

  <div class="tab-pane fade" id="categories-panel" role="tabpanel">
    <CategoriesManager
      @category-created="onCategoryCreated"
      @category-deleted="onCategoryDeleted"
    />
  </div>

  <div class="tab-pane fade" id="export-panel" role="tabpanel">
    <ExportData />
  </div>
</div>

      <!-- Panel de Gráficas -->
      <div class="tab-content">
        <div class="tab-pane fade show active" id="charts-panel" role="tabpanel">
          <ChartsSection :refreshKey="chartsRefreshKey" />
        </div>

        <!-- Panel de Categorías -->
        <div class="tab-pane fade" id="categories-panel" role="tabpanel">
          <CategoriesManager
            @category-created="onCategoryCreated"
            @category-deleted="onCategoryDeleted"
          />
        </div>

        <!-- Panel de Exportación -->
        <div class="tab-pane fade" id="export-panel" role="tabpanel">
          <ExportData />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '../services/authService';
import { auth } from '../services/firebaseConfig';
import ChartsSection from '../components/ChartsSection.vue';
import CategoriesManager from '../components/CategoriesManager.vue';
import ExportData from '../components/ExportData.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import BudgetsManager from '../components/BudgetsManager.vue';

const router = useRouter();
const userEmail = ref('');
const chartsRefreshKey = ref(0);

const onBudgetCreated = () => {
  chartsRefreshKey.value += 1;
};

const onBudgetDeleted = () => {
  chartsRefreshKey.value += 1;
};

onMounted(() => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;
  }
});

const onCategoryCreated = () => {
  chartsRefreshKey.value += 1;
};

const onCategoryDeleted = () => {
  chartsRefreshKey.value += 1;
};

const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    localStorage.removeItem('authToken');
    router.push('/login');
  }
};
</script>

<style scoped>
.reports-container {
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* Si quieres un fondo degradado para mejor efecto */
.reports-container {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  min-height: 100vh;
  transition: background 0.3s ease;
}

/* O si quieres un fondo más oscuro específico para el dashboard */
.reports-container {
  background-color: var(--dashboard-bg, var(--bg-primary));
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* También puedes agregar un fondo con imagen sutil */
.reports-container {
  background-color: var(--bg-primary);
  background-image: radial-gradient(circle at 10% 20%, var(--primary-color) 0%, transparent 50%);
  background-attachment: fixed;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 700;
}

.nav-tabs {
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
  gap: 10px;
}

.nav-link {
  color: #666 !important;
  border: none !important;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f0f0f0;
  color: #333 !important;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .nav-tabs {
    flex-wrap: wrap;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>