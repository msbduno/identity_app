"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function DashboardPage() {
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
                // Redirection après 2 secondes si erreur
                setTimeout(() => {
                    localStorage.removeItem("token");
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
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                    <p className="text-red-600 dark:text-red-400 text-lg mb-4"> {error}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Redirection vers login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-6 border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Bienvenue sur votre espace personnel
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Informations du compte
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{userEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                🛡️
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rôle</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{userRole}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}