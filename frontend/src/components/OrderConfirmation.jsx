import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    return (
      <div className="shop-empty">
        <p>No order details found.</p>
        <button onClick={() => navigate("/")} className="btn btn--primary">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="confirmation">
      <h2>Order Confirmed</h2>
      <p>Thank you for shopping with ShopEZ. Your order has been placed successfully.</p>

      <div className="confirmation__details">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total:</strong> ${order.total?.toFixed?.(2) ?? order.total}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p>
          <strong>Shipping Address:</strong>{" "}
          {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.postalCode}
        </p>
      </div>

      <h3>Items</h3>
      <div className="confirmation__items">
        {order.items?.map((item, idx) => (
          <div key={idx} className="confirmation__item">
            <span>{item.name || item.productId}</span>
            <span>Qty: {item.quantity}</span>
            <span>${item.price}</span>
          </div>
        ))}
      </div>

      <div className="confirmation__actions">
        <button onClick={() => navigate("/profile")} className="btn btn--secondary">
          View My Orders
        </button>
        <button onClick={() => navigate("/")} className="btn btn--primary">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;