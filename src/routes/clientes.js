const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { supabase } = require("../config/supabase");

router.use(authenticateToken);

router.get("/perfil", async (req, res) => {
  try {
    const user_id = req.user.id;

    // Buscar dados do cliente
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome_completo, email, telefone, endereco, created_at")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(404).json({
        success: false,
        error: "Perfil do cliente não encontrado",
      });
    }

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: "Cliente não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Perfil encontrado com sucesso",
      data: cliente,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno ao buscar perfil",
      message: error.message,
    });
  }
});

// Atualizar perfil do cliente
router.put("/perfil", async (req, res) => {
  try {
    const user_id = req.user.id;
    const { nome_completo, telefone, endereco } = req.body;

    // Validação básica
    if (!nome_completo && !telefone && !endereco) {
      return res.status(400).json({
        success: false,
        error: "Pelo menos um campo deve ser fornecido para atualização",
      });
    }

    // Preparar dados para atualização
    const updates = {};
    if (nome_completo) updates.nome_completo = nome_completo;
    if (telefone) updates.telefone = telefone;
    if (endereco) updates.endereco = endereco;
    updates.updated_at = new Date().toISOString();

    // Atualizar cliente
    const { data: cliente, error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("user_id", user_id)
      .select("id, nome_completo, email, telefone, endereco, updated_at")
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return res.status(400).json({
        success: false,
        error: "Erro ao atualizar perfil",
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: cliente,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno ao atualizar perfil",
      message: error.message,
    });
  }
});

//Listar pedidos do cliente
router.get("/pedidos", async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const from = (pageNum - 1) * limitNum;

    // Buscar cliente_id primeiro
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({
        success: false,
        error: "Cliente não encontrado",
      });
    }

    // Buscar pedidos do cliente
    const {
      data: pedidos,
      error: pedidosError,
      count,
    } = await supabase
      .from("pedidos")
      .select(
        `
        id,
        numero_pedido,
        status,
        valor_total,
        status_pgto,
        created_at,
        itens_pedido(
          qtde,
          preco_unitario,
          subtotal,
          produtos(nome_produto)
        )
      `,
        { count: "exact" }
      )
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false })
      .range(from, from + limitNum - 1);

    if (pedidosError) {
      throw pedidosError;
    }

    res.json({
      success: true,
      data: pedidos || [],
      paginacao: {
        pagina: pageNum,
        limite: limitNum,
        totalItens: count,
        totalPaginas: Math.ceil(count / limitNum),
        hasNext: from + limitNum < count,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao listar pedidos do cliente:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno ao listar pedidos",
      message: error.message,
    });
  }
});

// Rota raiz - informações da API de clientes
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Clientes - Ecommerce Backend",
    version: "1.0.0",
    endpoints: {
      perfil: {
        method: "GET",
        path: "/api/clientes/perfil",
        description: "Obter perfil do cliente autenticado",
        authentication: "Obrigatório",
      },
      atualizar_perfil: {
        method: "PUT",
        path: "/api/clientes/perfil",
        description: "Atualizar perfil do cliente",
        authentication: "Obrigatório",
        body: {
          nome: "string (opcional)",
          telefone: "string (opcional)",
          endereco: "object (opcional)",
        },
      },
      pedidos: {
        method: "GET",
        path: "/api/clientes/pedidos",
        description: "Listar pedidos do cliente",
        authentication: "Obrigatório",
        query: {
          page: "number (opcional, padrão: 1)",
          limit: "number (opcional, padrão: 10, máximo: 50)",
        },
      },
    },
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});

module.exports = router;
