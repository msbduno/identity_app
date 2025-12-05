"use client";

import { useState } from "react";
import { login } from "@/lib/api";
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
            const data = await login(email, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem("tokenExpiry", data.expiresAt);
            setMsg(" Connexion réussie !");
            setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: any) {
            setMsg(err.message || "Email ou mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 border dark:border-gray-700"
            >
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Connexion
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="rounded-lg bg-green-600 p-3 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                        S'inscrire
                    </Link>
                </p>
            </form>
        </div>
    );
}