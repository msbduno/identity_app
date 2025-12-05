"use client";

import { useState } from "react";
import { register } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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
            await register(email, password);
            setMsg("✅ Inscription réussie ! Redirection...");
            setTimeout(() => router.push("/login"), 1500);
        } catch (err: any) {
            setMsg(err.message || "Erreur d'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 border dark:border-gray-700"
            >
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Créer un compte
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Inscription..." : "S'inscrire"}
                </button>

                {msg && (
                    <p className={`text-center text-sm ${msg.includes("✅") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {msg}
                    </p>
                )}

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Se connecter
                    </Link>
                </p>
            </form>
        </div>
    );
}
