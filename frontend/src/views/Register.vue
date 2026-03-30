<template>
  <div class="register-container">
    <div class="register-card">
      <div class="card-header">
        <h1>📝 Crear Cuenta</h1>
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

      <!-- Mensaje de éxito -->
      <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
        ✅ Cuenta creada exitosamente. Redirigiendo...
        <button
          type="button"
          class="btn-close"
          @click="success = false"
        ></button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleRegister">
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
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
            :disabled="loading"
          />
        </div>

        <!-- Confirmar Contraseña -->
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">🔐 Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            class="form-control"
            placeholder="Repite tu contraseña"
            required
            minlength="6"
            :disabled="loading"
          />
          <small v-if="passwordMismatch" class="text-danger">
            Las contraseñas no coinciden
          </small>
        </div>

        <!-- Botón Registrarse -->
        <button
          type="submit"
          class="btn btn-primary w-100 mb-3"
          :disabled="loading || passwordMismatch"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <!-- Link a Login -->
      <div class="text-center">
        <p class="mb-0">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="link-primary fw-bold">
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/authService';

const router = useRouter();

// Estados reactivos
const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

// Computed: Verificar si las contraseñas coinciden
const passwordMismatch = computed(() => {
  return (
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.password !== formData.value.confirmPassword
  );
});

// Manejador de registro
const handleRegister = async () => {
  // Validación
  if (!formData.value.email || !formData.value.password) {
    error.value = 'Por favor completa todos los campos';
    return;
  }

  if (passwordMismatch.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await register(
      formData.value.email,
      formData.value.password
    );

    if (result.success) {
      success.value = true;
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      error.value = result.error || 'Error al registrarse';
    }
  } catch (err) {
    error.value = 'Error inesperado: ' + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
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

.text-danger {
  display: block;
  margin-top: 5px;
}

.link-primary {
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>