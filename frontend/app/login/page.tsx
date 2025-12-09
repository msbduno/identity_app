"use client";

import { useState } from "react";
import { loginWithMFA, getCurrentUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            // 1. Afficher le processus d'authentification MFA
            setMsg("Authentification multi-facteurs en cours...");
            
            // 2. Authentification MFA (password + RSA signature) → JWT
            const data = await loginWithMFA(email, password);
            localStorage.setItem("token", data.token); // JWT contient déjà l'expiration

            // 3. Récupérer les infos utilisateur (incluant le rôle)
            const userInfo = await getCurrentUser(data.token);

            setMsg("Authentification sécurisée réussie !");

            // 4. Redirection basée sur le rôle
            setTimeout(() => {
                if (userInfo.role === 'ADMIN') {
                    router.push("/admin");
                } else {
                    router.push("/user");
                }
            }, 1000);
        } catch (err: any) {
            setMsg(err.message || "Authentification échouée");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            {/* Header */}
            <header className="border-b border-neutral-800">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                        <span className="text-neutral-400 text-lg font-semibold">AuthSecure</span>
                    </Link>
                </div>
            </header>

            {/* Form Section */}
            <div className="max-w-md mx-auto px-6 pt-32 pb-24">
                <div className="space-y-8">
                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-white">Connexion</h1>
                        <p className="text-neutral-400">Authentification multi-facteurs (MFA)</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Message */}
                        {msg && (
                            <div className={`text-sm p-3 rounded-lg ${
                                msg.includes("réussie")
                                    ? "bg-green-950 text-green-400 border border-green-900"
                                    : "bg-red-950 text-red-400 border border-red-900"
                            }`}>
                                {msg}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-white text-black p-3 font-medium hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>

                        {/* Register Link */}
                        <p className="text-center text-sm text-neutral-400">
                            Pas encore de compte ?{" "}
                            <Link href="/register" className="text-white font-medium hover:underline">
                                S'inscrire
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}