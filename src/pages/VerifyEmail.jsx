import React, { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const nav = useNavigate();
  const user = auth.currentUser;

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If user is not logged in, go login
    if (!user) nav("/login");
    // If already verified, go dashboard
    if (user?.emailVerified) nav("/dashboard");
  }, [user, nav]);

  async function resend() {
    setMsg("");
    setBusy(true);
    try {
      if (!auth.currentUser) return nav("/login");
      await sendEmailVerification(auth.currentUser);
      setMsg("✅ Verification email sent again. Please check inbox/spam.");
    } catch (e) {
      setMsg("❌ " + (e?.message || "Failed to send email."));
    } finally {
      setBusy(false);
    }
  }

  async function iVerified() {
    setMsg("");
    setBusy(true);
    try {
      // Reload user from Firebase
      await auth.currentUser?.reload();

      if (auth.currentUser?.emailVerified) {
        nav("/dashboard");
      } else {
        setMsg("Not verified yet. Please click the link in your email, then try again.");
      }
    } catch (e) {
      setMsg("❌ " + (e?.message || "Failed to refresh status."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-extrabold">Verify your email ✉️</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a verification link to:
          <span className="ml-1 font-semibold">{user?.email || "your email"}</span>
        </p>

        <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-xs text-blue-900">
          Check your inbox and also <b>Spam</b>. Click the link, then come back here.
        </div>

        <div className="mt-6 grid gap-3">
          <button
            onClick={iVerified}
            disabled={busy}
            className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Checking..." : "✅ I verified, continue"}
          </button>

          <button
            onClick={resend}
            disabled={busy}
            className="rounded-xl bg-gray-100 py-2 font-semibold text-gray-900 hover:bg-gray-200 disabled:opacity-60"
          >
            Resend verification email
          </button>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
