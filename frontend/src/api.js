const BASE_URL = "http://localhost:8000/api";

let isLoggingOut = false;

const handleUnauthorized = () => {
    if (!localStorage.getItem("token")) return;
    if (isLoggingOut) return;

    isLoggingOut = true;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Your session has expired or your admin privileges were revoked.");

    window.location.replace("/login");
};

const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
};

const parseResponse = async (response) => {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return text;
    }
};

const handleResponse = async (response) => {
    if (response.status === 401) return handleUnauthorized();
    if (response.status === 403) {
        const err = await parseResponse(response);
        throw new Error(err.message || "Access denied.");
    }

    if (!response.ok) {
        const err = await parseResponse(response);
        throw new Error(err.message || "Request failed");
    }

    return await parseResponse(response);
};

export const apiGet = (url) =>
    fetch(`${BASE_URL}/${url}`, { headers: getHeaders() }).then(handleResponse);

export const apiPost = (url, body) =>
    fetch(`${BASE_URL}/${url}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
    }).then(handleResponse);

export const apiPut = (url, body) =>
    fetch(`${BASE_URL}/${url}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
    }).then(handleResponse);

export const apiPatch = (url, body) =>
    fetch(`${BASE_URL}/${url}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(body),
    }).then(handleResponse);

export const apiDelete = (url) =>
    fetch(`${BASE_URL}/${url}`, {
        method: "DELETE",
        headers: getHeaders(),
    }).then(handleResponse);

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
