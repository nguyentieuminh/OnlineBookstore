import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet, placeOrder, clearCart } from '../../api';
import { Book } from "lucide-react";
import { toast } from 'react-toastify';

export default function OrderForm({ setOrders }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || [];

  const [placeOrderAttempt, setPlaceOrderAttempt] = useState(0);

  const [allBooks, setAllBooks] = useState([]);
  const addressSectionRef = useRef(null);
  const recipientSectionRef = useRef(null);

  const [address, setAddress] = useState(() => localStorage.getItem('order_address') || '');
  const [isEditing, setIsEditing] = useState(() => !localStorage.getItem('order_address'));
  const [addressError, setAddressError] = useState('');

  const [recipient, setRecipient] = useState(() => {
    try {
      const cached = localStorage.getItem('order_recipient');
      return cached ? JSON.parse(cached) : { name: '', phone: '', email: '' };
    } catch {
      return { name: '', phone: '', email: '' };
    }
  });

  const [isEditingRecipient, setIsEditingRecipient] = useState(() => {
    try {
      const cached = localStorage.getItem('order_recipient');
      if (!cached) return true;
      const parsed = JSON.parse(cached);
      return !parsed.name || !parsed.phone || !parsed.email;
    } catch {
      return true;
    }
  });

  const [recipientErrors, setRecipientErrors] = useState({ name: '', phone: '', email: '' });

  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('order_payment_method') || 'cod');

  const [customerNote, setCustomerNote] = useState('');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await apiGet("user/profile");

        setUserInfo(data);
        setRecipient({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || ''
        });

        localStorage.setItem(
          'order_recipient',
          JSON.stringify({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || ''
          })
        );

        setIsEditingRecipient(false);
      } catch (error) {
        console.error("Failed to load user info:", error);
        toast.error("Could not load user information. Please log in again.");
      }
    };
    fetchUserInfo();
  }, []);

  const shippingFee = Number(localStorage.getItem('shipping_fee') ?? 5);

  const itemsSubtotal = React.useMemo(() => {
    return Array.isArray(items)
      ? items.reduce((s, it) => s + Number(it.price ?? 0) * Number(it.quantity ?? 1), 0)
      : 0;
  }, [items]);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const booksData = await apiGet('books');
        setAllBooks(booksData);
      } catch (error) {
        console.error("Failed to fetch books list:", error);
        toast.error("Could not load book data. Please refresh the page");
      }
    };
    fetchAllBooks();
  }, []);

  useEffect(() => {
    (async () => {
      const userId = state?.userId || localStorage.getItem('userId');
      if (!userId) { setIsEditingRecipient(true); return; }
      try {
        const data = await apiGet(`recipients/${encodeURIComponent(userId)}`);
        const next = {
          name: data?.name ?? '',
          phone: data?.phone ?? '',
          email: data?.email ?? '',
        };
        setRecipient(prev => {
          const merged = {
            name: prev.name || next.name,
            phone: prev.phone || next.phone,
            email: prev.email || next.email,
          };
          localStorage.setItem('order_recipient', JSON.stringify(merged));
          return merged;
        });
      } catch {
        setIsEditingRecipient(true);
      }
    })();
  }, [state?.userId]);

  const onToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setAddressError('');
    } else {
      if (!address.trim()) {
        setAddressError("Please enter your shipping address");
        return;
      } else if (address.trim().length < 10) {
        setAddressError("Address must be at least 10 characters long");
        return;
      } else if (!/^[a-zA-Z0-9\s,./\-À-ỹ]+$/.test(address.trim())) {
        setAddressError("Address contains invalid characters");
        return;
      }
      localStorage.setItem('order_address', address.trim());
      setIsEditing(false);
      setAddressError('');
    }
  };

  const validateRecipientFields = (r) => {
    const errs = { name: '', phone: '', email: '' };

    if (!r.name.trim()) {
      errs.name = "Please enter your full name";
    } else if (r.name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z\sÀ-ỹ]+$/.test(r.name.trim())) {
      errs.name = "Name must only contain letters";
    }

    if (!r.phone.trim()) {
      errs.phone = "Please enter your phone number";
    } else if (!/^(0|\+?\d{1,3})\d{8,13}$/.test(r.phone.trim())) {
      errs.phone = "Invalid phone number format";
    }

    if (!r.email.trim()) {
      errs.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) {
      errs.email = "Invalid email address";
    }

    return errs;
  };

  const onToggleEditRecipient = () => {
    if (!isEditingRecipient) {
      setIsEditingRecipient(true);
      setRecipientErrors({ name: '', phone: '', email: '' });
    } else {
      const errs = validateRecipientFields(recipient);
      const hasError = Object.values(errs).some(Boolean);
      if (hasError) {
        setRecipientErrors(errs);
        return;
      }
      localStorage.setItem('order_recipient', JSON.stringify(recipient));
      setIsEditingRecipient(false);
      setRecipientErrors({ name: '', phone: '', email: '' });
    }
  };

  const payableTotal = React.useMemo(() => itemsSubtotal + shippingFee, [itemsSubtotal, shippingFee]);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');

    setPlaceOrderAttempt(prev => prev + 1);

    if (!token) {
      toast.error("You must be logged in to place an order. Redirecting to login...");
      setTimeout(() => {
        navigate('/login', { state: { from: location } });
      }, 2000);
      return;
    }

    if (isEditing || !address.trim()) {
      toast.error('Please confirm the address before placing the order.');
      if (placeOrderAttempt > 0) {
        addressSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const recipientErrs = validateRecipientFields(recipient);

    if (isEditingRecipient || Object.values(recipientErrs).some(Boolean)) {
      toast.error('Please confirm recipient information before placing the order.');
      setRecipientErrors(recipientErrs);
      if (placeOrderAttempt > 0) {
        recipientSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (allBooks.length === 0) {
      toast.error("Book data is not loaded yet. Please wait a moment and try again.");
      return;
    }

    const itemsWithId = items.map(cartItem => {
      const bookFromDb = allBooks.find(book => book.name === cartItem.name);
      return {
        book_id: bookFromDb ? bookFromDb.id : null,
        quantity: cartItem.quantity
      };
    });

    if (itemsWithId.some(item => !item.book_id)) {
      toast.error("Some items could not be found. Please check your cart.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: itemsWithId,
        address,
        recipient,
        payment_method: paymentMethod,
        note: customerNote,
      };

      const result = await placeOrder(orderData);

      try {
        await clearCart();
        localStorage.removeItem('cartItems');
        console.log("🧹 Cart cleared successfully after checkout");
      } catch (clearErr) {
        console.error("⚠ Failed to clear cart:", clearErr);
      }

      localStorage.setItem('order_address', address);
      localStorage.setItem('order_recipient', JSON.stringify(recipient));
      localStorage.setItem('order_payment_method', paymentMethod);

      toast.success(result.message || 'Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
    localStorage.setItem('order_payment_method', e.target.value);
  };

  return (
    <div className="container py-4 mb-4" style={{ maxWidth: 900 }}>
      <div className='fs-3 fw-bold mb-3'>Order Form</div>

      <section ref={addressSectionRef} className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="p-3 p-md-4 d-flex align-items-start gap-3">
            <div className="d-flex align-items-center gap-2 flex-shrink-0 py-1" style={{ whiteSpace: 'nowrap' }}>
              <span className="d-inline-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28, borderRadius: '50%', color: '#e03131' }} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
              </span>
              <span className="fw-semibold" style={{ color: '#e03131' }}>Shipping Address</span>
            </div>

            <div className="flex-grow-1 d-flex flex-column">
              <input
                type="text"
                className="form-control"
                style={{ backgroundColor: (isEditing || !address.trim()) ? '#fff' : '#f0f2f5' }}
                placeholder="Enter shipping address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-label="Shipping address"
                readOnly={!isEditing && address.trim() !== ''}
              />
              {addressError && <div className="text-danger small mt-1 text-start">{addressError}</div>}
            </div>

            {address.trim() && (
              <div className="flex-shrink-0 py-1">
                <button
                  type="button"
                  className="btn btn-sm p-0"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#6366F1' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}
                  onClick={onToggleEdit}
                  title={isEditing ? 'Confirm' : 'Edit'}
                >
                  {isEditing ? 'confirm' : 'edit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>


      <section ref={recipientSectionRef} className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div className="d-flex align-items-center gap-2 flex-nowrap text-nowrap" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span className="d-inline-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.91-8 5v1h16v-1c0-2.09-2.67-5-8-5z" />
                  </svg>
                </span>
                <span className="fw-semibold">Recipient Information</span>
              </div>

              {(recipient.name || recipient.phone || recipient.email) && (
                <button
                  type="button"
                  className="btn btn-sm p-0 py-1"
                  title="Go to Categories"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#6366F1' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}
                  onClick={onToggleEditRecipient}
                >
                  {isEditingRecipient ? 'confirm' : 'edit'}
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.name && <div className="text-danger small mt-1">{recipientErrors.name}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone number</label>
                <input
                  type="tel"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.phone}
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.phone && <div className="text-danger small mt-1">{recipientErrors.phone}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.email}
                  onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.email && <div className="text-danger small mt-1">{recipientErrors.email}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#1864ab' }} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2V6zm0 4h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8zm3 5h6v2H5v-2z" />
                </svg>
              </span>
              <span className="fw-semibold">Payment Method</span>
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={handlePaymentChange}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={handlePaymentChange}
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={handlePaymentChange}
                  />
                  <span>E-wallet</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={handlePaymentChange}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {Array.isArray(items) && items.length > 0 && (
        <section className="mb-4">
          <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="p-3 p-md-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }} aria-hidden>
                    <span
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }}
                      aria-hidden
                    >
                      <Book size={18} strokeWidth={2} />
                    </span>
                  </span>
                  <span className="fw-semibold">Books</span>
                </div>

                <button
                  type="button"
                  className="btn btn-sm p-0"
                  onClick={() => navigate('/shop')}
                  title="Go to Categories"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#6366F1' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}
                >
                  More Book!
                </button>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={`orderform-item-${idx}-${it.title ?? 'notitle'}`}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {it.image && (
                              <img
                                src={it.image}
                                alt={it.title}
                                style={{
                                  width: 70,
                                  height: 70,
                                  objectFit: "cover",
                                  borderRadius: "10px",
                                }}
                              />
                            )}
                            <div className="text-start">
                              <div
                                className="fw-semibold mb-1"
                                style={{
                                  color: "#1E1B4B",
                                  fontSize: "1rem",
                                  lineHeight: "1.2",
                                }}
                              >
                                {it.title}
                              </div>

                              {(it.author || it.publisher) && (
                                <p className="small mb-1">
                                  {it.author && (
                                    <span className="fw-semibold text-primary">{it.author}</span>
                                  )}
                                  {it.author && it.publisher && (
                                    <span className="mx-1 text-muted">•</span>
                                  )}
                                  {it.publisher && (
                                    <span className="text-muted">{it.publisher}</span>
                                  )}
                                </p>
                              )}

                              {Array.isArray(it.categories) && it.categories.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                  {it.categories.map((cat, i) => (
                                    <span
                                      key={i}
                                      className="badge text-white px-2 py-1"
                                      style={{
                                        backgroundColor: [
                                          "#6366F1",
                                          "#10B981",
                                          "#F59E0B",
                                          "#EF4444",
                                          "#3B82F6",
                                          "#8B5CF6",
                                        ][i % 6],
                                        borderRadius: "8px",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="text-center">{it.quantity ?? 1}</td>
                        <td className="text-end">${Number(it.price ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th colSpan={2} className="text-end">Subtotal:</th>
                      <th className="text-end">${itemsSubtotal.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-end">Shipping:</th>
                      <th className="text-end">${shippingFee.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-end">Total:</th>
                      <th className="text-end text-danger fw-bold">${payableTotal.toFixed(2)}</th>
                    </tr>

                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#5c940d' }} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8 14H6v-2h2v2zm0-4H6V8h2v2zm10 4h-8v-2h8v2zm0-4h-8V8h8v2z" /></svg>
              </span>
              <span className="fw-semibold">Customer Note</span>
            </div>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Any special requests or notes for your order..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="d-flex gap-3 mt-4">
        <button
          type="button"
          className="btn btn-lg border-black flex-grow-1"
          style={{
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#fff',
            color: '#1E1B4B',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#1E1B4B';
          }}
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn text-white btn-lg flex-grow-1"
          style={{ transition: 'all 0.2s ease-in-out', backgroundColor: '#6366F1' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#554f99ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
