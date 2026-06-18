import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import "./index.css";

// Drop this into Home.jsx (or wherever the product catalog renders)
// for each product returned by productAPI
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const discountedPrice = product.discount
    ? (product.price - (product.price * product.discount) / 100).toFixed(2)
    : product.price;

  const handleAddToCart = () => {
    if (!user) return navigate("/login");
    addToCart(user._id, product, 1);
  };

  const handleShopNow = () => {
    if (!user) return navigate("/login");
    // Skips the cart entirely and goes straight to the order details page
    navigate("/checkout", {
      state: { items: [{ product, quantity: 1 }], directBuy: true },
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-card__img" />
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__desc">{product.description}</p>

      <div className="product-card__price">
        {product.discount > 0 && (
          <span className="product-card__original">${product.price}</span>
        )}
        <span className="product-card__final">${discountedPrice}</span>
        {product.discount > 0 && (
          <span className="product-card__discount">{product.discount}% off</span>
        )}
      </div>

      {product.rating != null && (
        <p className="product-card__rating">Rating: {product.rating} / 5</p>
      )}

      <div className="product-card__actions">
        <button onClick={handleAddToCart} className="btn btn--secondary">
          Add to Cart
        </button>
        <button onClick={handleShopNow} className="btn btn--primary">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;