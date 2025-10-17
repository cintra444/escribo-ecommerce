const express = require("express");
const router = express.Router();
const produtosController = require("../controllers/produtosController");

router.get("/", produtosController.listarProdutos);
router.get("/:id", produtosController.buscarProdutoPorId);

module.exports = router;
