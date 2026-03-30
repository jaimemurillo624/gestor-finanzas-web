import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../services/firebaseConfig';

// Importar vistas
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Reports from '../views/Reports.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: {
      requiresAuth: true,
    },
  },
  // Ruta para capturar cualquier otra página no definida
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: (to) => {
      // Redirigir según estado de autenticación
      const user = auth.currentUser;
      if (user) {
        return '/dashboard';
      } else {
        return '/login';
      }
    },
    meta: {
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Guard Global: Proteger rutas y manejar redirecciones
 */
router.beforeEach((to, from) => {
  const requiresAuth = to.meta.requiresAuth;
  const user = auth.currentUser;

  // Si la ruta requiere autenticación
  if (requiresAuth) {
    if (user) {
      // Usuario autenticado, permitir acceso
      return true;
    } else {
      // No autenticado, redirigir a login
      return '/login';
    }
  } 
  // Si el usuario ya está autenticado y quiere ir a login/register
  else if (user && (to.path === '/login' || to.path === '/register')) {
    // Redirigir al dashboard
    return '/dashboard';
  }
  // Para cualquier otra ruta pública, permitir acceso
  else {
    return true;
  }
});

export default router;