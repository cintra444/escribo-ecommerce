const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const pedidosController = require("../controllers/pedidosController");

router.use(authenticateToken);

router.post("/", pedidosController.criarPedido);
router.get("/", pedidosController.listarPedidos);
router.get("/:id", pedidosController.buscarPedidoPorId);

module.exports = router;
