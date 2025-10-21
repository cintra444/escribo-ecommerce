const express = require("express");
const router = express.Router();
const produtosController = require("../controllers/produtosController");

router.get("/", produtosController.listarProdutos);
router.get("/destaque", produtosController.buscarProdutosDestaque);
router.get("/:id", produtosController.buscarProdutoPorId);

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  produtosController.criarProduto
);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  produtosController.atualizarProduto
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  produtosController.deletarProduto
);

module.exports = router;
