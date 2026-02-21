"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { X, Mail, Lock, User, Loader2, ArrowRight, Brain, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
    const [view, setView] = useState<"options" | "email">("options");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState<"google" | "email" | null>(null);
    const [error, setError] = useState("");
    const overlayRef = useRef<HTMLDivElement>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(defaultMode);
            setView("options");
            setName(""); setEmail(""); setPassword("");
            setError(""); setIsLoading(null); setShowPassword(false);
        }
    }, [isOpen, defaultMode]);

    // Escape to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setIsLoading("google");
        await signIn("google", { callbackUrl: "/learn" });
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) return;
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

        setIsLoading("email");
        const result = await signIn("credentials", {
            email,
            password,
            name,
            isSignUp: String(mode === "signup"),
            redirect: false,
            callbackUrl: "/learn",
        });
        setIsLoading(null);

        if (result?.error) {
            if (result.error === "EMAIL_EXISTS") setError("An account with this email already exists. Sign in instead.");
            else if (result.error === "NO_ACCOUNT") setError("No account found. Sign up first.");
            else if (result.error === "WRONG_PASSWORD") setError("Incorrect password. Try again.");
            else setError("Something went wrong. Please try again.");
        } else if (result?.ok) {
            window.location.href = "/learn";
        }
    };

    const switchMode = (m: "signin" | "signup") => {
        setMode(m); setView("options"); setError("");
        setEmail(""); setPassword(""); setName("");
    };

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
            {/* Modal Card */}
            <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                {/* Glow */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/20 blur-sm" />

                <div className="relative rounded-2xl bg-[#0B0B14] border border-white/10 shadow-2xl overflow-hidden">
                    {/* Top gradient bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="px-8 py-8">
                        {/* Logo + Title */}
                        <div className="flex flex-col items-center mb-7">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {view === "email"
                                    ? mode === "signin" ? "Sign in with Email" : "Create your account"
                                    : mode === "signin" ? "Welcome back" : "Create account"}
                            </h2>
                            <p className="text-sm text-slate-400 text-center">
                                {view === "email"
                                    ? mode === "signin" ? "Enter your credentials to continue" : "Fill in the details below to get started"
                                    : mode === "signin" ? "Sign in to continue your learning journey" : "Start your personalized learning journey"}
                            </p>
                        </div>

                        {view === "options" ? (
                            /* ─── Option picker ─── */
                            <div className="space-y-3">
                                {/* Google */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading !== null}
                                    className="w-full flex items-center gap-3 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-900 font-semibold rounded-xl px-4 py-3.5 text-sm transition-all shadow-md hover:shadow-lg"
                                >
                                    {isLoading === "google" ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-600" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="flex-1 text-center">
                                                {mode === "signin" ? "Continue with Google" : "Sign up with Google"}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-1">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-xs text-slate-500 font-medium">or</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                {/* Email + Password */}
                                <button
                                    onClick={() => setView("email")}
                                    className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-slate-200 font-semibold rounded-xl px-4 py-3.5 text-sm transition-all"
                                >
                                    <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    <span className="flex-1 text-center">
                                        {mode === "signin" ? "Continue with Email" : "Sign up with Email"}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            /* ─── Email + Password Form ─── */
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                {/* Name field — only for sign up */}
                                {mode === "signup" && (
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Full name"
                                            autoFocus
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        required
                                        autoFocus={mode === "signin"}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Password"}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading === "email"}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-lg shadow-purple-600/25"
                                >
                                    {isLoading === "email" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {mode === "signin" ? "Sign in" : "Create account"}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setView("options"); setError(""); }}
                                    className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-1"
                                >
                                    ← Back to options
                                </button>
                            </form>
                        )}

                        {/* Mode toggle */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500">
                                {mode === "signin" ? (
                                    <>Don&apos;t have an account?{" "}
                                        <button onClick={() => switchMode("signup")} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                            Sign up free
                                        </button>
                                    </>
                                ) : (
                                    <>Already have an account?{" "}
                                        <button onClick={() => switchMode("signin")} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Footer */}
                        <p className="mt-4 text-center text-[11px] text-slate-600">
                            By continuing, you agree to our{" "}
                            <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
                            {" & "}
                            <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
