import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../utils/axios";
import "./index.css";

// If Dashboard.jsx already covers profile/order-history, merge this logic
// in there instead of using both components.
const Profile = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${user._id}`);
        setOrders(res.data || []);
      } catch (err) {
        setError("Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="profile">
      <h2>My Profile</h2>
      <div className="profile__info">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <h3>My Orders</h3>
      {loading && <p>Loading orders...</p>}
      {error && <p className="profile__error">{error}</p>}
      {!loading && orders.length === 0 && <p>You haven't placed any orders yet.</p>}

      <div className="profile__orders">
        {orders.map((order) => (
          <div key={order._id} className="profile__order">
            <div className="profile__order-header">
              <span>Order #{order._id}</span>
              <span>${order.total}</span>
              <span>{order.status || "Processing"}</span>
            </div>
            <div className="profile__order-items">
              {order.items?.map((item, idx) => (
                <span key={idx}>
                  {item.name || item.productId} x{item.quantity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;