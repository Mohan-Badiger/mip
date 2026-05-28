"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";

export function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-cream px-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1.5">
            Admin Portal
          </span>
          <h1 className="text-2xl font-bold tracking-wider text-text-dark uppercase">
            MIP Atelier
          </h1>
          <p className="text-xs text-[#736B66] mt-2 leading-relaxed max-w-xs mx-auto">
            Sign in with your administrative credentials to access the management console.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#DED8D0] shadow-sm p-8">
          {/* Gold accent bar */}
          <div className="h-1 bg-linear-to-r from-brand-brown via-brand-gold to-brand-brown -mt-8 -mx-8 mb-7" />

          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 flex items-start gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] tracking-widest text-text-dark uppercase font-bold block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mip.com"
                  autoComplete="email"
                  className="w-full text-sm pl-10 pr-4 py-3 border border-[#DED8D0] bg-bg-cream/40 focus:outline-none focus:border-brand-gold text-text-dark transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-widest text-text-dark uppercase font-bold block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full text-sm pl-10 pr-12 py-3 border border-[#DED8D0] bg-bg-cream/40 focus:outline-none focus:border-brand-gold text-text-dark transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736B66] hover:text-text-dark transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-text-dark hover:bg-[#2C2C2C] text-bg-cream py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Sign In to Console
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#DED8D0]/60 text-center">
            <span className="text-[10px] text-[#736B66] block">
              Protected by MIP Security Layer. Contact the Super Admin for credentials.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
