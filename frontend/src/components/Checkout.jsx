import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import api from "../utils/axios";
import "./index.css";

// Reached either from ProductCard's "Shop Now" (directBuy: true, single item)
// or from Cart's "Proceed to Checkout" (directBuy: false, full cart)
const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  const items = state?.items || [];
  const directBuy = state?.directBuy || false;

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "card",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/orders", {
        userId: user._id,
        items: items.map((i) => ({
          productId: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        shippingAddress: {
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        total,
      });

      if (!directBuy) clearCart();

      navigate("/order-confirmation", { state: { order: res.data } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <p className="shop-status">No items to check out.</p>;
  }

  return (
    <div className="checkout">
      <h2>Order Details</h2>

      <div className="checkout__items">
        {items.map((item) => (
          <div key={item.product._id} className="checkout__item">
            <span>{item.product.name} x {item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="checkout__total">
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout__form">
        <h3>Shipping Address</h3>
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />
        <input
          name="postalCode"
          placeholder="Postal Code"
          value={form.postalCode}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <h3>Payment Method</h3>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
        >
          <option value="card">Credit / Debit Card</option>
          <option value="upi">UPI</option>
          <option value="cod">Cash on Delivery</option>
        </select>

        <h3>Specific Requirements (optional)</h3>
        <textarea
          name="notes"
          placeholder="Any specific product requirements"
          value={form.notes}
          onChange={handleChange}
        />

        {error && <p className="checkout__error">{error}</p>}

        <button type="submit" disabled={submitting} className="btn btn--primary">
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;