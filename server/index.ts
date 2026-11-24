import express from "express";
import { resolve } from "node:path";
import { products, getProductByPnc } from "../src/data/catalog.ts";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.disable("x-powered-by");
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "Electrolux Video Studio demo catalogue" });
});

app.get("/api/products", (request, response) => {
  const query = String(request.query.pnc ?? "");
  const product = getProductByPnc(query);
  if (!product) {
    response.status(404).json({ error: `No demo product found for PNC "${query}".` });
    return;
  }
  response.json(product);
});

app.get("/api/products/:pnc/markets", (request, response) => {
  const product = getProductByPnc(request.params.pnc);
  if (!product) {
    response.status(404).json({ error: `No demo product found for PNC "${request.params.pnc}".` });
    return;
  }
  response.json(product.markets);
});

app.get("/api/products/demo", (_request, response) => {
  response.json(products);
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

app.use(express.static(resolve(process.cwd(), "dist")));
app.get("*", (_request, response, next) => {
  response.sendFile(resolve(process.cwd(), "dist/index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Electrolux Video Studio listening on http://localhost:${port}`);
});
