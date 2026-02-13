import React, { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{id, name, price, imageUrl, qty}]

  function add(product) {
    setItems((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function dec(id) {
    setItems((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  }

  function inc(id) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }

  function remove(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clear() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.price || 0) * (x.qty || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, inc, dec, remove, clear, total }),
    [items, total]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
