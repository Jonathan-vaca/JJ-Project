// Backend/middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware: autentica usuarios con token
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Formato esperado: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token no válido" });
  }

  try {
    const decoded = jwt.verify(token, "secreto_jwt"); // misma clave usada en login
    req.user = decoded; // guardamos usuario en req.user
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
}

// Middleware: solo admin puede continuar
function authorizeAdmin(req, res, next) {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Solo admin." });
  }
  next();
}

module.exports = { authenticate, authorizeAdmin };
