import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="h-40 w-full rounded-xl bg-gray-100" />
      <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
      <div className="mt-3 h-9 w-full rounded-xl bg-gray-100" />
    </div>
  );
}

export default function PublicShop() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [placingId, setPlacingId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoadingShop(true);
      const snap = await getDoc(doc(db, "shops", shopId));
      setShop(snap.exists() ? snap.data() : null);
      setLoadingShop(false);
    })();
  }, [shopId]);

  useEffect(() => {
    setLoadingProducts(true);
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
      () => setLoadingProducts(false)
    );
    return () => unsub();
  }, [shopId]);

  const waNumber = useMemo(
    () => (shop?.whatsapp || "").replace(/\D/g, ""),
    [shop?.whatsapp]
  );

  async function placeOrder(product) {
    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    try {
      setPlacingId(product.id);

      // 1) Save order
      await addDoc(collection(db, "shops", shopId, "orders"), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });

      // 2) Open WhatsApp message
      const msg = `Hello! I want to order:

Product: ${product.name}
Price: Rs ${product.price}

Name: ${customerName.trim()}
Address: ${customerAddress.trim() || "-"}

Sent from: ${shop?.shopName || "Shop Website"}`;

      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } finally {
      setPlacingId(null);
    }
  }

  const shopName = shop?.shopName || "Shop";
  const tagline = "Order in seconds — delivered via WhatsApp";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                ✅ Verified WhatsApp Shop
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                {loadingShop ? "Loading..." : shopName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600 md:text-base">
                {tagline}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-gray-800">
                  WhatsApp: <span className="font-bold">{shop?.whatsapp || "-"}</span>
                </div>

                <a
                  className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Customer Details */}
            <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:max-w-md">
              <div className="text-sm font-extrabold">Customer details</div>
              <div className="mt-1 text-xs text-gray-500">
                Enter once, then tap “Order” on any product.
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-gray-600">
                    Your name <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Mohamed"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-gray-600">Address (optional)</span>
                  <input
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Pottuvil, Sri Lanka"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </label>

                <div className="rounded-2xl bg-blue-50 p-3 text-xs text-blue-900">
                  ✅ Orders are sent through WhatsApp and also saved for the shop owner.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Products</h2>
            <p className="text-sm text-gray-500">
              Tap “Order” to send WhatsApp message instantly.
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
                      Fast WhatsApp ordering • No account required
                    </div>
                  </div>

                  <button
                    onClick={() => placeOrder(p)}
                    disabled={placingId === p.id}
                    className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {placingId === p.id ? "Placing..." : "🛒 Order on WhatsApp"}
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

      {/* Sticky WhatsApp */}
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
