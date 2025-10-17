// @deno-types="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.34.0/dist/module/index.d.ts"
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.34.0/dist/module/index.js";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apiKey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  } 

  try {
    const { pedido_id } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    //buscar dados do pedido
    const { data: pedido, error: pedidoError } = await supabaseClient
      .from("detalhes_pedidos")
      .select("*")
      .eq("id", pedido_id)
      .single();

      if (pedidoError) throw pedidoError;

//buscar itens do pedido
    const { data: itens, error: itensError } = await supabaseClient
      .from("itens_pedido")
      .select(`
        qtde,
        preco_unitario,
        subtotal,
        produto (nome_produto)
        `)
      .eq("pedido_id", pedido_id);
        if (itensError) throw itensError;


        //simular envio de email
        const emailContent = {
            to: pedido.email_cliente,
            subject: `Pedido ${pedido.numero_pedido} confirmado!`,
            body: `
              Ola ${pedido.nome_cliente}, seu pedido foi realizado com sucesso.

                Detalhes do pedido:
                Número do pedido: ${pedido.numero_pedido}
                Data do pedido: ${pedido.data_pedido}
                Total do pedido: ${pedido.total_pedido}

                Itens do pedido:
                ${itens
                  .map(
                    (item) => `
                      ${item.qtde} x ${item.produto?.nome_produto} - R$ ${item.preco_unitario}
                      Subtotal: R$ ${item.subtotal}
                    `,
                  )
                  .join("")}

                Obrigado por comprar conosco!
            `,
          };

          await fetch("https://api.sendinblue.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": Deno.env.get("SENDINBLUE_API_KEY")!,
            },
            body: JSON.stringify(emailContent),
          });

          return new Response("Pedido confirmado com sucesso!", {
            status: 200,
            headers: corsHeaders,
          });
        } catch (error) {
          console.error("Erro ao confirmar pedido:", error);
          return new Response("Erro ao confirmar pedido", {
            status: 500,
            headers: corsHeaders,
          });   
        }
});