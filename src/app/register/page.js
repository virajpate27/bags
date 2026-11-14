
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Store, UserRound, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/buyer/dashboard",
      });

      if (authError) {
        setError(authError.message || "Registration failed.");
        return;
      }

      if (process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === "true") {
        setRegisteredEmail(email);
        return;
      }

      router.push("/buyer/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendMessage("");
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: registeredEmail,
        callbackURL: "/buyer/dashboard",
      });
      setResendMessage(resendError ? (resendError.message || "Unable to resend the email.") : "If the address is registered, a verification email has been sent.");
    } catch {
      setResendMessage("Unable to resend the verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  if (registeredEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Link href="/" className="text-2xl font-bold text-slate-900">Trade<span className="text-amber-500">Bridge</span></Link>
          <h1 className="mt-8 text-2xl font-bold text-slate-900">Verify your email</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">We have created your account request. Check <strong>{registeredEmail}</strong> for a verification link before logging in. The link expires in one hour.</p>
          <button type="button" onClick={resendVerification} disabled={resendLoading} className="mt-6 w-full rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">{resendLoading ? "Sending..." : "Resend verification email"}</button>
          {resendMessage && <p role="status" className="mt-3 text-sm text-slate-600">{resendMessage}</p>}
          <p className="mt-6 text-center text-sm text-slate-500">Already verified? <Link href="/login" className="font-semibold text-amber-600">Login</Link></p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <Link href="/" className="text-2xl font-bold text-slate-900">
          Trade<span className="text-amber-500">Bridge</span>
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-slate-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Join TradeBridge and start connecting with businesses.
        </p>

        {error && (
          <div role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              required
              type="password"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <UserRound className="mx-auto text-slate-600" size={20} />
            <p className="mt-2 text-xs font-medium">Buyer account</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <Store className="mx-auto text-slate-600" size={20} />
            <p className="mt-2 text-xs font-medium">Seller account</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
