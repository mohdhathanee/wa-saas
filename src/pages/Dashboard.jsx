import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import AppShell from "../components/AppShell";
import { Link } from "react-router-dom";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "shops", user.uid));
      setShop(snap.exists() ? snap.data() : null);
    })();
  }, [user.uid]);

  const publicUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}#/shop/${user.uid}`,
    [user.uid]
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Manage your WhatsApp shop like a real product."
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
          <button
            onClick={() => signOut(auth)}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Logout
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Shop Name" value={shop?.shopName || "Loading..."} />
        <StatCard label="WhatsApp" value={shop?.whatsapp || "Loading..."} hint="Used for customer orders" />
        <StatCard
          label="Next"
          value="Add products"
          hint="Then share your public link"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          to="/products"
          className="rounded-2xl border border-gray-100 bg-blue-600 p-4 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          🧺 Manage Products →
          <div className="mt-1 text-xs text-blue-100">Add images, price, and publish</div>
        </Link>

        <Link
          to="/orders"
          className="rounded-2xl border border-gray-100 bg-white p-4 font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          🧾 View Orders →
          <div className="mt-1 text-xs text-gray-500">Track new / processing / completed</div>
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Public Shop Link</div>
          <div className="mt-1 text-xs text-gray-500">Copy and share with customers</div>
          <input
            className="mt-3 w-full rounded-xl border px-3 py-2 text-sm"
            value={publicUrl}
            readOnly
          />
        </div>
      </div>
    </AppShell>
  );
}
