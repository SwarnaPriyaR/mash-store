// app/api/docs/route.ts — OpenAPI 3.0 Specification Endpoint
import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "MASH Store API Documentation",
      version: "1.0.0",
      description: "RESTful API endpoints for managing Adult Products and Kids Products in MASH Store.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    paths: {
      "/api/product/allProduct": {
        get: {
          tags: ["Adult Products"],
          summary: "Fetch all Adult Products",
          description: "Returns an array of all standard adult products sorted by ID ascending.",
          responses: {
            "200": {
              description: "Array of adult products",
            },
          },
        },
      },
      "/api/product/addNew": {
        post: {
          tags: ["Adult Products"],
          summary: "Add a new Adult Product",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "basePrice", "qty"],
                  properties: {
                    name: { type: "string", example: "Cyberpunk Oversized Tee" },
                    basePrice: { type: "integer", example: 799 },
                    qty: { type: "integer", example: 24 },
                    fit: { type: "string", example: "Regular" },
                    category: { type: "string", example: "Men" },
                    sizes: { type: "array", items: { type: "string" }, example: ["S", "M", "L", "XL"] },
                    image: { type: "string", example: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a" },
                    tags: { type: "array", items: { type: "string" }, example: ["Men", "Streetwear"] },
                    description: { type: "string", example: "Heavyweight cotton tee." },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Product created successfully" },
          },
        },
      },
      "/api/product/updateProduct/{id}": {
        patch: {
          tags: ["Adult Products"],
          summary: "Update an Adult Product",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    qty: { type: "integer" },
                    basePrice: { type: "integer" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Updated successfully" },
          },
        },
      },
      "/api/product/removeProduct/{id}": {
        delete: {
          tags: ["Adult Products"],
          summary: "Delete an Adult Product",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Deleted successfully" },
          },
        },
      },
      "/api/kids/allProduct": {
        get: {
          tags: ["Kids Products"],
          summary: "Fetch all Kids Products",
          responses: {
            "200": { description: "Array of kids products" },
          },
        },
      },
      "/api/kids/addNew": {
        post: {
          tags: ["Kids Products"],
          summary: "Add a new Kids Product",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "basePrice", "qty"],
                  properties: {
                    name: { type: "string", example: "Unicorn Sparkle Frock" },
                    basePrice: { type: "integer", example: 599 },
                    qty: { type: "integer", example: 20 },
                    sizes: { type: "array", items: { type: "string" }, example: ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"] },
                    image: { type: "string", example: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7" },
                    tags: { type: "array", items: { type: "string" }, example: ["Girl", "Party"] },
                    description: { type: "string", example: "Soft cotton dress." },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Kids product created" },
          },
        },
      },
      "/api/kids/updateProduct/{id}": {
        patch: {
          tags: ["Kids Products"],
          summary: "Update a Kids Product",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Updated successfully" },
          },
        },
      },
      "/api/kids/removeProduct/{id}": {
        delete: {
          tags: ["Kids Products"],
          summary: "Delete a Kids Product",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Deleted successfully" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
