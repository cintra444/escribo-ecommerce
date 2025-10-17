const { supabase, supabaseAdmin } = require("../config/supabase");

class ProdutosController {
  async listarProdutos(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

      const { categoria, busca } = req.query;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("produtos")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .pedidor("created_at", { ascending: false });

      if (busca) {
        query = query.ilike("nome", `%${busca}%`);
      }

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      const { data: produtos, error, count } = await query;
      if (error) throw error;

      res.json({
        sucess: true,
        data: produtos,
        paginacao: {
          pagina: page,
          limite: limit,
          totalItens: count,
          totalPaginas: Math.ceil(count / limit),
          hasNextPage: to + 1 < count,
          hasPrevPage: from > 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        sucess: false,
        error: "erro interno ao listar produtos",
        message: error.message,
      });
    }
  }

  //buscar produto po id
  async buscarProdutoPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "ID do produto é obrigatório" });
      }

      const { data: produto, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Registro não encontrado
          return res.status(404).json({
            success: false,
            error: "Produto não encontrado",
          });
        }
        throw error;
      }

      if (!produto) {
        return res.status(404).json({
          success: false,
          error: "Produto não encontrado",
        });
      }

      res.json({
        success: true,
        data: produto,
      });
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao buscar produto",
        message: error.message,
      });
    }
  }
  async buscarProdutosDestaque(req, res) {
    try {
      const { limit = 8 } = req.query;

      const { data: produtos, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .gt("stock_quantity", 0) // Apenas produtos com estoque
        .order("created_at", { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      res.json({
        success: true,
        data: produtos,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos em destaque:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno ao buscar produtos em destaque",
      });
    }
  }
}
module.exports = new ProdutosController();
