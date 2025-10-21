const { supabase } = require("../config/supabase");

class EmailService {
  async sendOrderConfirmation(pedidoId) {
    try {
      if (!pedidoId) {
        return {
          success: false,
          error: "ID do pedido é obrigatório",
        };
      }

      // Buscar dados completos do pedido
      const { data: pedido, error } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          clientes(
            nome_completo,
            email,
            telefone
          ),
          itens_pedido(
            qtde,
            preco_unitario,
            subtotal,
            produtos(
              nome_produto,
              descricao
            )
          )
        `
        )
        .eq("id", pedidoId)
        .single();

      if (error) {
        console.error("Erro ao buscar pedido:", error);
        return {
          success: false,
          error: "Pedido não encontrado",
        };
      }

      if (!pedido) {
        return {
          success: false,
          error: "Pedido não encontrado",
        };
      }

      // Verificar se o cliente tem email
      if (!pedido.clientes || !pedido.clientes.email) {
        return {
          success: false,
          error: "Cliente não possui email cadastrado",
        };
      }

      // Simular envio de email (
      const emailEnviado = await this.simularEnvioEmail({
        to: pedido.clientes.email,
        subject: `Confirmação de Pedido - #${pedido.numero_pedido}`,
        pedido: pedido,
      });

      if (emailEnviado) {
        console.log(`✅ Email enviado para: ${pedido.clientes.email}`);
        console.log(`📦 Pedido: ${pedido.numero_pedido}`);
        console.log(`💰 Total: R$ ${pedido.valor_total}`);

        return {
          success: true,
          message: "Email de confirmação enviado com sucesso",
          order: {
            id: pedido.id,
            numero_pedido: pedido.numero_pedido,
            cliente: pedido.clientes.nome_completo,
            email: pedido.clientes.email,
            total: pedido.valor_total,
          },
        };
      } else {
        return {
          success: false,
          error: "Falha no envio de email",
        };
      }
    } catch (error) {
      console.error("Erro no serviço de email:", error);
      return {
        success: false,
        error: "Erro interno no serviço de email",
        message: error.message,
      };
    }
  }

  // Simulador de envio de email (para desenvolvimento)
  async simularEnvioEmail(dadosEmail) {
    try {
      //injetar serviço de email real aqui no futuro

      const template = this.criarTemplateConfirmacao(dadosEmail);

      console.log("=".repeat(50));
      console.log("SIMULAÇÃO DE ENVIO DE EMAIL");
      console.log("=".repeat(50));
      console.log(`Para: ${dadosEmail.to}`);
      console.log(`Assunto: ${dadosEmail.subject}`);
      console.log(`Template: ${template}`);
      console.log("=".repeat(50));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error("Erro ao simular envio de email:", error);
      return false;
    }
  }

  // Criar template do email
  criarTemplateConfirmacao(dadosEmail) {
    const { pedido } = dadosEmail;
    const itens = pedido.itens_pedido
      .map(
        (item) =>
          `- ${item.produtos.nome_produto}: ${item.qtde} x R$ ${item.preco_unitario} = R$ ${item.subtotal}`
      )
      .join("\n");

    return `
      Olá ${pedido.clientes.nome_completo}!

      Seu pedido #${pedido.numero_pedido} foi confirmado!

      **Resumo do Pedido:**
      ${itens}

      **Total: R$ ${pedido.valor_total}**

      **Endereço de Entrega:**
      ${JSON.stringify(pedido.endereco_envio, null, 2)}

      **Dúvidas?** Entre em contato conosco!

      Atenciosamente,
      Equipe da Loja
    `;
  }

  // Método adicional: Enviar email de atualização de status
  async enviarAtualizacaoStatus(pedidoId, novoStatus) {
    try {
      console.log(`Email de atualização: Pedido ${pedidoId} -> ${novoStatus}`);

      return {
        success: true,
        message: "Email de atualização enviado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao enviar email de atualização:", error);
      return {
        success: false,
        error: "Erro ao enviar email de atualização",
      };
    }
  }
}

module.exports = new EmailService();
