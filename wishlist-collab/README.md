# Amazon Collaborative Wishlist (Monorepo)

Spin up a multi-service demo with Postgres, an API Gateway, and a React frontend.

## Quick start

```bash
cd ops
docker compose up --build -d
# Wait ~10–15s for Postgres + services; then open:
# Frontend: http://localhost:5173
# Gateway API: http://localhost:8080/health
```

Default demo users (use the header switcher in the app to "log in"):
- alice
- bob
- carol
- dave

## What’s included
- **Postgres** with init SQL creating schemas/tables + seed data
- **user-service**: Dev auth + `/me`
- **wishlist-service**: Wishlists & items
- **collaboration-service**: Access, invites, comments
- **api-gateway**: Verifies JWT (HS256), proxies to services, and serves products from JSON
- **web-frontend**: React (Vite) app with routes `/wishlist`, `/wishlist/friends`, `/invite/:token`

Products are **static JSON** at `apps/api-gateway/products/products.json`.