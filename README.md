# AuthSecure - Identity App

**Application d'authentification sécurisée**
- Authentification Multi-Facteurs (MFA) avec Cryptographie RSA et JWT


---
## Démonstration


https://github.com/user-attachments/assets/f87410cd-efcf-4454-a7c4-3d617faa526e


---
## Structure du projet

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend    │         │   Storage   │
│  (Next.js)  │ ◄─────► │ (Spring Boot)│ ◄─────► │ PostgreSQL  │
│             │  HTTPS  │              │         │   + Redis   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      ▼                        ▼
 Web Crypto API         RSA Verification
 - Génération clés      - SHA256withRSA
 - Signature PKCS1      - JWT (HMAC256)
 - localStorage         - BCrypt (password)
```

##  Architecture 

```
identity_app/
├── backend/
│   ├── src/main/java/com/indentity/identity_app/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       # Configuration Spring Security
│   │   │   ├── RedisConfig.java          # Configuration Redis
│   │   │   └── WebConfig.java
│   │   ├── controller/
│   │   │   └── AuthController.java       # Endpoints d'authentification
│   │   ├── dto/
│   │   │   ├── RegisterRequest.java
│   │   │   ├── ChallengeRequest.java
│   │   │   ├── ChallengeResponse.java
│   │   │   ├── AuthenticateRequest.java
│   │   │   └── JwtResponse.java
│   │   ├── entity/
│   │   │   └── User.java                 # Entité avec champ publicKey
│   │   ├── filter/
│   │   │   └── JwtAuthenticationFilter.java  # Filtre de validation JWT
│   │   ├── service/
│   │   │   ├── AuthService.java          # Logique d'authentification
│   │   │   ├── ChallengeService.java     # Gestion des challenges Redis
│   │   │   ├── SignatureService.java     # Vérification des signatures RSA
│   │   │   └── JwtService.java           # Génération/validation JWT
│   │   └── repository/
│   └── pom.xml
├── frontend/
│   ├── app/
│   ├── lib/
│   └── package.json
├── docs/
│   ├── RSA_AUTHENTICATION_WORKFLOW.md    # Documentation complète
│   └── crypto-utils.ts                    # Utilitaires client RSA
└── docker-compose.yml
```

### Stack technique 

### Cryptographie

| Technologie | Usage | Algorithme |
|-------------|-------|------------|
| **RSA** | Signature asymétrique | RSASSA-PKCS1-v1_5, SHA-256, 2048-bit |
| **BCrypt** | Hash passwords | Salt unique, work factor 10 |
| **JWT** | Tokens session | HMAC256, claims (email, role, exp) |
| **Web Crypto API** | Génération clés client | SubtleCrypto (navigateur) |

### Backend
- Spring Boot 3.4.1 (Java 17)
- Spring Security + JWT (com.auth0:java-jwt)
- PostgreSQL (persistance utilisateurs)
- Redis (tokens temporaires + challenges)
- BCrypt (hachage passwords)

### Frontend

- **Next.js 15** : Framework React avec SSR
- **TypeScript** : Typage statique
- **TailwindCSS** : Styles utility-first
- **Web Crypto API** : Cryptographie navigateur

### Infrastructure

- **Docker Compose**

---

##  Installation

### Prérequis

- Docker & Docker Compose
- (Optionnel) Java 17+ pour développement local
- (Optionnel) Node.js 18+ pour développement local

### Lancer l'application

```bash
# Cloner le repository
git clone https://github.com/msbduno/identity_app.git
cd identity_app

# Démarrer tous les services
docker-compose up --build

# Ou pour reconstruire depuis zéro
docker-compose down -v
docker-compose up --build
```

**Services démarrés** :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8080
- PostgreSQL : localhost:5433
- Redis : localhost:6380
---


##  API Endpoints

### Publics (non authentifiés)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | `{ email, password, publicKey }` |
| POST | `/auth/login` | MFA Step 1 - Valide password | `{ email, password }` |
| POST | `/auth/challenge` | MFA Step 2 - Génère challenge | `{ temporaryToken }` |
| POST | `/auth/authenticate` | MFA Step 3 - Valide signature | `{ temporaryToken, challenge, signature }` |

### Protégés (JWT requis)

| Méthode | Endpoint | Description | Header |
|---------|----------|-------------|--------|
| GET | `/auth/me` | Infos utilisateur | `Authorization: Bearer <JWT>` |

### Exemples

**Register** :
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "publicKey": "MIIBIjANBgkqhki...Base64..."
}

→ 200 OK "User registered"
```

**Login MFA** :
```bash
# Step 1
POST /auth/login
{ "email": "user@example.com", "password": "SecurePass123!" }
→ { "temporaryToken": "abc123..." }

# Step 2
POST /auth/challenge
{ "temporaryToken": "abc123..." }
→ { "challenge": "xyz789..." }

# Step 3
POST /auth/authenticate
{
  "temporaryToken": "abc123...",
  "challenge": "xyz789...",
  "signature": "def456...Base64Signature..."
}
→ { "token": "eyJhbGciOiJIUzI1NiIs..." }
```

**Accès protégé** :
```bash
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

→ {
  "email": "user@example.com",
  "role": "USER"
}
```

## Principes de sécurité

### 1. **Multi-Factor Authentication (MFA)**

Deux facteurs indépendants requis pour l'authentification :

| Facteur | Type | Protection |
|---------|------|------------|
| **Mot de passe** | Connaissance | Haché avec BCrypt (salt unique) |
| **Clé privée RSA** | Possession | Stockée localement (Web Crypto API) |

**Avantages** :
-  Vol d'ordinateur → Attaquant a la clé RSA mais **pas le mot de passe**
-  Vol de password → Attaquant a le mot de passe mais **pas la clé RSA**
-  Les deux facteurs nécessaires pour authentification réussie

### 2. **Cryptographie asymétrique RSA**

```
Inscription                    Authentification
───────────                   ────────────────
Client génère                 Client signe
paire RSA-2048                challenge avec
  │                           clé privée
  ├─ Clé publique  ──────►   (RSASSA-PKCS1-v1_5)
  │  envoyée serveur              │
  │                               ▼
  └─ Clé privée                Serveur vérifie
     reste locale              avec clé publique
                               (SHA256withRSA)
```

**Sécurité** :
- La clé privée ne quitte **jamais** le navigateur
- Impossible de forger une signature sans la clé privée
- Algorithme : RSASSA-PKCS1-v1_5 avec SHA-256 (2048-bit)

### 3. **Token temporaire (5 minutes)**

Sert de preuve que le mot de passe a déjà été validé :

```
POST /login → Valide password → temporaryToken (Redis, 5min TTL)
                                       ↓
                         Utilisé pour demander challenge
                                       ↓
                         Consommé après authentification (usage unique)
```

**Pourquoi nécessaire ?**
- Empêche les attaques par force brute sur les signatures RSA
- Garantit que l'utilisateur a validé le 1er facteur (password)
- Fenêtre d'attaque très courte (5 minutes)

### 4. **Challenge-Response (2 minutes)**

```
1. Client → POST /challenge (avec temporaryToken)
2. Serveur → Génère challenge aléatoire (32 bytes, Base64)
3. Redis → Stocke challenge:email (TTL 2 min)
4. Client → Signe challenge avec clé privée RSA
5. Serveur → Vérifie signature + consomme challenge (usage unique)
```


### 5. **JWT Stateless (24 heures)**

Après MFA réussi, serveur génère un JWT :

```json
{
  "iss": "identity-app",
  "sub": "user@example.com",
  "role": "USER",
  "iat": 1733746400,
  "exp": 1733832800
}
```

**Avantages JWT vs SessionToken** :
-  Pas de requête DB pour chaque validation
- Scalabilité horizontale (stateless)
- Microservices-ready
-  Data embarqués (email, role, expiration)

---

##  Workflow MFA

### Inscription (Register)

```
1. Client génère paire RSA (Web Crypto API)
   ├─ publicKey (SPKI, Base64) → envoyée au serveur
   └─ privateKey (JWK) → stockée localStorage

2. Serveur stocke :
   ├─ email
   ├─ password (BCrypt hash)
   └─ publicKey (pour future vérification signature)
```

### Authentification (Login MFA)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1 : Validation Password                               │
│  POST /auth/login                                            │
│  ➜ { email, password }                                      │
│  ✓ Serveur vérifie BCrypt.matches()                         │
│  ← { temporaryToken } (Redis, 5min TTL)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2 : Challenge Cryptographique                         │
│  POST /auth/challenge                                        │
│  ➜ { temporaryToken }                                       │
│  ✓ Serveur valide temporaryToken                            │
│  ✓ Génère challenge aléatoire (32 bytes)                    │
│  ← { challenge } (Redis, 2min TTL)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3 : Signature RSA                                     │
│  Client signe challenge avec clé privée                      │
│  POST /auth/authenticate                                     │
│  ➜ { temporaryToken, challenge, signature }                │
│  ✓ Serveur consomme temporaryToken (usage unique)           │
│  ✓ Serveur consomme challenge (usage unique)                │
│  ✓ Vérifie signature RSA avec publicKey                     │
│  ← { token: JWT } (24h expiration)                          │
└─────────────────────────────────────────────────────────────┘
```





