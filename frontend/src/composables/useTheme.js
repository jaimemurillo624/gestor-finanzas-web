import { ref, watch, onMounted } from 'vue';

const isDark = ref(false);

export const useTheme = () => {
  // Cargar tema guardado
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDark.value = true;
      applyTheme('dark');
    } else {
      isDark.value = false;
      applyTheme('light');
    }
  });

  // Observar cambios
  watch(isDark, (newValue) => {
    const theme = newValue ? 'dark' : 'light';
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  });

  // Aplicar tema al documento
  const applyTheme = (theme) => {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.setAttribute('data-bs-theme', 'dark');
      html.setAttribute('data-theme', 'dark');
      html.style.colorScheme = 'dark';
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      html.setAttribute('data-bs-theme', 'light');
      html.removeAttribute('data-theme');
      html.style.colorScheme = 'light';
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  };

  // Toggle del tema
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // Obtener tema actual
  const getCurrentTheme = () => {
    return isDark.value ? 'dark' : 'light';
  };

  return {
    isDark,
    toggleTheme,
    getCurrentTheme,
  };
};