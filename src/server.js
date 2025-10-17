const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/produtos", require("./routes/produtos"));
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/services", require("./routes/services"));

// Health Check Endpoint

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

//rota para download direto do CSV
app.get("/api/pedidos: id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const exportService = require("./services/exportService");
    const filePath = await exportService.gerarCSVPedido(id);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pedido-${req.params.id}.csv"`
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
