const BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const apiGet = async (url) => {
    const response = await fetch(`${BASE_URL}/${url}`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
    }
    return await response.json();
};

export const apiPost = async (url, body) => {
    const headers = getHeaders();
    const token = localStorage.getItem("token");

    console.log(`[API Auth] Using token: ${token ? "Bearer " + token.substring(0, 20) + "..." : "No Token Found"
        }`);
    console.log(`[API POST] to ${url} with body:`, JSON.stringify(body, null, 2));

    const response = await fetch(`${BASE_URL}/${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`[API POST ERROR] to ${url}:`, error);
        if (error.errors) {
            console.error("Validation errors:", error.errors);
        }
        const err = new Error(error.message || "Request failed");
        err.response = error;
        throw err;
    }

    return await response.json();
};

export const apiPut = async (url, body) => {
    const response = await fetch(`${BASE_URL}/${url}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
    }
    return await response.json();
};

export const apiPatch = async (url, body) => {
    const response = await fetch(`${BASE_URL}/${url}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
    }
    return await response.json();
};

export const apiDelete = async (url) => {
    const headers = getHeaders();
    console.log(`[API DELETE] URL: ${BASE_URL}/${url}`);
    console.log(`[API DELETE] Headers:`, headers);

    const response = await fetch(`${BASE_URL}/${url}`, {
        method: "DELETE",
        headers,
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = text;
    }

    if (!response.ok) {
        console.error(`[API DELETE ERROR] URL: ${url}`, data);
        const message = data?.message || data || "Request failed";
        const err = new Error(message);
        err.response = data;
        throw err;
    }

    console.log(`[API DELETE SUCCESS] URL: ${url}`, data);
    return data;
};

export const getBooks = () => apiGet("books");

export const getBookDetail = (id) => apiGet(`books/${id}`);

export const getAdminBooks = () => apiGet("admin/books");
export const addBook = (bookData) => apiPost("admin/books", bookData);
export const updateBook = (id, bookData) => apiPut(`admin/books/${id}`, bookData);
export const deleteBook = (id) => apiDelete(`admin/books/${id}`);

export const getCart = () => apiGet("cart");
export const addToCart = (bookId, quantity = 1) =>
    apiPost("cart", { BookID: bookId, Quantity: quantity });
export const updateCartItem = (id, quantity) =>
    apiPut(`cart/${id}`, { Quantity: quantity });
export const removeCartItem = (id) => apiDelete(`cart/${id}`);
export const clearCart = () => apiDelete("cart/clear");

export const placeOrder = (orderData) => apiPost("orders", orderData);
export const getUserOrders = () => apiGet("orders");
export const cancelOrder = (orderId) => apiPost(`orders/${orderId}/cancel`);

export const getAdminDashboard = () => apiGet("admin/dashboard");
export const getAdminOrders = () => apiGet("admin/orders");
export const updateOrderStatus = (id, status) =>
    apiPost(`admin/orders/${id}/update-status`, { status });
