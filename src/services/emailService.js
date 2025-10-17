const supabase = require("../config/supabase");

class EmailService {
  async envioPedidoConfirmacao(pedidoId) {
    try {
      const { data: pedido, error } = await supabase
        .from("detalhes_pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (error) throw error;

      console.log("Email enviado para:", pedido.email_cliente);
      console.log("Assunto: Confirmação do Pedido #" + pedidoId);
      console.log(
        "Corpo: Obrigado por seu pedido! Detalhes do pedido:",
        pedido
      );
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  }
}
module.exports = new EmailService();
