const { supabase } = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Verifica se o token existe
  if (!token) {
    return res.status(401).json({
      error: "Token de acesso necessário",
      message: "Authorization header com Bearer token é obrigatório",
    });
  }

  try {
    // Verifica o token com Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    // Token inválido ou expirado
    if (error) {
      console.error("Erro na verificação do token:", error.message);
      return res.status(403).json({
        error: "Token inválido",
        message: "Não foi possível validar o token de acesso",
      });
    }

    // Usuário não encontrado
    if (!user) {
      return res.status(403).json({
        error: "Usuário não encontrado",
        message: "O token é válido mas o usuário não existe",
      });
    }

    // Adiciona usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    console.error("Erro inesperado ao verificar token:", error);
    return res.status(500).json({
      error: "Erro interno na autenticação",
      message: "Erro ao processar a autenticação",
    });
  }
};

// Middleware opcional para admin (se você tiver roles)
const requireAdmin = async (req, res, next) => {
  try {
    // Verifica se é admin baseado no app_metadata
    const isAdmin = req.user?.app_metadata?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        error: "Acesso negado",
        message: "Esta operação requer privilégios de administrador",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);
    return res.status(500).json({
      error: "Erro ao verificar permissões",
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
