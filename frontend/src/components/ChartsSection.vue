<template>
  <div class="charts-section">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p>Cargando gráficas...</p>
    </div>

    <!-- Estado sin datos -->
    <div v-else-if="transactions.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No hay transacciones para mostrar</p>
      <small>Crea algunas transacciones en el Dashboard para ver las gráficas</small>
    </div>

    <!-- Gráficas -->
    <div v-else class="charts-container">
      <!-- Gráfica 1: Pie Chart (Gastos por Categoría) -->
      <div class="chart-card">
        <h3>📊 Distribución de Gastos por Categoría</h3>
        <canvas id="chart-pie" ref="pieCanvas" style="width: 100%; height: 100%;"></canvas>
      </div>

      <!-- Gráfica 2: Bar Chart (Ingresos vs Gastos) -->
      <div class="chart-card">
        <h3>📈 Ingresos vs Gastos (Últimos 7 Días)</h3>
        <canvas id="chart-bar" ref="barCanvas" style="width: 100%; height: 100%;"></canvas>
      </div>

      <!-- Gráfica 3: Line Chart (Tendencia de Balance) -->
      <div class="chart-card full-width">
        <h3>💰 Tendencia de Balance (Últimos 30 Días)</h3>
        <canvas id="chart-line" ref="lineCanvas" style="width: 100%; height: 100%;"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { getTransactions } from '../services/transactionsService';

const props = defineProps({
  refreshKey: {
    type: Number,
    default: 0,
  },
});

const loading = ref(true);
const transactions = ref([]);
const pieCanvas = ref(null);
const barCanvas = ref(null);
const lineCanvas = ref(null);
const chartsRendered = ref(false);

// Referencias a los charts
let pieChart = null;
let barChart = null;
let lineChart = null;

// Cargar datos al montar
onMounted(async () => {
  await loadAndRenderCharts();
});

// Recargar cuando cambie refreshKey
watch(() => props.refreshKey, async () => {
  await loadAndRenderCharts();
});

const loadAndRenderCharts = async () => {
  loading.value = true;
  chartsRendered.value = false;
  
  try {
    const result = await getTransactions();
    
    console.log('Datos recibidos:', result);
    
    if (!result.success) {
      console.error('Error fetching transactions:', result.error);
      loading.value = false;
      return;
    }

    // Procesar datos
    let data = result.data || [];
    if (Array.isArray(data)) {
      transactions.value = data;
    } else if (data.transactions && Array.isArray(data.transactions)) {
      transactions.value = data.transactions;
    } else if (data.items && Array.isArray(data.items)) {
      transactions.value = data.items;
    } else {
      transactions.value = [];
    }

    console.log('Transacciones procesadas:', transactions.value);

    // Esperar a que el DOM se actualice y los canvas estén disponibles
    await nextTick();
    
    // Dar tiempo adicional para que los canvas se monten completamente
    setTimeout(() => {
      renderAllCharts();
      loading.value = false;
      chartsRendered.value = true;
    }, 200);
    
  } catch (error) {
    console.error('Error loading charts:', error);
    loading.value = false;
  }
};

const renderAllCharts = () => {
  console.log('Intentando renderizar gráficas...');
  console.log('pieCanvas:', pieCanvas.value);
  console.log('barCanvas:', barCanvas.value);
  console.log('lineCanvas:', lineCanvas.value);
  
  // Verificar que los canvas estén disponibles
  if (!pieCanvas.value || !barCanvas.value || !lineCanvas.value) {
    console.error('Canvas no disponibles, reintentando...');
    // Reintentar después de un pequeño delay
    setTimeout(() => {
      if (pieCanvas.value && barCanvas.value && lineCanvas.value) {
        renderAllCharts();
      } else {
        console.error('Canvas aún no disponibles después del reintento');
      }
    }, 100);
    return;
  }

  // Limpiar gráficas anteriores
  if (pieChart) {
    pieChart.destroy();
    pieChart = null;
  }
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }
  if (lineChart) {
    lineChart.destroy();
    lineChart = null;
  }

  renderExpensesByCategoryChart();
  renderIncomeVsExpenseChart();
  renderBalanceTrendChart();
  
  console.log('Gráficas renderizadas correctamente');
};

// ===== GRÁFICA 1: Pie Chart =====
const renderExpensesByCategoryChart = () => {
  if (!pieCanvas.value) return;
  
  const ctx = pieCanvas.value.getContext('2d');
  
  // Filtrar solo gastos
  const expenses = transactions.value.filter(t => {
    const type = (t.type || '').toLowerCase();
    return type === 'gasto' || type === 'expense';
  });

  console.log('Gastos encontrados:', expenses.length);

  if (expenses.length === 0) {
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sin gastos registrados'],
        datasets: [{
          data: [1],
          backgroundColor: ['var(--border-color)'],
          borderColor: 'var(--card-bg)',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'var(--text-primary)',
              font: { size: 12 },
            },
          },
        },
      },
    });
    return;
  }

  // Agrupar por categoría
  const categoryMap = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Sin categoría';
    categoryMap[category] = (categoryMap[category] || 0) + Number(expense.amount);
  });

  const categories = Object.keys(categoryMap);
  const amounts = Object.values(categoryMap);

  console.log('Categorías:', categories);
  console.log('Montos:', amounts);

  const colors = [
    '#FF5733', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12',
    '#E91E63', '#00BCD4', '#4CAF50', '#2196F3', '#95A5A6',
    '#FFC107', '#17A2B8', '#6F42C1', '#FD7E14', '#20C997'
  ];

  try {
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: colors.slice(0, categories.length),
            borderColor: 'var(--card-bg)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 },
              color: 'var(--text-primary)',
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
      },
    });
  } catch (error) {
    console.error('Error rendering pie chart:', error);
  }
};

// ===== GRÁFICA 2: Bar Chart =====
const renderIncomeVsExpenseChart = () => {
  if (!barCanvas.value) return;
  
  const ctx = barCanvas.value.getContext('2d');
  
  const last7Days = getLast7Days();
  
  const incomeByDay = {};
  const expenseByDay = {};

  last7Days.forEach(day => {
    incomeByDay[day] = 0;
    expenseByDay[day] = 0;
  });

  transactions.value.forEach(transaction => {
    const transactionDate = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : null;
    const type = (transaction.type || '').toLowerCase();
    
    if (transactionDate && last7Days.includes(transactionDate)) {
      if (type === 'ingreso' || type === 'income') {
        incomeByDay[transactionDate] += Number(transaction.amount);
      } else if (type === 'gasto' || type === 'expense') {
        expenseByDay[transactionDate] += Number(transaction.amount);
      }
    }
  });

  const incomeData = last7Days.map(day => incomeByDay[day]);
  const expenseData = last7Days.map(day => expenseByDay[day]);

  console.log('Ingresos por día:', incomeData);
  console.log('Gastos por día:', expenseData);

  try {
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: last7Days.map(day => formatDate(day)),
        datasets: [
          {
            label: 'Ingresos',
            data: incomeData,
            backgroundColor: '#28a745',
            borderRadius: 4,
          },
          {
            label: 'Gastos',
            data: expenseData,
            backgroundColor: '#dc3545',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'var(--border-color)',
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              },
              color: 'var(--text-secondary)',
            },
          },
          x: {
            grid: {
              color: 'var(--border-color)',
            },
            ticks: {
              color: 'var(--text-secondary)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'var(--text-primary)',
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
      },
    });
  } catch (error) {
    console.error('Error rendering bar chart:', error);
  }
};

// ===== GRÁFICA 3: Line Chart =====
const renderBalanceTrendChart = () => {
  if (!lineCanvas.value) return;
  
  const ctx = lineCanvas.value.getContext('2d');
  
  const last30Days = getLast30Days();
  
  // Ordenar transacciones por fecha
  const sortedTransactions = [...transactions.value].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  
  const balanceByDay = {};
  let runningBalance = 0;

  // Inicializar todos los días con 0
  last30Days.forEach(day => {
    balanceByDay[day] = 0;
  });

  // Calcular balance acumulado día por día
  last30Days.forEach(day => {
    const dayTransactions = sortedTransactions.filter(t => {
      const transactionDate = t.date ? new Date(t.date).toISOString().split('T')[0] : null;
      return transactionDate === day;
    });

    dayTransactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      if (type === 'ingreso' || type === 'income') {
        runningBalance += Number(t.amount);
      } else if (type === 'gasto' || type === 'expense') {
        runningBalance -= Number(t.amount);
      }
    });

    balanceByDay[day] = runningBalance;
  });

  const balanceData = last30Days.map(day => balanceByDay[day]);

  console.log('Balance por día:', balanceData);

  try {
    lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last30Days.map((day, index) => {
          if (index % 5 === 0) return formatDate(day);
          return '';
        }),
        datasets: [
          {
            label: 'Balance Acumulado',
            data: balanceData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#667eea',
            pointBorderColor: 'var(--card-bg)',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'var(--border-color)',
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              },
              color: 'var(--text-secondary)',
            },
          },
          x: {
            grid: {
              color: 'var(--border-color)',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              color: 'var(--text-secondary)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'var(--text-primary)',
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Balance: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
      },
    });
  } catch (error) {
    console.error('Error rendering line chart:', error);
  }
};

// ===== FUNCIONES AUXILIARES =====

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};
</script>

<style scoped>
/* Variables CSS locales */
.charts-section {
  padding: 20px 0;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.loading-state p {
  margin-top: 15px;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  color: var(--text-secondary);
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

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.chart-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--shadow);
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.chart-card.full-width {
  grid-column: 1 / -1;
  min-height: 450px;
}

.chart-card h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.chart-card canvas {
  flex: 1;
  width: 100% !important;
  height: auto !important;
  min-height: 300px;
}

/* Animación de carga */
.spinner-border {
  color: var(--primary-color) !important;
  width: 40px;
  height: 40px;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-section {
    padding: 10px;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .chart-card {
    min-height: 350px;
    padding: 15px;
  }

  .chart-card.full-width {
    min-height: 400px;
  }
  
  .chart-card h3 {
    font-size: 16px;
  }
}

/* Animación de entrada */
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

.chart-card {
  animation: fadeInUp 0.4s ease-out;
}

.charts-container > .chart-card:nth-child(1) {
  animation-delay: 0s;
}

.charts-container > .chart-card:nth-child(2) {
  animation-delay: 0.1s;
}

.charts-container > .chart-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>