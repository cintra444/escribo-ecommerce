const { json } = require("express");
const supabase = require("../config/supabase");

class PedidosController {
  async criarPedido(req, res) {
    try {
      const { itens, endereco_envio, metodo_pgto } = req.body;
      const user_id = req.user.id;

      //buscar cliente pelo user_id
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (clienteError) throw clienteError;

      //gerar numero do pedido
      const numero_pedido = `PED-${Date.now()}-${Math.floor(
        Math.random().toString(36).substr(2, 9).toUpperCase()
      )}`;

      //criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: cliente.id,
          numero_pedido,
          endereco_envio,
          metodo_pgto,
          qtde_total: 0,
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      //adicionar itens ao pedido
      const itensPedidos = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: itensError } = await supabase
        .from("itens_pedido")
        .insert(itensPedidos);

      if (itensError) throw itensError;

      //buscar o pedido completo com itens
      const { data: pedidoCompleto, error: pedidoCompletoError } =
        await supabase
          .from("detalhes_pedidos")
          .select("*")
          .eq("id", pedido.id)
          .single();

      if (pedidoCompletoError) throw pedidoCompletoError;

      res.status(201).json({ pedido: pedidoCompleto });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      res.status(500).json({ error: "Erro ao criar pedido" });
    }
  }

  //listar pedidos do cliente
  async listarPedidos(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const from = (page - 1) * limit;
      const to = from + parseInt(limit) - 1;

      const { data: pedidos, error: pedidosError } = await supabase
        .from("detalhes_pedidos")
        .select("*", { count: "exact" })
        .eq("cliente_id", user_id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (pedidosError) throw pedidosError;

      res,
        json({
          pedidos,
          pagination: {
            page: parseInt(page),
            totalPaginas: Math.ceil(pedidos.length / limit),
            totalPedidos: pedidos.length,
            total: count,
          },
        });
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      res.status(500).json({ error: "Erro ao listar pedidos" });
    }
  }
}

module.exports = new PedidosController();
