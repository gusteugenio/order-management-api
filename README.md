# Order Management API
 
API RESTful para gerenciamento de pedidos, construída com Node.js, NestJS e PostgreSQL.
 
---
 
## Stack
 
| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 24 |
| Framework | NestJS 11 |
| Linguagem | TypeScript 5 |
| Banco de Dados | PostgreSQL 16 |
| ORM | Prisma 7 |
| Autenticação | JWT + Passport |
| Documentação | Swagger / OpenAPI |
| Validação | class-validator + class-transformer |
| Testes | Jest |
| Containerização | Docker + Docker Compose |
| Qualidade | ESLint + Prettier |
 
---
 
## Funcionalidades
 
- Autenticação com JWT Bearer Token
- Criar pedido com itens
- Listar pedidos com paginação
- Filtrar pedidos por número, status e período
- Editar pedido
- Exclusão lógica de pedidos (soft delete)
- Documentação interativa via Swagger
 
---
 
## Arquitetura
 
```
src/
├── auth/
│   ├── auth.controller.ts       # POST /auth/login
│   ├── auth.service.ts          # lógica de autenticação
│   ├── auth.module.ts
│   ├── jwt.strategy.ts          # validação do token JWT
│   └── dto/
│       └── login.dto.ts
├── orders/
│   ├── orders.controller.ts     # rotas de pedidos
│   ├── orders.service.ts        # lógica de negócio
│   ├── orders.module.ts
│   └── dto/
│       ├── create-order.dto.ts
│       ├── update-order.dto.ts
│       └── filter-order.dto.ts
├── prisma/
│   ├── prisma.service.ts        # cliente Prisma
│   └── prisma.module.ts
└── main.ts                      # bootstrap, Swagger, ValidationPipe
```
 
O projeto segue uma arquitetura em camadas:
 
```
Request → Controller → Service → PrismaService → PostgreSQL
```
 
- **Controller** — recebe a requisição, valida o DTO e delega ao service
- **Service** — contém toda a lógica de negócio
- **PrismaService** — acesso ao banco de dados
- **Guards** — protegem as rotas autenticadas via JWT
 
---
 
## Modelo de Dados
 
```mermaid
erDiagram
    Order {
        string id PK
        string number UK
        datetime estimatedDeliveryDate
        string customerName
        string customerDocument
        string deliveryAddress
        enum status
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
 
    OrderItem {
        string id PK
        string description
        int quantity
        float unitPrice
        string orderId FK
        datetime createdAt
        datetime updatedAt
    }
 
    Order ||--o{ OrderItem : "possui"
```
 
### Status do Pedido
 
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING
    PROCESSING --> DELIVERED
    PENDING --> CANCELED
    PROCESSING --> CANCELED
```
 
---
 
## Rotas
 
### Autenticação
 
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Gera token JWT | ✗ |
 
### Pedidos
 
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/orders` | Cria um pedido | ✓ |
| GET | `/api/orders` | Lista pedidos | ✓ |
| GET | `/api/orders/:id` | Busca pedido por ID | ✓ |
| PATCH | `/api/orders/:id` | Edita pedido | ✓ |
| DELETE | `/api/orders/:id` | Remove pedido (soft delete) | ✓ |
 
### Filtros disponíveis
 
```
GET /api/orders?number=123
GET /api/orders?status=PENDING
GET /api/orders?startDate=2026-01-01&endDate=2026-01-31
```
 
---
  
## Como Rodar
 
### Pré-requisitos
 
- Docker
- Docker Compose
 
### 1. Clonar o repositório
 
```bash
git clone https://github.com/seu-usuario/order-management-api.git
cd order-management-api
```
 
### 2. Configurar variáveis de ambiente
 
```bash
cp .env.example .env
```
 
Conteúdo do `.env`:
 
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/orders_db"
JWT_SECRET="sua-chave-secreta"
```
 
### 3. Subir os containers
 
```bash
docker compose up --build
```
 
A API estará disponível em `http://localhost:3000`.
 
---
 
## Banco de Dados
 
### Rodar migrations
 
```bash
docker compose exec api npx prisma migrate dev
```
 
### Popular o banco com dados fictícios
 
```bash
docker compose exec api npm run seed
```
### Abrir Prisma Studio
 
```bash
docker compose exec api npx prisma studio --port 5555 --browser none
```
 
Acesse em `http://localhost:5555`.
 
---
 
## Swagger
 
Documentação interativa disponível em:
 
```
http://localhost:3000/api/docs
```
 
> Para testar rotas protegidas, faça login em `POST /api/auth/login` e insira o token no botão **Authorize** no topo da página.

### Credenciais de Teste

| Campo | Valor |
|---|---|
| Email | `admin@orders.com` |
| Senha | `admin123` |

---
 
## Testes
 
```bash
# unitários
docker compose exec api npm run test
 
# cobertura
docker compose exec api npm run test:cov
 
# e2e
docker compose exec api npm run test:e2e
```
 
---
 
## Checklist
 
### API
 
- [x] `POST /auth/login` com bcrypt + JWT
- [x] `JwtAuthGuard` protegendo rotas
- [ ] `POST /orders` com itens
- [ ] `GET /orders` com filtros (número, status, período)
- [ ] `GET /orders/:id`
- [ ] `PATCH /orders/:id`
- [ ] `DELETE /orders/:id` com soft delete
- [ ] Tratamento de erros padronizado
- [ ] Respostas padronizadas
 
### Validação
 
- [x] `ValidationPipe` global configurado
- [ ] DTOs com class-validator em todas as rotas
- [ ] Campos obrigatórios validados
- [ ] Formatos validados (CPF, datas, enums)
 
### Banco de Dados
 
- [x] Migration inicial criada
- [x] Índices criados (`customerDocument`, `orderId`)
- [x] Soft delete implementado (`deletedAt`)
- [x] Seed com pedidos e itens fictícios
 
### Autenticação
 
- [x] Hash de senha com bcrypt
- [x] Geração de token JWT
- [x] Validação do token via `JwtStrategy`
- [x] Guard aplicado nas rotas protegidas
 
### Documentação
 
- [x] Swagger configurado em `/api/docs`
- [x] Autenticação Bearer configurada no Swagger
- [ ] Todos os endpoints documentados
- [ ] Exemplos de request nos DTOs
 
### Qualidade
 
- [ ] ESLint sem erros
- [ ] Prettier aplicado
- [ ] Testes unitários no `AuthService`
- [ ] Testes unitários no `OrdersService`
 
### DevOps
 
- [x] `Dockerfile` funcional
- [x] `docker compose up` sobe tudo
- [x] Healthcheck no Postgres
- [x] `.env.example` criado
- [ ] GitHub Actions com lint + testes (bônus)
 
### README
 
- [x] Stack documentada
- [x] Como rodar documentado
- [ ] Rotas documentadas
