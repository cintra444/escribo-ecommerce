const supabase = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token de acesso necessário",
      message: "Autorization header com Bearer token necessário",
    });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error("Erro ao verificar token:", error);
      return res.status(403).json({
        error: "Token inválido ou expirado",
        message: "Não foi possivel verificar o token",
      });
    }

    if (!user) {
      return res.sendStatus(403).json({
        error: "Cliente não encontrado",
        message: "O token não corresponde a nenhum cliente",
      });
    }

    if (!user.email.confirmed_at) {
      return res.status(403).json({
        error: "Email nao confirmado",
        message: "Confirme seu email antes de acessar este recurso",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erro inesperado ao verificar token:", error);
    return res.status(500).json({
      error: "Erro interno de autenticação",
      message: "Erro ao processar autenticação",
    });
  }

  const requireAdmin = async (req, res, next) => {
    try {
      const isAdmin = req.user.user_metadata?.role === "admin";

      if (!isAdmin) {
        return res.status(403).json({
          error: "Acesso negado",
          message: "Você não tem permissão para acessar este recurso",
        });
      }

      next();
    } catch (error) {
      console.error("Erro inesperado ao verificar admin:", error);
      return res.status(500).json({
        error: "Erro interno de autenticação",
        message: "Erro ao processar autenticação",
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
