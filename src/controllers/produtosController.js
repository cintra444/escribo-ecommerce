const supabase = require("../config/supabase");

class ProdutosController {
  async listarProdutos(req, res) {
    try {
      const { page = 1, limit = 10, categoria } = req.query;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("produtos")
        .select("*", { count: "exact" })
        .eq("ativo", true)
        .range(from, to);

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      const { data: produtos, error, count } = await query;
      if (error) throw error;

      res.json({
        produtos,
        paginacao: {
          pagina: parseInt(page),
          totalPaginas: Math.ceil(count / limit),
          totalProdutos: count,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //buscar produto po id
  async buscarProdutoPorId(req, res) {
    try {
      const { id } = req.params;

      const { data: produto, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .eq("ativo", true)
        .single();

      if (error) throw error;
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = new ProdutosController();
