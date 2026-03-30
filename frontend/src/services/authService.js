import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Registrar un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario creado
 */
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Token y datos del usuario
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Obtener token para usar en el backend
    const token = await getIdToken(userCredential.user);
    
    return {
      success: true,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Escuchar cambios de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await getIdToken(user);
      callback({
        user: {
          uid: user.uid,
          email: user.email,
        },
        token,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Obtener el token del usuario actual
 */
export const getCurrentToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await getIdToken(user);
  }
  return null;
};