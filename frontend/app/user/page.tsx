"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import Link from "next/link";

export default function UserPage() {
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        getCurrentUser(token)
            .then((data) => {
                setUserEmail(data.email);
                setUserRole(data.role || "USER");
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
                setTimeout(() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("tokenExpiry");
                    router.push("/login");
                }, 2000);
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-neutral-400">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center bg-neutral-900 border border-neutral-800 p-8 rounded-xl max-w-md">
                    <p className="text-red-400 text-lg mb-4">⚠ {error}</p>
                    <p className="text-sm text-neutral-500">Redirection vers login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            {/* Header */}
            <header className="border-b border-neutral-800">
                <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                        <span className="text-neutral-400 text-lg font-semibold">AuthSecure</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        Déconnexion →
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 pt-20 pb-24">
                <div className="space-y-8">
                    {/* Title Section */}
                    <div className="space-y-2">
                        <div className="inline-block px-3 py-1 text-xs font-medium text-neutral-400 border border-neutral-800 rounded-full mb-4">
                            Utilisateur
                        </div>
                        <h1 className="text-5xl font-bold text-white">Mon espace</h1>
                        <p className="text-xl text-neutral-400">Bienvenue sur votre tableau de bord personnel</p>
                    </div>

                    {/* User Info Card */}
                    <div className="border border-neutral-800 rounded-xl p-8 space-y-6">
                        <h2 className="text-2xl font-semibold text-white">Informations du compte</h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                                    {userEmail.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-neutral-500 mb-1">Email</p>
                                    <p className="text-lg font-medium text-white">{userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-neutral-500 mb-1">Rôle</p>
                                    <p className="text-lg font-medium text-white">{userRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Features */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Profil</h3>
                            <p className="text-sm text-neutral-400">Gérer vos informations personnelles</p>
                        </div>
                        <div className="border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Sécurité</h3>
                            <p className="text-sm text-neutral-400">Changer votre mot de passe</p>
                        </div>
                        <div className="border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Activité</h3>
                            <p className="text-sm text-neutral-400">Voir l'historique de connexion</p>
                        </div>
                        <div className="border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Préférences</h3>
                            <p className="text-sm text-neutral-400">Personnaliser votre expérience</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}