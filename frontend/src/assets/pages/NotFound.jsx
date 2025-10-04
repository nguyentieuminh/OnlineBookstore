import React, { useState } from "react";

export default function NotFound() {
    const [hover, setHover] = useState(false);

    return (
        <div className="container" style={{ height: "350px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center bg-light mt-5">
                <h1 className="display-1 text-danger fw-bold">404</h1>
                <h2 className="fw-semibold text-dark">Oops! Page Not Found</h2>
                <p className="text-muted text-center px-3">
                    It seems like you've wandered off the path. The page you're looking for doesn't exist or has been moved.
                </p>
                <a
                    href="/"
                    className="btn mt-3 d-flex align-items-center"
                    style={{
                        backgroundColor: hover ? "#554f99ff" : "#6366F1",
                        color: "#fff",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <i className="bi bi-house-door-fill me-2"></i>
                    Back to Home
                </a>
            </div>
        </div>
    );
}
