const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiCall(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    console.log(`[AUTH DEBUG] Outgoing API Call to ${endpoint}. Token present: ${!!token}`);
    
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    let response;
    try {
        response = await fetch(url, config);
    } catch (networkError: any) {
        console.error(`[AUTH DEBUG] Network error calling ${endpoint}:`, networkError);
        throw new Error("Unable to connect to the server. Please check your network connection.");
    }

    console.log(`[AUTH DEBUG] API Response from ${endpoint}: Status ${response.status}`);

    if (response.status === 401) {
        console.warn(`[AUTH DEBUG] 401 Unauthorized received from ${endpoint}. Clearing token.`);
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            const pathname = window.location.pathname;
            if (!["/", "/login", "/register", "/forgot-password"].includes(pathname)) {
                console.log("[AUTH DEBUG] Redirecting to /login due to 401 on non-public page.");
                window.location.href = "/login?error=session_expired";
            }
        }
    }

    if (response.status === 204) {
        return null;
    }

    let data: any = null;
    try {
        data = await response.json();
    } catch (jsonError) {
        console.error(`[AUTH DEBUG] Failed to parse JSON for ${endpoint}:`, jsonError);
        if (!response.ok) {
            throw new Error(`Server returned error status ${response.status}`);
        }
        return null;
    }

    if (!response.ok) {
        let errMsg = "Something went wrong";
        if (data && data.detail) {
            if (typeof data.detail === "string") {
                errMsg = data.detail;
            } else if (Array.isArray(data.detail)) {
                errMsg = data.detail.map((err: any) => {
                    const field = err.loc ? err.loc[err.loc.length - 1] : "field";
                    return `${field}: ${err.msg}`;
                }).join(", ");
            } else {
                errMsg = JSON.stringify(data.detail);
            }
        }
        console.error(`[AUTH DEBUG] API error on ${endpoint}:`, errMsg);
        throw new Error(errMsg);
    }

    return data;
}
