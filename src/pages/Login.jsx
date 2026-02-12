import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav("/dashboard");
    } catch (e2) {
  let message = "Login failed. Please try again.";

  if (e2.code === "auth/user-not-found") {
    message = "No account found with this email.";
  } else if (e2.code === "auth/wrong-password") {
    message = "Incorrect password.";
  } else if (e2.code === "auth/invalid-email") {
    message = "Invalid email format.";
  } else if (e2.code === "auth/invalid-credential") {
    message = "Incorrect email or password.";
  }

  setErr(message);

  
} finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-extrabold">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-gray-500">
          Login to manage your WhatsApp shop
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
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
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            required
          />

          <button
            className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
            disabled={busy}
          >
            {busy ? "Logging in..." : "Login"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <p className="mt-6 text-sm text-gray-600">
          New here?{" "}
          <Link className="font-semibold text-blue-600" to="/signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
