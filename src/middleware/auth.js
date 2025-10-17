const supabase = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401).json({ message: "Token de acesso necessário" });
  }
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .sendStatus(403)
        .json({ message: "Token inválido ou expirado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.sendStatus(500).json({ message: "Erro ao verificar token" });
  }
};

module.exports = authenticateToken;
