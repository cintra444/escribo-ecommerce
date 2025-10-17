const express = require("express");
const router = express.Router();

// Rota temporária
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Rotas de clientes - em desenvolvimento",
    endpoints: {
      perfil: "GET /api/clientes/perfil (em desenvolvimento)",
      atualizar: "PUT /api/clientes/perfil (em desenvolvimento)",
    },
  });
});

// Rota para obter perfil do cliente (protegida)
router.get("/perfil", (req, res) => {
  res.json({
    success: true,
    message: "Perfil do cliente - em desenvolvimento",
    data: {
      user: req.user, // O middleware auth já adiciona o user à requisição
    },
  });
});

module.exports = router;
