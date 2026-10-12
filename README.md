# NexaCart Frontend

A responsive e-commerce storefront for **NexaCart**, built with React and TypeScript. It connects to the NexaCart Spring Boot REST API and provides customer shopping flows plus an admin interface for catalog and order management.

## Tech stack

- **React 18**
- **TypeScript 5** 
- **Vite 5**
- **React Router 6**
- **Vanilla CSS**
- **Fetch API** for HTTP requests
- **Razorpay** for checkout
- **Render Static Site** for the frontend deployment


## API integration

The frontend calls the existing NexaCart REST API. Authenticated requests include the JWT as a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Purpose / access |
|---|---|---|
| `POST` | `/users/register` | Register a customer account |
| `POST` | `/users/login` | Authenticate and receive a JWT |
| `GET` | `/products` | List products with server-side pagination |
| `GET` | `/products/search` | Search/filter products by keyword and category, with pagination |
| `POST` | `/products` | Create a product — `ADMIN` |
| `PUT` | `/products/{id}` | Update a product — `ADMIN` |
| `DELETE` | `/products/{id}` | Delete a product — `ADMIN` |
| `GET` | `/cart` | Get the current customer's cart |
| `POST` | `/cart/add` | Add a product to the cart |
| `PUT` | `/cart/update` | Update a cart item's quantity |
| `DELETE` | `/cart/remove` | Remove a cart item |
| `POST` | `/payments/create-order` | Create a Razorpay payment order |
| `POST` | `/payments/verify` | Verify a Razorpay payment and finalize the order |
| `GET` | `/orders/my-orders` | View the signed-in customer's orders |
| `GET` | `/orders/all-orders` | View all orders — `ADMIN` |

The existing backend also exposes `POST /orders/checkout`; the current frontend checkout flow uses the Razorpay endpoints above.

The product-list endpoints return a Spring `Page<Product>`. The UI reads `content`, `totalPages`, `totalElements`, and page metadata from the response rather than hardcoding the catalogue size.

## Requirements

- Node.js 18 or later (Node.js 20+ recommended)
- npm
- Access to the NexaCart backend API

## Run locally

Clone the repository and install the locked dependencies:

```powershell
git clone https://github.com/GovindTelang/NexaCart-Frontend.git
cd NexaCart-Frontend
npm ci
```

Create `.env.local` in the project root. In PowerShell, you can create it with:

```powershell
@'
VITE_API_BASE_URL=/api
'@ | Set-Content -Path .\.env.local -Encoding ascii
```

Start the development server:

```powershell
npm run dev
```

Open http://localhost:5173.

## Project scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the built site locally |
