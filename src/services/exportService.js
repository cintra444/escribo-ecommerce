const { supabase } = require("../config/supabase");

class ExportService {
  async exportOrderToCSV(pedidoId) {
    try {
      if (!pedidoId) {
        throw new Error("ID do pedido é obrigatório");
      }

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          clientes(
            nome_completo,
            email,
            telefone
          )
        `
        )
        .eq("id", pedidoId)
        .single();

      if (pedidoError) {
        console.error("Erro ao buscar pedido:", pedidoError);
        throw new Error("Pedido não encontrado");
      }

      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }

      // Buscar itens do pedido
      const { data: itens, error: itensError } = await supabase
        .from("itens_pedido")
        .select(
          `
          qtde,
          preco_unitario,
          subtotal,
          produtos(
            nome_produto,
            descricao
          )
        `
        )
        .eq("pedido_id", pedidoId);

      if (itensError) {
        console.error("Erro ao buscar itens do pedido:", itensError);
        throw new Error("Erro ao buscar itens do pedido");
      }

      // Gerar CSV
      let csv = `Pedido #${pedido.numero_pedido}\n`;
      csv += `Cliente,${pedido.clientes.nome}\n`;
      csv += `Email,${pedido.clientes.email}\n`;
      csv += `Telefone,${pedido.clientes.telefone || "N/A"}\n`;
      csv += `Data,${new Date(pedido.criado_em).toLocaleDateString("pt-BR")}\n`;
      csv += `Status,${pedido.status}\n`;
      csv += `Total,R$ ${pedido.valor_total}\n`;
      csv += `Método de Pagamento,${pedido.metodo_pagamento}\n`;
      csv += `Status Pagamento,${pedido.status_pagamento}\n\n`;

      // Endereço de entrega
      if (pedido.endereco_envio) {
        const endereco =
          typeof pedido.endereco_envio === "string"
            ? JSON.parse(pedido.endereco_envio)
            : pedido.endereco_envio;

        csv += `Endereço de Entrega\n`;
        csv += `Rua,${endereco.rua || ""}\n`;
        csv += `Número,${endereco.numero || ""}\n`;
        csv += `Complemento,${endereco.complemento || ""}\n`;
        csv += `Bairro,${endereco.bairro || ""}\n`;
        csv += `Cidade,${endereco.cidade || ""}\n`;
        csv += `Estado,${endereco.estado || ""}\n`;
        csv += `CEP,${endereco.cep || ""}\n\n`;
      }

      csv += `Itens do Pedido\n`;
      csv += `Produto,Quantidade,Preço Unitário,Subtotal\n`;

      // Itens do pedido
      itens.forEach((item) => {
        const nomeProduto = item.produtos?.nome || "Produto não encontrado";
        const nomeProdutoSanitizado = nomeProduto
          .replace(/,/g, ";")
          .replace(/\n/g, " ");

        csv += `"${nomeProdutoSanitizado}",${item.quantidade},R$ ${item.preco_unitario},R$ ${item.subtotal}\n`;
      });

      csv += `\nResumo\n`;
      csv += `Total de Itens,${itens.length}\n`;
      csv += `Valor Total,R$ ${pedido.valor_total}\n`;

      console.log(`CSV gerado para pedido ${pedido.numero_pedido}`);
      return csv;
    } catch (error) {
      console.error("Erro ao exportar pedido para CSV:", error);
      throw new Error(`Erro ao exportar pedido: ${error.message}`);
    }
  }

  // Método adicional: Exportar relatório de pedidos
  async exportarRelatorioPedidos(filtros = {}) {
    try {
      const { data_inicio, data_fim, status } = filtros;

      let query = supabase
        .from("pedidos")
        .select(
          `
          *,
          clientes(
            nome_completo,
            email
          ),
          itens_pedido(
            qtde,
            preco_unitario,
            subtotal,
            produtos(nome_produto)
          )
        `
        )
        .order("criado_em", { ascending: false });

      if (data_inicio) {
        query = query.gte("criado_em", data_inicio);
      }

      if (data_fim) {
        query = query.lte("criado_em", data_fim);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data: pedidos, error } = await query;

      if (error) throw error;

      // Gerar CSV do relatório
      let csv = `Relatório de Pedidos\n`;
      csv += `Período,${data_inicio || "Início"} à ${data_fim || "Fim"}\n`;
      csv += `Gerado em,${new Date().toLocaleString("pt-BR")}\n\n`;

      csv += `Número Pedido,Cliente,Data,Status,Valor Total,Itens\n`;

      pedidos.forEach((pedido) => {
        const totalItens = pedido.itens_pedido.reduce(
          (sum, item) => sum + item.quantidade,
          0
        );
        csv += `"${pedido.numero_pedido}","${pedido.clientes.nome}","${new Date(
          pedido.criado_em
        ).toLocaleDateString("pt-BR")}","${pedido.status}","R$ ${
          pedido.valor_total
        }",${totalItens}\n`;
      });

      // Resumo
      csv += `\nResumo do Relatório\n`;
      csv += `Total de Pedidos,${pedidos.length}\n`;
      csv += `Valor Total,R$ ${pedidos.reduce(
        (sum, pedido) => sum + parseFloat(pedido.valor_total),
        0
      )}\n`;

      console.log(`Relatório CSV gerado com ${pedidos.length} pedidos`);
      return csv;
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      throw new Error(`Erro ao exportar relatório: ${error.message}`);
    }
  }

  // Método para formatar dados para CSV
  formatarParaCSV(dados) {
    if (Array.isArray(dados)) {
      return dados
        .map((linha) =>
          Object.values(linha)
            .map((valor) => {
              const str = String(valor || "");

              return str.includes(",") || str.includes("\n")
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(",")
        )
        .join("\n");
    }
    return String(dados);
  }
}

module.exports = new ExportService();
