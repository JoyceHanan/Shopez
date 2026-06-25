import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import "../index.css";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, loading, fetchCart, updateQuantity, removeFromCart } =
    useCartStore();

  useEffect(() => {
    if (user) fetchCart(user._id);
  }, [user]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout", { state: { items, directBuy: false } });
  };

  if (loading) return <p className="shop-status">Loading cart...</p>;

  if (items.length === 0) {
    return (
      <div className="shop-empty">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/")} className="btn btn--primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>

      <div className="cart__list">
        {items.map((item) => (
          <div key={item.product._id} className="cart__item">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="cart__item-img"
            />
            <div className="cart__item-info">
              <h4>{item.product.name}</h4>
              <p>${item.product.price} x {item.quantity}</p>
            </div>
            <div className="cart__item-controls">
              <button
                onClick={() =>
                  updateQuantity(
                    user._id,
                    item.product._id,
                    Math.max(1, item.quantity - 1)
                  )
                }
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(user._id, item.product._id, item.quantity + 1)
                }
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(user._id, item.product._id)}
                className="cart__remove"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart__summary">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button onClick={handleCheckout} className="btn btn--primary">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;