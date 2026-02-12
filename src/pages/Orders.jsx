import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import AppShell from "../components/AppShell";
import { Link } from "react-router-dom";

const badge = (status) => {
  if (status === "new") return "bg-blue-600 text-white";
  if (status === "processing") return "bg-amber-500 text-white";
  if (status === "completed") return "bg-green-600 text-white";
  return "bg-gray-900 text-white";
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const publicUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}#/shop/${user.uid}`,
    [user.uid]
  );

  useEffect(() => {
    const q = query(
      collection(db, "shops", user.uid, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user.uid]);

  async function updateStatus(id, status) {
    await updateDoc(doc(db, "shops", user.uid, "orders", id), { status });
  }

  return (
    <AppShell
      title="Orders"
      subtitle="Track customer orders in one place."
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="mt-1 text-2xl font-extrabold">{orders.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">New</div>
          <div className="mt-1 text-2xl font-extrabold">
            {orders.filter((o) => o.status === "new").length}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Completed</div>
          <div className="mt-1 text-2xl font-extrabold">
            {orders.filter((o) => o.status === "completed").length}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-extrabold">Recent orders</div>
          <div className="text-xs text-gray-500">Click to update status</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{o.productName}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.customerAddress || "-"}</td>
                  <td className="px-4 py-3">Rs {o.price}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${badge(o.status)}`}>
                      {o.status || "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(o.id, "processing")}
                        className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600"
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => updateStatus(o.id, "completed")}
                        className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                      >
                        Completed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No orders yet. Place an order from the public shop to test.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
