const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const emailService = require("../services/emailService");
const exportService = require("../services/exportService");

router.use(authenticateToken);

router.post("/enviar_confirmacao_pedido", async (req, res) => {
  try {
    const { pedido_id } = req.body;

    if (!pedido_id) {
      return res.status(400).json({
        success: false,
        error: "ID do pedido é obrigatório",
      });
    }

    const result = await emailService.sendOrderConfirmation(pedido_id);
    res.status(200).json({
      success: true,
      message: "E-mail de confirmação enviado com sucesso.",
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao enviar e-mail.",
        error: error.message,
      });
  }
});

// Rota para exportar pedidos
router.get("/exportar-pedido/:pedido_id", async (req, res) => {
  try {
    const { pedido_id } = req.params;

    if (!pedido_id) {
      return res.status(400).json({
        success: false,
        error: "ID do pedido é obrigatório",
      });
    }
    const cvsData = await exportService.exportPedidosToCSV(pedido_id);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pedido-${pedido_id}.csv"`
    );

    res.send(csv);
  } catch (error) {
    console.error("Erro ao exportar pedido:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao exportar pedido para CSV",
      message: error.message,
    });
  }
});

router.post("/exportar-relatorio-pedidos", async (req, res) => {
  try {
    const { data_inicio, data_fim, status } = req.body;

    const csv = await exportService.exportarRelatorioPedidos({
      data_inicio,
      data_fim,
      status,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="relatorio-pedidos-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );

    res.send(csv);
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao exportar relatório de pedidos",
      message: error.message,
    });
  }
});

// Serviço de notificações (genérico)
router.post("/enviar-notificacao", async (req, res) => {
  try {
    const { tipo, destinatario, mensagem } = req.body;

    // Validação básica
    if (!tipo || !destinatario || !mensagem) {
      return res.status(400).json({
        success: false,
        error: "Tipo, destinatário e mensagem são obrigatórios",
      });
    }

    // Logica para enviar notificação por WhatsApp, SMS, etc.
    console.log(`Notificação ${tipo} enviada para: ${destinatario}`, mensagem);

    res.status(200).json({
      success: true,
      message: "Notificação enviada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao enviar notificação",
      message: error.message,
    });
  }
});

module.exports = router;
