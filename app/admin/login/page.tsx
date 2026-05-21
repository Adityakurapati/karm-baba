"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading && user?.role === 'admin') {
      router.push("/admin");
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirection is handled by the useEffect
      } else {
        setError("Invalid administrative credentials. Please verify your access level.");
      }
    } catch (err) {
      setError("An error occurred during authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-primary/20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[480px] z-10 animate-scale-in">
        <div className="bg-surface-container-lowest p-10 rounded-[32px] border border-outline-variant/10 shadow-2xl relative overflow-hidden">
          {/* Logo/Brand Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-6 group transition-transform hover:scale-105 duration-300">
              <span className="material-symbols-outlined notranslate text-white text-3xl" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
            </div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">KARM BABA</h1>
            <p className="text-on-surface-variant font-medium tracking-tight uppercase text-[10px] opacity-70">Executive Access Gate</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold border border-error/10 animate-slide-in-down flex items-center gap-3">
                <span className="material-symbols-outlined notranslate text-lg" translate="no">error</span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Email Identifier</label>
                <div className="relative group">
                  <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-xl" translate="no">alternate_email</span>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-on-surface-variant/30"
                    placeholder="admin@karmbaba.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Secure Token</label>
                <div className="relative group">
                  <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-xl" translate="no">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-on-surface-variant/30"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined notranslate text-xl" translate="no">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-4 flex items-center justify-center gap-3 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">{loading ? "Authenticating..." : "Authorize Access"}</span>
              {!loading && <span className="material-symbols-outlined notranslate relative z-10 text-lg" translate="no">arrow_forward</span>}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-10 pt-8 border-t border-outline-variant/5 text-center">
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Restricted Infrastructure • 2026</p>
          </div>
        </div>
        
        <p className="text-center mt-6 text-xs font-bold text-on-surface-variant/40">
          Return to <a href="/" className="text-primary/60 hover:text-primary transition-colors hover:underline">Public Gateway</a>
        </p>
      </div>
    </div>
  );
}
