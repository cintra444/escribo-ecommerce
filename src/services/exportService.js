const supabase = require("../config/supabase");

class ExportService {
  async exportPedidosToCSV() {
    try {
      const { data: pedidos, error } = await supabase
        .from("detalhes_pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (error) throw error;

      //buscar itens do pedido
      const { data: itens, error: itensError } = await supabase
        .from("itens_pedido")
        .select(
          `
                    qtde,
                    preco_unitario,
                    produto(nome),
                    subtotal
            `
        )
        .eq("pedido_id", pedidoId);

      if (itensError) throw itensError;

      //gerar CSV
      let csv = `Pedido #${pedido.id}\n`;
      cvs += `Cliente: ${pedido.nome_cliente}\n`;
      cvs += `Email: ${pedido.email_cliente}\n`;
      cvs += `Data: ${pedido.data_pedido}\n`;
      cvs += `Total: ${pedido.valor_total}\n\n`;
      csv += `Produto,Quantidade,Preço Unitário,Subtotal\n`;

      itens.forEach((item) => {
        csv += `${item.produto.nome},${item.qtde},${item.preco_unitario},${item.subtotal}\n`;
      });
      return csv;
    } catch (error) {
      console.error("Erro ao exportar pedidos:", error);
      throw error;
    }
  }
}

module.exports = new ExportService();
