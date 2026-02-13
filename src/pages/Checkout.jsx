import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../cart/CartProvider";

function makeOrderCode() {
  // Example: MB-482931
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MB-${n}`;
}

function normalizePhone(s) {
  return String(s || "").replace(/[^\d]/g, "");
}

export default function Checkout() {
  const { shopId } = useParams();
  const nav = useNavigate();
  const { items, total, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const orderCode = useMemo(() => makeOrderCode(), []);
  const cleanPhone = useMemo(() => normalizePhone(phone), [phone]);

  const message = useMemo(() => {
    const lines = [];
    lines.push("Hi, I want to confirm my order.");
    lines.push("");
    lines.push(`Order Code: ${orderCode}`);
    lines.push(`Name: ${name || "-"}`);
    lines.push(`Phone: ${cleanPhone || "-"}`);
    lines.push(`Address: ${address || "-"}`);
    if (note.trim()) lines.push(`Note: ${note.trim()}`);
    lines.push("");
    lines.push("Items:");
    items.forEach((x) => lines.push(`- ${x.name} x${x.qty} (Rs ${x.price})`));
    lines.push("");
    lines.push(`Total: Rs ${total}`);
    return lines.join("\n");
  }, [orderCode, name, cleanPhone, address, note, items, total]);

  const waLink = useMemo(() => {
    // We will use phone entered by customer for verification? No — WhatsApp should go to SHOP OWNER.
    // For now we will store order and also open WhatsApp after placing order, OR you can add shop whatsapp.
    // MVP: verify action just proves the customer can open WhatsApp + send the order code.
    // This link opens WhatsApp "New chat" without number (works on many phones) using wa.me/?text=
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [message]);

  async function placeOrder() {
    setErr("");

    if (items.length === 0) return setErr("Your cart is empty.");
    if (!name.trim()) return setErr("Please enter your full name.");
    if (cleanPhone.length < 9) return setErr("Please enter a valid phone number.");
    if (!address.trim()) return setErr("Please enter your delivery address.");
    if (!verified) return setErr("Please verify via WhatsApp first.");

    setBusy(true);
    try {
      await addDoc(collection(db, "shops", shopId, "orders"), {
        orderCode,
        customerName: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        note: note.trim(),
        items: items.map((x) => ({
          id: x.id,
          name: x.name,
          price: Number(x.price),
          qty: x.qty,
          imageUrl: x.imageUrl || "",
        })),
        total: Number(total),
        status: "new",
        createdAt: serverTimestamp(),
      });

      clear();
      nav(`/shop/${shopId}?thanks=1`);
    } catch (e) {
      setErr(e?.message || "Failed to place order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl p-4">
        <div className="flex items-center justify-between">
          <Link to={`/shop/${shopId}`} className="text-sm font-semibold text-blue-600">
            ← Back to shop
          </Link>
          <div className="text-xs text-gray-500">Checkout</div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="text-lg font-extrabold">Delivery details</div>
            <div className="mt-1 text-xs text-gray-500">
              Verify via WhatsApp before placing order.
            </div>

            <div className="mt-4 grid gap-3">
              <input
                className="rounded-xl border px-4 py-2 text-sm"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-xl border px-4 py-2 text-sm"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
              <textarea
                className="rounded-xl border px-4 py-2 text-sm"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
              <input
                className="rounded-xl border px-4 py-2 text-sm"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-700">
                <div className="font-bold">Order Code: {orderCode}</div>
                <div className="mt-1 text-gray-600">
                  Click WhatsApp verify → send message → come back and place order.
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setVerified(true)}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-green-700"
                >
                  ✅ Verify via WhatsApp
                </a>

                <button
                  disabled={!verified || busy}
                  onClick={placeOrder}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busy ? "Placing..." : "Place Order"}
                </button>
              </div>

              {err && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {err}
                </div>
              )}
            </div>
          </div>

          {/* Cart summary */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="text-sm font-extrabold">Order summary</div>
            <div className="mt-3 grid gap-2">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">Your cart is empty.</div>
              ) : (
                items.map((x) => (
                  <div key={x.id} className="flex items-center justify-between text-sm">
                    <div className="font-semibold">
                      {x.name} <span className="text-gray-500">x{x.qty}</span>
                    </div>
                    <div>Rs {Number(x.price) * x.qty}</div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 border-t pt-3 flex items-center justify-between font-extrabold">
              <div>Total</div>
              <div>Rs {total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
