import Link from 'next/link';

interface FeatureCardProps {
    number: string;
    title: string;
    description: string;
}

interface WorkflowStepProps {
    number: string;
    title: string;
    description: string;
}

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg"></div>
                        <span className="text-gray-600 text-lg font-semibold">AuthSecure</span>
                    </div>
                    <a
                        href="https://github.com/msbduno/identity_app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                        GitHub →
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <div className="space-y-6">
                    <div className="inline-block px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-full">
                        Projet cryptographique
                    </div>

                    <h1 className="text-gray-900 md:text-7xl font-bold tracking-tight leading-tight">
                        Authentification
                        <br />
                        <span className="text-gray-200">Multi-Facteurs</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Authentification multi-facteurs (MFA) combinant mot de passe et cryptographie RSA
                        avec challenge-response pour une sécurité maximale.
                    </p>

                    <div className="flex gap-4 pt-8">
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg hover: text-white bg-gray-800 transition-colors"
                        >
                            Tester l'application
                        </Link>
                        <a
                            href="#details"
                            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                        >
                            En savoir plus
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-4xl mx-auto px-6 py-24 border-t border-gray-100">
                <div className="grid md:grid-cols-3 gap-12">
                    <FeatureCard
                        number="01"
                        title="Cryptographie RSA"
                        description="Génération de paires de clés côté client pour une authentification asymétrique"
                    />
                    <FeatureCard
                        number="02"
                        title="MFA (2 Facteurs)"
                        description="Mot de passe + signature RSA pour double vérification"
                    />
                    <FeatureCard
                        number="03"
                        title="Sessions Sécurisées"
                        description="Tokens de session avec expiration automatique"
                    />
                </div>
            </section>

            {/* Workflow */}
            <section id="details" className="max-w-4xl mx-auto px-6 py-24 border-t border-gray-100">
                <div className="mb-16">
                    <h2 className="text-gray-800 text-4xl font-bold mb-4">Workflow </h2>
                    <p className="text-gray-600">Authentification multi-facteurs en quatre étapes</p>
                </div>

                <div className="space-y-12">
                    <WorkflowStep
                        number="01"
                        title="Inscription"
                        description="Le client génère une paire de clés RSA-2048 (via Web Crypto API). La clé publique est envoyée au serveur avec l'email et le mot de passe. Le serveur hache le mot de passe avec BCrypt et stocke email + hash + clé publique dans PostgreSQL. La clé privée reste dans le navigateur (localStorage)."
                    />
                    <WorkflowStep
                        number="02"
                        title="Validation Password "
                        description="Le client envoie email + mot de passe au serveur. Le serveur vérifie avec BCrypt que le mot de passe correspond au hash stocké. Si correct, le serveur génère un token temporaire aléatoire et le stocke dans Redis. Ce token prouve que le 1er facteur (password) est validé."
                    />
                    <WorkflowStep
                        number="03"
                        title="Challenge + Signature "
                        description="Le client envoie le token temporaire au serveur qui génère un challenge aléatoire de 32 bytes (stocké dans Redis). Le client récupère sa clé privée, signe le challenge avec l'algorithme RSASSA-PKCS1-v1_5 et envoie la signature. Le serveur vérifie la signature avec la clé publique (SHA256withRSA) et consomme le challenge (usage unique)."
                    />
                    <WorkflowStep
                        number="04"
                        title="Authentification Complète"
                        description="Les deux facteurs sont validés : password  (connaissance) et signature RSA (possession). Le serveur génère un JWT signé avec HMAC256 contenant email, rôle et expiration (24h). Le JWT est envoyé au client qui l'utilise pour accéder aux APIs protégées. Le serveur valide chaque requête en vérifiant la signature JWT sans accès à la base de données (stateless)."
                    />
                </div>
            </section>

            {/* Context */}
            <section className="max-w-4xl mx-auto px-6 py-24 border-t border-gray-100">
                <div className="space-y-8">
                    <h3 className="text-gray-800 text-3xl font-bold">Contexte</h3>

                    <p className="text-gray-600 leading-relaxed">
                        Projet développé dans le cadre d'une candidature chez <span className="text-black font-medium">iDAKTO Angers</span>,
                        entreprise spécialisée dans les solutions d'identité numérique.
                    </p>

                    <div className="pt-6">
                        <p className="text-sm font-medium text-gray-900 mb-4">Concepts explorés</p>
                        <div className="flex flex-wrap gap-2">
                            {['MFA', 'Hash BCrypt', 'RSA-2048', 'Challenge-Response', 'Redis', 'Web Crypto API'].map((concept, i) => (
                                <span key={i} className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-full">
                  {concept}
                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 mt-24">
                <div className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-gray-500">
                    AuthSecure — V.1 2025 — Mathis BOSSARD
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ number, title, description }: FeatureCardProps) {
    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-gray-400">{number}</div>
            <h3 className="text-gray-600 text-xl font-semibold">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function WorkflowStep({ number, title, description }: WorkflowStepProps) {
    return (
        <div className="flex gap-8 items-start">
            <div className="text-sm font-medium text-gray-400 pt-1 w-12">{number}</div>
            <div className="flex-1 space-y-2">
                <h4 className="text-gray-600 text-xl font-semibold">{title}</h4>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}