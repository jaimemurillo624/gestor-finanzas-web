<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- ✅ NUEVO: Indicador de estado online/offline -->
    <OnlineStatus />
    
    <!-- Banner de instalación PWA -->
    <InstallPWA />
    
    <!-- Router -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import InstallPWA from '@/components/InstallPWA.vue';
import OnlineStatus from '@/components/OnlineStatus.vue';

const isDarkMode = ref(false);

// Detectar cambios en el tema
const checkTheme = () => {
  const theme = localStorage.getItem('theme');
  const hasDarkAttribute = document.documentElement.hasAttribute('data-theme');
  
  isDarkMode.value = theme === 'dark' || hasDarkAttribute;
};

// Observar cambios en el tema
const observer = new MutationObserver(() => {
  checkTheme();
});

onMounted(() => {
  checkTheme();
  
  // Observar cambios en el atributo data-theme
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

// Limpiar observer al desmontar
import { onUnmounted } from 'vue';
onUnmounted(() => {
  observer.disconnect();
});
</script>

<style>
/* Variables CSS para modo claro y oscuro */
:root {
  /* Modo claro (default) */
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --hover-bg: #f0f0f0;
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.15);
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --transition: all 0.3s ease;
}

/* Modo oscuro */
[data-theme="dark"] {
  --bg-primary: #0a0e27;
  --bg-secondary: #1a1f3a;
  --text-primary: #ffffff;
  --text-secondary: #a0a8c0;
  --border-color: #2d334f;
  --hover-bg: rgba(102, 126, 234, 0.1);
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.4);
  --card-bg: rgba(26, 31, 58, 0.95);
  --input-bg: rgba(26, 31, 58, 0.8);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
}

/* Estilos globales para todos los componentes */
.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.card-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.card-body {
  color: var(--text-primary);
}

/* Formularios */
input, textarea, select {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: var(--transition);
}

input:focus, textarea:focus, select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

input::placeholder, textarea::placeholder {
  color: var(--text-secondary);
}

/* Botones */
.btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  transition: var(--transition);
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
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

.btn-success {
  background-color: var(--success-color);
  border: none;
  color: white;
}

.btn-danger {
  background-color: var(--danger-color);
  border: none;
  color: white;
}

/* Tablas */
.table {
  color: var(--text-primary);
}

.table thead th {
  background-color: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
}

.table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}

.table tbody tr:hover {
  background-color: var(--hover-bg);
}

.table td {
  color: var(--text-primary);
}

/* Modales */
.modal-content {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.modal-header {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.modal-footer {
  border-top: 1px solid var(--border-color);
}

.modal-title {
  color: var(--text-primary);
}

/* Alertas */
.alert {
  border-radius: 8px;
  border: none;
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.2);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.2);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.alert-warning {
  background-color: rgba(255, 193, 7, 0.2);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

.alert-info {
  background-color: rgba(23, 162, 184, 0.2);
  color: var(--info-color);
  border: 1px solid var(--info-color);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Utilidades */
.text-primary {
  color: var(--text-primary) !important;
}

.text-secondary {
  color: var(--text-secondary) !important;
}

.bg-primary {
  background-color: var(--bg-primary) !important;
}

.bg-secondary {
  background-color: var(--bg-secondary) !important;
}

.border-color {
  border-color: var(--border-color) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .card {
    border-radius: 8px;
  }
  
  .modal-dialog {
    margin: 10px;
  }
}
</style>