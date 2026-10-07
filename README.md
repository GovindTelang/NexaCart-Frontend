# NexaCart Frontend

React frontend for the NexaCart Spring Boot backend.

## Stack
- React 18
- Vite
- React Router
- Vanilla CSS
- Fetch API

## Backend integration
The frontend targets the existing NexaCart REST API:

- `POST /users/register`
- `POST /users/login`
- `GET /products`
- `GET /products/search`
- `POST/PUT/DELETE /products/**` (ADMIN)
- `GET /cart`
- `POST /cart/add`
- `PUT /cart/update`
- `DELETE /cart/remove`
- `POST /orders/checkout`
- `GET /orders/my-orders`
- `GET /orders/all-orders` (ADMIN)

During local development Vite proxies `/api/*` to `http://localhost:8080`, which avoids browser CORS issues. The JWT is stored in `localStorage` and automatically attached as a Bearer token to authenticated API calls.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` while the NexaCart backend is running on port 8080.

## Notes
The backend product list returns a Spring `Page<Product>`, so the UI reads products from `response.content` and supports server-side pagination/search.
