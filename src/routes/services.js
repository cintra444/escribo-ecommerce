const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const emailService = require("../services/emailService");
const exportService = require("../services/exportService");

router.use(authenticateToken);

router.post("/enviar_confirmacao_pedido", async (req, res) => {
  try {
    const { pedidoId, email } = req.body;
    await emailService.enviarConfirmacaoPedido(pedidoId, email);
    res
      .status(200)
      .json({ message: "E-mail de confirmação enviado com sucesso." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erro ao enviar e-mail de confirmação.",
        error: error.message,
      });
  }
});

router.post("/exportar_pedidos", async (req, res) => {
  try {
    await exportService.exportarPedidos();
    res.status(200).json({ message: "Pedidos exportados com sucesso." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao exportar pedidos.", error: error.message });
  }
});

module.exports = router;
