import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

export const useOnline = () => {
  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  const handleOnline = () => {
    isOnline.value = true;
    console.log('✅ Conectado a internet');
  };

  const handleOffline = () => {
    isOnline.value = false;
    console.log('❌ Sin conexión a internet');
  };

  return {
    isOnline,
  };
};