<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <h1>🔐 Iniciar Sesión</h1>
        <p>Gestor de Finanzas Personales</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button
          type="button"
          class="btn-close"
          @click="error = ''"
        ></button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label">📧 Correo Electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-control"
            placeholder="correo@ejemplo.com"
            required
            :disabled="loading"
          />
        </div>

        <!-- Contraseña -->
        <div class="mb-3">
          <label for="password" class="form-label">🔐 Contraseña</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-control"
            placeholder="Tu contraseña"
            required
            :disabled="loading"
          />
        </div>

        <!-- Botón Login -->
        <button
          type="submit"
          class="btn btn-primary w-100 mb-3"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Iniciando sesión...' : 'Inicia Sesión' }}
        </button>
      </form>

      <!-- Link a Register -->
      <div class="text-center">
        <p class="mb-0">
          ¿No tienes cuenta?
          <router-link to="/register" class="link-primary fw-bold">
            Regístrate aquí
          </router-link>
        </p>
      </div>

      <!-- Demo Info -->
      <div class="alert alert-info mt-3" role="alert">
        <small>
          💡 <strong>Produccion:</strong> Prueba con cualquier email y contraseña (mín. 6 caracteres)
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/authService';

const router = useRouter();

// Estados reactivos
const formData = ref({
  email: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

// Manejador de login
const handleLogin = async () => {
  if (!formData.value.email || !formData.value.password) {
    error.value = 'Por favor completa todos los campos';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await login(
      formData.value.email,
      formData.value.password
    );

    if (result.success) {
      // Guardar token en localStorage (opcional, ya Firebase lo maneja)
      localStorage.setItem('authToken', result.token);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      // Mensajes de error amigables
      if (result.error.includes('user-not-found')) {
        error.value = 'El usuario no existe';
      } else if (result.error.includes('wrong-password')) {
        error.value = 'Contraseña incorrecta';
      } else {
        error.value = result.error || 'Error al iniciar sesión';
      }
    }
  } catch (err) {
    error.value = 'Error inesperado: ' + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 5px;
  font-weight: 700;
}

.card-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.form-control {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: transform 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.link-primary {
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-primary:hover {
  text-decoration: underline;
}

.alert-info {
  border-radius: 8px;
  border: none;
  background: #e7f3ff;
  color: #004085;
}
</style>