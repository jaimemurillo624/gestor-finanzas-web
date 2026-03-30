<template>
  <div v-if="!isOnline" class="offline-banner">
    <span class="offline-icon">⚠️</span>
    <span class="offline-text">Sin conexión a internet</span>
  </div>
</template>

<script setup>
import { useOnline } from '@/composables/useOnline';

const { isOnline } = useOnline();
</script>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ff6b6b;
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9998;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.offline-icon {
  font-size: 18px;
}

.offline-text {
  font-weight: 600;
  font-size: 14px;
}
</style>