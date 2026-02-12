import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import AppShell from "../components/AppShell";
import { Link } from "react-router-dom";

/** Normal text/number input */
function Input({ label, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <input
        {...props}
        className="rounded-xl border bg-white px-4 py-2 text-sm outline-none focus:border-blue-400"
      />
    </label>
  );
}

/** File input for product image */
function FileInput({ label, onChange }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="block w-full rounded-xl border bg-white px-4 py-2 text-sm"
        required
      />
      <span className="text-xs text-gray-500">JPG/PNG/WebP, max 2MB</span>
    </label>
  );
}

function Button({ variant = "primary", ...props }) {
  const cls =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-gray-100 text-gray-900 hover:bg-gray-200";

  return (
    <button
      {...props}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${cls} disabled:opacity-60`}
    />
  );
}

export default function Products() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const publicUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}#/shop/${user.uid}`,
    [user.uid]
  );

  useEffect(() => {
    const q = query(
      collection(db, "shops", user.uid, "products"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setErr(e.message)
    );

    return () => unsub();
  }, [user.uid]);

  async function addProduct(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      if (!name.trim()) {
        setErr("Please enter product name.");
        setBusy(false);
        return;
      }

      if (!price || Number(price) <= 0) {
        setErr("Please enter a valid price.");
        setBusy(false);
        return;
      }

      if (!file) {
        setErr("Please select an image.");
        setBusy(false);
        return;
      }

      // ✅ Limit file size to 2MB
      if (file.size > 2097152) {
        setErr("Image must be less than 2MB.");
        setBusy(false);
        return;
      }

      // ✅ Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "wa_saas_products"); // your preset name
      formData.append("folder", "wa-saas-products");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dfbcdzbkv/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error(data?.error?.message || "Image upload failed. Try again.");
      }

      // ✅ Save product
      await addDoc(collection(db, "shops", user.uid, "products"), {
        name: name.trim(),
        price: Number(price),
        imageUrl: data.secure_url,
        active: true,
        createdAt: serverTimestamp(),
      });

      // ✅ Reset form
      setName("");
      setPrice("");
      setFile(null);
    } catch (e2) {
      setErr(e2.message || "Failed to add product.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(id) {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "shops", user.uid, "products", id));
  }

  async function toggleActive(p) {
    await updateDoc(doc(db, "shops", user.uid, "products", p.id), {
      active: !p.active,
    });
  }

  return (
    <AppShell
      title="Products"
      subtitle="Add products and publish them to your public shop."
      actions={
        <>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Open Shop
          </a>
          <Link
            to="/dashboard"
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
          >
            Back
          </Link>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Add form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-extrabold">Add a product</div>
          <div className="mt-1 text-xs text-gray-500">
            Upload a clean image from your phone/PC.
          </div>

          <form onSubmit={addProduct} className="mt-4 grid gap-3">
            <Input
              label="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Price (LKR)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              required
            />

            <FileInput
              label="Product Image"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button disabled={busy}>{busy ? "Adding..." : "Add product"}</Button>
            {err && <p className="text-sm text-red-600">{err}</p>}
          </form>

          <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-xs text-blue-900">
            Your public shop link is live:{" "}
            <span className="font-semibold break-all">{publicUrl}</span>
          </div>
        </div>

        {/* Product list */}
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-extrabold">Your products</div>
              <div className="text-xs text-gray-500">
                Toggle active to show/hide on public shop.
              </div>
            </div>
            <div className="text-xs text-gray-500">{items.length} items</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="relative">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                  <span
                    className={
                      "absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-bold " +
                      (p.active ? "bg-green-600 text-white" : "bg-gray-900 text-white")
                    }
                  >
                    {p.active ? "ACTIVE" : "HIDDEN"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-extrabold">{p.name}</div>
                  <div className="text-sm text-gray-700">Rs {p.price}</div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => toggleActive(p)}
                  >
                    {p.active ? "Hide" : "Publish"}
                  </Button>
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => removeProduct(p.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              No products yet. Add your first product on the left.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
