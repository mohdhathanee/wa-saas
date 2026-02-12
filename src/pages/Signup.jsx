import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [shopName, setShopName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    // ✅ Strong password: 6–8 chars, must include letters + numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/;
    if (!passwordRegex.test(pw)) {
      setErr("Password must be 6–8 characters and include both letters and numbers.");
      setBusy(false);
      return;
    }

    try {
      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      const shopId = cred.user.uid;

      // 2) Create shop document
      await setDoc(doc(db, "shops", shopId), {
        ownerUid: shopId,
        shopName: shopName.trim(),
        whatsapp: whatsapp.trim(),
        createdAt: serverTimestamp(),
      });

      // 3) Send email verification
      await sendEmailVerification(cred.user);

      // 4) Go to verify page
      nav("/verify");
    } catch (e2) {
      // ✅ Friendly errors
      let message = "Account creation failed.";

      if (e2.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (e2.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (e2.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (e2.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      }

      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-extrabold">Start your shop 🚀</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create your WhatsApp commerce store
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input
            className="rounded-xl border px-4 py-2"
            placeholder="Shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />

          <input
            className="rounded-xl border px-4 py-2"
            placeholder="WhatsApp number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />

          <input
            className="rounded-xl border px-4 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />

          <input
            className="rounded-xl border px-4 py-2"
            placeholder="Password (6–8 chars, letters + numbers)"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            required
          />

          <button
            className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Creating..." : "Create Shop"}
          </button>

          {err && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {err}
            </div>
          )}
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
