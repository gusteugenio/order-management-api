# Order Management API

## Sobre o Projeto

[![CI/CD Pipeline](https://github.com/gusteugenio/order-management-api/actions/workflows/ci.yml/badge.svg)](https://github.com/gusteugenio/order-management-api/actions)
API RESTful desenvolvida em Node.js com NestJS para gerenciamento de pedidos, com foco em boas práticas de arquitetura, segurança, testes e organização de código.

---

## Destaques da Implementação

Para atender aos critérios de **Segurança, Boas Práticas e Performance** do projeto, a API conta com:
- **Automação com CI/CD:** Integração contínua via GitHub Actions que executa automaticamente a validação de padrões (Linter) e a suíte de testes unitários a cada push ou Pull Request, garantindo a estabilidade do código.
- **Segurança Avançada:** Senhas criptografadas com `bcrypt` e proteção de rotas via `JwtAuthGuard` (Bearer Token).
- **Performance em Consultas:** Criação de índices específicos no banco de dados (`customerDocument` e `orderId`) para otimizar os filtros de busca.
- **Resiliência de Dados:** Implementação de exclusão lógica (*soft delete*) via campo `deletedAt`, garantindo que o histórico de pedidos não seja perdido no banco de dados.
- **Conformidade REST:** Status HTTP semânticos e tratamento global de exceções.

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
 
> O filtro de período é aplicado sobre a **data de previsão de entrega** do pedido.

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
docker compose up --build -d
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

## Postman

Importe a collection para testar a API localmente:

1. Abra o Postman
2. Clique em **File → Import**
3. Selecione o arquivo `postman/order-management-api.postman_collection.json`

O token JWT é salvo automaticamente após o login, não sendo necessário configurar manualmente.

---

## Qualidade/Testes

- ESLint sem erros
- Prettier aplicado
- Testes unitários em services
- Código modular e escalável

### Lint e formatação

```bash
# lint
docker compose exec api npm run lint

# prettier
docker compose exec api npm run format
```

### Testes
```bash
# unitários
docker compose exec api npm run test
 
# cobertura
docker compose exec api npm run test:cov
```
 
---
 
## CI/CD

GitHub Actions executa automaticamente:

- ESLint (lint)
- Jest (testes)

Em push e pull request na branch main.

---

## Checklist
 
### API
 
- [x] `POST /auth/login` com bcrypt + JWT
- [x] `JwtAuthGuard` protegendo rotas
- [x] `POST /orders` com itens
- [x] `GET /orders` com filtros (número, status, período)
- [x] `GET /orders/:id`
- [x] `PATCH /orders/:id`
- [x] `DELETE /orders/:id` com soft delete
- [x] Tratamento de erros padronizado
- [x] Respostas padronizadas
 
### Validação
 
- [x] `ValidationPipe` global configurado
- [x] DTOs com class-validator em todas as rotas
- [x] Campos obrigatórios validados
- [x] Formatos validados (CPF, datas, enums)
 
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
- [x] Todos os endpoints documentados
- [x] Exemplos de request nos DTOs
 
### Qualidade
 
- [x] ESLint sem erros
- [x] Prettier aplicado
- [x] Testes unitários no `AuthService`
- [x] Testes unitários no `OrdersService`
 
### DevOps
 
- [x] `Dockerfile` funcional
- [x] `docker compose up` sobe tudo
- [x] Healthcheck no Postgres
- [x] `.env.example` criado
- [x] GitHub Actions com lint + testes (bônus)
 
### README
 
- [x] Stack documentada
- [x] Como rodar documentado
- [x] Rotas documentadas
