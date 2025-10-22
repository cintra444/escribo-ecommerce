# 🛍️ E-commerce Backend API

## 📝 Descrição

API REST desenvolvida em Node.js para gerenciamento de e-commerce, integrando com Supabase para persistência de dados.

## 💻 Tecnologias Utilizadas

- Node.js
- Express
- Supabase
- dotenv
- cors

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/cintra444/escribo-ecommerce.git

# Acesse o diretório
cd ecommerce-backend

# Instale as dependências
npm install
```

### Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
PORT=3000
```

## 🔄 Rotas da API

### Produtos

| Método | Rota                | Descrição               |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/produtos`     | Lista todos os produtos |
| GET    | `/api/produtos/:id` | Busca produto por ID    |
| POST   | `/api/produtos`     | Cria novo produto       |
| PUT    | `/api/produtos/:id` | Atualiza produto        |
| DELETE | `/api/produtos/:id` | Remove produto          |

### Pedidos

| Método | Rota               | Descrição              |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/pedidos`     | Lista todos os pedidos |
| POST   | `/api/pedidos`     | Cria novo pedido       |
| PUT    | `/api/pedidos/:id` | Atualiza status        |

### Clientes

| Método | Rota            | Descrição        |
| ------ | --------------- | ---------------- |
| GET    | `/api/clientes` | Lista clientes   |
| POST   | `/api/clientes` | Cadastra cliente |

## 🔒 Autenticação

A API utiliza autenticação via Supabase. Adicione o token JWT no header:

```http
Authorization: Bearer seu_token_jwt
```

## 📊 Banco de Dados

### Tabelas

- produtos
- pedidos
- pedidos_items
- clientes
- categorias

## 🚀 Scripts Disponíveis

```bash
# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start

# Executar testes
npm test
```

## 👥 Como Contribuir

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Commit suas mudanças (`git commit -m 'Adicionando uma Feature incrível'`)
5. Push a Branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Eber Cintra - [portifolio](portifolio-eber.netlify.app)

Link do projeto: [hhttps://github.com/cintra444/escribo-ecommerce](https://github.com/cintra444/escribo-ecommerce)
