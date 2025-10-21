const { supabase, supabaseAdmin } = require("../config/supabase");

class PedidosController {
  async criarPedido(req, res) {
    try {
      const { itens, endereco_envio, metodo_pgto } = req.body;
      const user_id = req.user.id;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          sucess: false,
          error: "Itens do pedido são obrigatórios",
        });
      }

      if (!endereco_envio || !metodo_pgto) {
        return res.status(400).json({
          sucess: false,
          error: "Endereço de envio e o metodo de pagamento são obrigatórios",
        });
      }

      //buscar cliente pelo user_id
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (clienteError) {
        console.error("Erro ao buscar cliente:", clienteError);
        return res.status(404).json({
          success: false,
          error: "Cliente não encontrado",
        });
      }

      // Verificar estoque e calcular total
      let valor_total = 0;
      for (const item of itens) {
        const { data: produto, error: produtoError } = await supabase
          .from("produtos")
          .select("preco, qtde_estoque")
          .eq("id", item.produto_id)
          .single();

        if (produtoError || !produto) {
          throw new Error(`Produto ${item.produto_id} não encontrado`);
        }

        if (produto.qtde_estoque < item.qtde) {
          throw new Error(
            `Estoque insuficiente para o produto ${item.produto_id}`
          );
        }

        // Usar preço atual do produto para evitar inconsistências
        item.preco_unitario = produto.preco;
        valor_total += produto.preco * item.qtde;
      }
      //gerar numero do pedido
      const numero_pedido = `PED-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      //criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: cliente.id,
          numero_pedido,
          endereco_envio,
          metodo_pgto,
          valor_total,
          status: "pendente",
          status_pgto: "pendente",
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      //adicionar itens ao pedido
      const itensPedidos = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        qtde: item.qtde,
        preco_unitario: item.preco_unitario,
        subtotal: item.qtde * item.preco_unitario,
      }));

      const { error: itensError } = await supabase
        .from("itens_pedido")
        .insert(itensPedidos);

      if (itensError) throw itensError;

      // Atualizar estoque dos produtos
      for (const item of itens) {
        const { error: updateError } = await supabase
          .from("produtos")
          .update({
            qtde_estoque: supabase.rpc("decrement", {
              table_name: "produtos",
              id: item.produto_id,
              column: "qtde_estoque",
              amount: item.qtde,
            }),
          })
          .eq("id", item.produto_id);

        if (updateError) throw updateError;
      }

      //buscar o pedido completo com itens
      const { data: pedidoCompleto, error: pedidoCompletoError } =
        await supabase
          .from("pedidos")
          .select(
            `*,clientes(nome_completo, email),
          itens_pedido(
            qtde,
            preco_unitario,
            subtotal,
            produtos(nome_produto, descricao)
          )
        `
          )
          .eq("id", pedido.id)
          .single();

      if (pedidoCompletoError) throw pedidoCompletoError;

      res.status(201).json({
        success: true,
        message: "Pedido criado com sucesso",
        data: pedidoCompleto,
      });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      res.status(500).json({
        sucess: false,
        error: "Erro ao criar pedido",
      });
    }
  }

  //listar pedidos do cliente
  async listarPedidos(req, res) {
    try {
      const user_id = req.user.id;
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Primeiro buscar o cliente_id
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (clienteError) {
        return res.status(404).json({
          success: false,
          error: "Cliente não encontrado",
        });
      }

      const {
        data: pedidos,
        error: pedidosError,
        count,
      } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          itens_pedido(
            qtde,
            preco_unitario,
            subtotal,
            produtos(nome_produto', descricao')
          )
        `,
          { count: "exact" }
        )
        .eq("cliente_id", cliente.id)
        .order("criado_em", { ascending: false })
        .range(from, to);

      if (pedidosError) throw pedidosError;

      res,
        json({
          sucess: true,
          data: pedidos,
          paginacao: {
            pagina: page,
            limite: limit,
            totalItens: count,
            totalPaginas: Math.ceil(count / limit),
            hasNext: to + 1 < count,
            hasPrev: page > 1,
          },
        });
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      res.status(500).json({
        sucess: false,
        error: "Erro ao listar pedidos",
        message: error.message,
      });
    }
  }

  //buscar pedido por id
  async buscarPedidoPorId(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Buscar cliente
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (clienteError) {
        return res.status(404).json({
          success: false,
          error: "Cliente não encontrado",
        });
      }

      // Buscar pedido específico
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          clientes(nome_completo, email, telefone),
          itens_pedido(
            qtde,
            preco_unitario,
            subtotal,
            produtos(nome_produto)
          )
        `
        )
        .eq("id", id)
        .eq("cliente_id", cliente.id)
        .single();

      if (pedidoError) {
        if (pedidoError.code === "PGRST116") {
          return res.status(404).json({
            success: false,
            error: "Pedido não encontrado",
          });
        }
        throw pedidoError;
      }

      res.json({
        success: true,
        data: pedido,
      });
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar pedido",
      });
    }
  }
}

module.exports = new PedidosController();
