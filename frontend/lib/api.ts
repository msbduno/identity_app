export const API_URL = "http://localhost:8080/auth";

interface LoginResponse {
    token: string;
    expiresAt: string;
}

interface UserResponse {
    email: string;
    role: string;
}

export async function register(email: string, password: string) {
    const res = await fetch(`${API_URL}/register`, {  // FIX: Remplacé les backticks
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
    }

    return res.text();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/login`, {  // FIX: Remplacé les backticks
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
    }

    return res.json();
}

export async function getCurrentUser(token: string): Promise<UserResponse> {
    const res = await fetch(`${API_URL}/me`, { // ← Devient /auth/me
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        throw new Error("Unauthorized");
    }

    return res.json();
}