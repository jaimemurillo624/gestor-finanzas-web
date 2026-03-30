const { auth } = require('../config/firebase');

/**
 * Middleware para verificar token de autenticación
 * Extrae el token del header: Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado. Token no proporcionado.',
      });
    }

    // Extraer token
    const token = authHeader.split('Bearer ')[1];

    // Verificar token con Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Adjuntar info del usuario a la request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return res.status(401).json({
      error: 'Token inválido o expirado.',
    });
  }
};

module.exports = authMiddleware;