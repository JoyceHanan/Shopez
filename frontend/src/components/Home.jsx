import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/product-api"
      );

      setProducts(res.data.payload || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}

      <section className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to StyleHub
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl">
            Discover premium fashion for men,
            women and kids. Shop the latest
            trends with amazing offers.
          </p>

          <button className="mt-8 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition">
            Shop Now
          </button>
        </div>
      </section>

      {/* Products */}

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Latest Products
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            No products found
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const finalPrice =
                product.price -
                (product.price * product.discount) /
                  100;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <img
                    src={product.mainImg}
                    alt={product.title}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {product.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-bold text-lg">
                        ₹{finalPrice}
                      </span>

                      {product.discount > 0 && (
                        <>
                          <span className="line-through text-gray-400">
                            ₹{product.price}
                          </span>

                          <span className="text-green-600 text-sm font-semibold">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    <Link
                      to={`/product/${product._id}`}
                      className="block mt-4 w-full text-center bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;