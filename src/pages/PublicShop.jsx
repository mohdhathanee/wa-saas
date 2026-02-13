import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useCart } from "../cart/CartProvider";

// Simple skeleton card (keep your original if you already have one)
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="h-44 w-full rounded-xl bg-gray-100" />
      <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
      <div className="mt-3 h-10 w-full rounded-xl bg-gray-100" />
    </div>
  );
}

export default function PublicShop() {
  const { shopId } = useParams();
  const [searchParams] = useSearchParams();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [err, setErr] = useState("");

  const { items, add, inc, dec, remove, total } = useCart();

  const waNumber = useMemo(() => {
    const raw = shop?.whatsapp || "";
    return String(raw).replace(/[^\d]/g, "");
  }, [shop?.whatsapp]);

  const thanks = searchParams.get("thanks") === "1";

  useEffect(() => {
    async function loadShop() {
      try {
        const snap = await getDoc(doc(db, "shops", shopId));
        if (snap.exists()) setShop({ id: snap.id, ...snap.data() });
        else setShop(null);
      } catch (e) {
        setErr(e?.message || "Failed to load shop.");
      }
    }
    loadShop();
  }, [shopId]);

  useEffect(() => {
    setLoadingProducts(true);
    setErr("");

    const q = query(
      collection(db, "shops", shopId, "products"),
      where("active", "==", true)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingProducts(false);
      },
      (e) => {
        setErr(e?.message || "Failed to load products.");
        setLoadingProducts(false);
      }
    );

    return () => unsub();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold">
                {shop?.shopName || "Shop"}
              </h1>
              <p className="text-sm text-gray-500">
                Browse products • Add to cart • Checkout
              </p>
            </div>

            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-green-600 px-3 py-2 text-sm font-extrabold text-white hover:bg-green-700"
              >
                WhatsApp
              </a>
            ) : null}
          </div>

          {thanks ? (
            <div className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-800">
              ✅ Thanks! Your order was placed successfully.
            </div>
          ) : null}

          {err ? (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {err}
            </div>
          ) : null}
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Products</h2>
            <p className="text-sm text-gray-500">
              Add items to cart, then checkout.
            </p>
          </div>
          <div className="text-xs text-gray-500">{products.length} items</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingProducts
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-44 w-full rounded-xl object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-900">
                      Rs {p.price}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-extrabold">{p.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Quick checkout • WhatsApp verify
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      add({
                        id: p.id,
                        name: p.name,
                        price: Number(p.price),
                        imageUrl: p.imageUrl,
                      })
                    }
                    className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    ➕ Add to Cart
                  </button>
                </div>
              ))}
        </div>

        {!loadingProducts && products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No products available right now.
          </div>
        ) : null}
      </div>

      {/* Sticky Cart Bar */}
      {items.length > 0 ? (
        <div className="fixed bottom-3 left-3 right-3 mx-auto max-w-3xl rounded-2xl bg-gray-900 p-3 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold">
              {items.reduce((s, x) => s + (x.qty || 1), 0)} item(s) • Rs {total}
            </div>

            <Link
              to={`/shop/${shopId}/checkout`}
              className="rounded-xl bg-green-600 px-3 py-2 text-sm font-extrabold hover:bg-green-700"
            >
              Checkout →
            </Link>
          </div>

          {/* Mini cart controls (optional but useful) */}
          <div className="mt-2 grid gap-2">
            {items.slice(0, 2).map((x) => (
              <div key={x.id} className="flex items-center justify-between text-xs">
                <div className="font-semibold">
                  {x.name} <span className="text-gray-300">x{x.qty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dec(x.id)}
                    className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
                    type="button"
                  >
                    −
                  </button>
                  <button
                    onClick={() => inc(x.id)}
                    className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
                    type="button"
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(x.id)}
                    className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {items.length > 2 ? (
              <div className="text-[11px] text-gray-300">
                + {items.length - 2} more item(s) in cart…
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Sticky WhatsApp (your original style) */}
      {waNumber ? (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-green-700"
        >
          WhatsApp
        </a>
      ) : null}

      <footer className="mt-10 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500 md:px-6">
          Powered by WA Commerce • Built for small businesses
        </div>
      </footer>
    </div>
  );
}
