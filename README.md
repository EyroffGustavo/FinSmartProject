# Financeiro Inteligente

Sistema web de controle financeiro pessoal desenvolvido em **ASP.NET Core MVC**, com foco em organização de receitas, despesas, dívidas, metas e planejamento financeiro.

O objetivo do projeto é simular uma aplicação real de gestão financeira, com uma interface moderna, responsiva e funcionalidades práticas para o usuário acompanhar sua vida financeira de forma simples.

---

## Sobre o projeto

O **Financeiro Inteligente** permite que o usuário registre suas principais movimentações financeiras e visualize um resumo geral da sua situação atual.

Nesta primeira versão, os dados são armazenados no **LocalStorage do navegador**, ou seja, ainda não há banco de dados integrado. Isso permite testar o funcionamento do sistema de forma rápida, sem necessidade de configuração de backend ou migrations.

A ideia futura é evoluir o projeto para utilizar banco de dados com **Entity Framework Core + SQLite/SQL Server**.

---

## Funcionalidades

### Dashboard

O dashboard apresenta uma visão geral da situação financeira do usuário:

- Saldo atual
- Total de receitas
- Total de despesas
- Total de dívidas
- Últimas movimentações cadastradas
- Resumo inteligente com análise básica dos gastos

---

### Receitas

Permite cadastrar entradas financeiras, como:

- Salário
- Vale-alimentação
- Vale-refeição
- Freelance
- Comissões
- Auxílios
- Outras entradas

Campos disponíveis:

- Descrição
- Categoria
- Valor
- Data

---

### Despesas

Permite cadastrar saídas financeiras, como:

- Aluguel
- Internet
- Energia
- Água
- Mercado
- Transporte
- Cartão de crédito
- Streaming
- Lazer
- Outros gastos

Campos disponíveis:

- Descrição
- Categoria
- Valor
- Data

---

### Dívidas

Permite cadastrar dívidas ativas e calcular automaticamente o valor mensal necessário para quitá-las dentro do prazo informado.

Campos disponíveis:

- Nome da dívida
- Valor total
- Prazo em meses

Exemplo:

```text
Dívida: Nubank
Valor: R$ 9.472,00
Prazo: 12 meses
Valor sugerido por mês: R$ 789,33
