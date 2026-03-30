<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
  >
    <span class="theme-icon">
      {{ isDark ? '☀️' : '🌙' }}
    </span>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.theme-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(20deg);
}
</style>