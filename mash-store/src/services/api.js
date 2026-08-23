// API Service Layer - Calls Next.js API routes
// Client-side fetch layer for AdminPortal and Client Components

const API_BASE = `${typeof window !== 'undefined' ? window.location.origin : ''}/api`;

export const api = {
  async getAllProducts() {
    const res = await fetch(`${API_BASE}/product`);
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return await res.json();
  },

  async addNewProduct(body) {
    const res = await fetch(`${API_BASE}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Server error ${res.status}`);
    }
    return await res.json();
  },

  async updateProduct(id, body) {
    const res = await fetch(`${API_BASE}/product/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Server error ${res.status}`);
    }
    return await res.json();
  },

  async removeProduct(id) {
    const res = await fetch(`${API_BASE}/product/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Server error ${res.status}`);
    }
    return await res.json();
  },
};
