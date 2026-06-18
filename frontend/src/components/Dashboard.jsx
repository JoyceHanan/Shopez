import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

function Dashboard() {
  const { currentUser } = useAuthStore();

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
    <div className="min-h-screen bg-slate-50">
      {/* Welcome Section */}

      <section className="bg-gradient-to-r from-black to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">
            Welcome,
            {" "}
            {currentUser?.username || "User"} 👋
          </h1>

          <p className="mt-3 text-slate-300">
            Explore our latest collections and
            exclusive fashion deals.
          </p>
        </div>
      </section>

      {/* Stats */}

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Available Products
            </h3>

            <p className="text-3xl font-bold mt-2">
              {products.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Account Type
            </h3>

            <p className="text-3xl font-bold mt-2 capitalize">
              {currentUser?.usertype}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">
              Status
            </h3>

            <p className="text-3xl font-bold mt-2 text-green-600">
              Active
            </p>
          </div>
        </div>
      </section>

      {/* Products */}

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Featured Products
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            No products available
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
                  className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
                >
                  <img
                    src={product.mainImg}
                    alt={product.title}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">
                      {product.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
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

                          <span className="text-green-600 text-sm">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                        {product.category}
                      </span>

                      <button
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                        onClick={() =>
                          toast.success(
                            "Cart functionality coming next"
                          )
                        }
                      >
                        Add Cart
                      </button>
                    </div>
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

export default Dashboard;