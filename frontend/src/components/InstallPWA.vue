<template>
  <div v-if="showPrompt" class="install-banner">
    <div class="banner-content">
      <div class="banner-icon">📱</div>
      <div class="banner-text">
        <h4>Instala nuestra app</h4>
        <p>Accede rápidamente desde tu dispositivo</p>
      </div>
      <div class="banner-actions">
        <button class="btn btn-sm btn-primary" @click="installApp">
          Instalar
        </button>
        <button class="btn btn-sm btn-secondary" @click="dismissPrompt">
          Más tarde
        </button>
      </div>
      <button class="btn-close" @click="dismissPrompt"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showPrompt = ref(false);
let deferredPrompt = null;

onMounted(() => {
  // Escuchar el evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar el banner si no fue descartado
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (!dismissed) {
      showPrompt.value = true;
    }
  });

  // Escuchar si la app fue instalada
  window.addEventListener('appinstalled', () => {
    console.log('PWA instalada');
    deferredPrompt = null;
    showPrompt.value = false;
    localStorage.removeItem('installPromptDismissed');
  });
});

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar');
    } else {
      console.log('Usuario rechazó instalar');
    }
    
    deferredPrompt = null;
    showPrompt.value = false;
  }
};

const dismissPrompt = () => {
  showPrompt.value = false;
  localStorage.setItem('installPromptDismissed', 'true');
};
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 9999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  position: relative;
}

.banner-icon {
  font-size: 32px;
  min-width: 40px;
  text-align: center;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.banner-text p {
  margin: 5px 0 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
}

.btn-primary:hover {
  background: #f0f0f0;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  width: auto;
  height: auto;
}

.btn-close:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .install-banner {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .banner-content {
    flex-wrap: wrap;
    padding: 12px 15px;
  }

  .banner-actions {
    width: 100%;
    margin-top: 10px;
  }

  .btn {
    flex: 1;
  }
}
</style>