const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { supabase } = require("../config/supabase");

router.use(authenticateToken);
router.use(requireAdmin);

//  Criar produto
router.post("/produtos", async (req, res) => {
  try {
    const { nome_produto, descricao, preco, qtde_estoque, categoria } =
      req.body;

    const { data: produto, error } = await supabase
      .from("produtos")
      .insert({
        nome_produto,
        descricao,
        preco,
        qtde_estoque,
        categoria,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Produto criado com sucesso",
      data: produto,
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar produto",
    });
  }
});

// Atualizar produto
router.put("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: produto, error } = await supabase
      .from("produtos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Produto atualizado com sucesso",
      data: produto,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar produto",
    });
  }
});

//Excluir produto
router.delete("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: produto, error } = await supabase
      .from("produtos")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Produto excluído com sucesso",
      data: produto,
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao excluir produto",
    });
  }
});

// Relatório de vendas
router.get("/relatorios/vendas", async (req, res) => {
  try {
    const { data: relatorio, error } = await supabase
      .from("relatorio_vendas")
      .select("*")
      .order("data_venda", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: relatorio,
    });
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar relatório de vendas",
    });
  }
});

module.exports = router;
