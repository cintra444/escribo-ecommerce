const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin", require("./routes/admin-produtos"));
app.use("/api/produtos", require("./routes/produtos"));
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/services", require("./routes/services"));

// Health Check Endpoint

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "ecommerce-backend",
  });
});

//rota para download direto do CSV
app.get("/api/pedidos/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const exportService = require("./services/exportService");
    const csv = await exportService.exportOrderToCSV(id);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pedido-${req.params.id}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error("Erro ao exportar pedido:", error);
    res.status(500).json({ error: error.message });
  }
});

//rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "Bem-vindo ao E-commerce Backend API",
    version: "1.0.0",
    endpoints: {
      produtos: "/api/produtos",
      pedidos: "/api/pedidos",
      clientes: "/api/clientes",
      services: "/api/services",
      health: "/health",
    },
  });
});

//middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro inesperado:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro interno do servidor",
  });
});

//erro 404
app.use((req, res) => {
  res.status(404).json({
    error: "Rota nao encontrada",
    path: req.path,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check em http://localhost:${PORT}/health`);
  console.log(`Documentação em http://localhost:${PORT}/api`);
});
