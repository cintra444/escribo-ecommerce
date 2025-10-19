const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");

router.post("/promover-admin", async (req, res) => {
  try {
    const { user_id } = req.body;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { app_metadata: { role: "admin" } }
    );

    if (error) throw error;

    res.json({
      success: true,
      message: "Usuário promovido a admin com sucesso",
      user: data,
    });
  } catch (error) {
    console.error("Erro ao promover admin:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao promover usuário para admin",
    });
  }
});

module.exports = router;
