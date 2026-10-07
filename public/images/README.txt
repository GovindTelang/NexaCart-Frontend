# NexaCart 100 Product Images

Copy `images/products/` into the React frontend:

`Nexacart-Frontend/public/images/products/`

The files are named `product-001.webp` through `product-100.webp`.

Run `update-product-images.ps1` only while the NexaCart backend is running on http://localhost:8080.
The script logs in as your admin account and updates all 100 products to use the local image paths.
