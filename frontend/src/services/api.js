import { mockRequest } from "./mockBackend";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    // El token sigue siendo necesario para autenticar
    // las operaciones de la billetera.
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );
    } catch {
        // El servidor no está disponible.
        // Usamos el modo demo (mock) local.
        return mockRequest(endpoint, options);
    }

    const contentType =
        response.headers.get("content-type") || "";

    // Si la respuesta no es JSON (servidor caído,
    // página de error, proxy), usamos el modo demo.
    if (!contentType.includes("application/json")) {
        return mockRequest(endpoint, options);
    }

    const data =
        await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Error en la solicitud"
        );
    }

    return data;
}

const api = {

    // ==========================================
    // AUTENTICACIÓN
    // ==========================================

    login: (datos) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify(datos)
        }),

    register: (datos) =>
        request("/auth/register", {
            method: "POST",
            body: JSON.stringify(datos)
        }),

    profile: () =>
        request("/auth/profile"),

    // ==========================================
    // BILLETERA
    // ==========================================

    transactions: () =>
        request("/wallet/transactions"),

    // ==========================================
    // RECARGA
    // ==========================================

    recharge: (datos) =>
        request("/wallet/recharge", {
            method: "POST",
            body: JSON.stringify(datos)
        }),

    // ==========================================
    // PAGO
    // ==========================================

    payment: (datos) =>
        request("/wallet/payment", {
            method: "POST",
            body: JSON.stringify(datos)
        }),

    // ==========================================
    // TRANSFERENCIA
    // ==========================================

    transfer: (datos) =>
        request("/wallet/transfer", {
            method: "POST",
            body: JSON.stringify(datos)
        }),

    // ==========================================
    // MOVIMIENTO POR REFERENCIA
    // ==========================================

    transactionByReference: (referencia) =>
        request(
            `/wallet/transactions/${encodeURIComponent(
                referencia
            )}`
        ),

    // ==========================================
    // COMPROBANTE
    // ==========================================

    receipt: (referencia) =>
        request(
            `/wallet/transactions/${encodeURIComponent(
                referencia
            )}/receipt`
        )
};

export default api;