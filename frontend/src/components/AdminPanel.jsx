import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <span className="text-4xl">
          {icon}
        </span>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [banner, setBanner] =
    useState("");

  const [categories, setCategories] =
    useState([]);

  const [categoryInput, setCategoryInput] =
    useState("");

  const [productForm, setProductForm] =
    useState({
      title: "",
      description: "",
      mainImg: "",
      category: "",
      gender: "Unisex",
      price: "",
      discount: "",
      sizes: "",
    });

  // --------------------------
  // FETCH FUNCTIONS
  // --------------------------

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "/admin-api/stats",
        { withCredentials: true }
      );

      setStats(res.data.payload);
    } catch {
      toast.error(
        "Failed to load dashboard stats"
      );
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "/product-api"
      );

      setProducts(
        res.data.payload || []
      );
    } catch {
      toast.error(
        "Failed to load products"
      );
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "/admin-api/orders",
        { withCredentials: true }
      );

      setOrders(
        res.data.payload || []
      );
    } catch {
      toast.error(
        "Failed to load orders"
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "/admin-api/users",
        { withCredentials: true }
      );

      setUsers(
        res.data.payload || []
      );
    } catch {
      toast.error(
        "Failed to load users"
      );
    }
  };

  const fetchSettings = async () => {
    try {
      const bannerRes =
        await axios.get(
          "/admin-api/banner",
          { withCredentials: true }
        );

      const categoriesRes =
        await axios.get(
          "/admin-api/categories",
          { withCredentials: true }
        );

      setBanner(
        bannerRes.data.payload || ""
      );

      setCategories(
        categoriesRes.data.payload || []
      );
    } catch {
      toast.error(
        "Failed to load settings"
      );
    }
  };

  const fetchAll = async () => {
    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchProducts(),
      fetchOrders(),
      fetchUsers(),
      fetchSettings(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --------------------------
  // PRODUCT ACTIONS
  // --------------------------

  const handleProductChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]:
        e.target.value,
    });
  };

  const createProduct = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...productForm,
        price: Number(
          productForm.price
        ),
        discount: Number(
          productForm.discount || 0
        ),
        sizes:
          productForm.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      };

      await axios.post(
        "/product-api",
        payload,
        { withCredentials: true }
      );

      toast.success(
        "Product created"
      );

      setProductForm({
        title: "",
        description: "",
        mainImg: "",
        category: "",
        gender: "Unisex",
        price: "",
        discount: "",
        sizes: "",
      });

      fetchProducts();
      fetchStats();
    } catch (err) {
      toast.error(
        err.response?.data
          ?.message ||
          "Failed to create product"
      );
    }
  };

  const deleteProduct = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `/product-api/${id}`,
        {
          withCredentials: true,
        }
      );

      toast.success(
        "Product removed"
      );

      fetchProducts();
      fetchStats();
    } catch {
      toast.error(
        "Failed to delete product"
      );
    }
  };

  const tabs = [
    "dashboard",
    "products",
    "orders",
    "users",
    "settings",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold mb-8">
          Admin Panel
        </h1>

        {/* TABS */}

        <div className="flex gap-3 flex-wrap mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-5 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}

        {activeTab ===
          "dashboard" && (
          <div>
            <div className="grid md:grid-cols-4 gap-6">

              <StatCard
                title="Users"
                value={
                  stats?.totalUsers ||
                  0
                }
                icon="👥"
              />

              <StatCard
                title="Products"
                value={
                  stats?.totalProducts ||
                  0
                }
                icon="📦"
              />

              <StatCard
                title="Orders"
                value={
                  stats?.totalOrders ||
                  0
                }
                icon="🛒"
              />

              <StatCard
                title="Revenue"
                value={`₹${
                  stats?.totalRevenue ||
                  0
                }`}
                icon="💰"
              />
            </div>

            <div className="mt-10 bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-5">
                Recent Orders
              </h2>

              <div className="space-y-4">
                {stats?.recentOrders?.map(
                  (order) => (
                    <div
                      key={
                        order._id
                      }
                      className="border rounded-lg p-4"
                    >
                      <p>
                        <strong>
                          Product:
                        </strong>{" "}
                        {
                          order.title
                        }
                      </p>

                      <p>
                        <strong>
                          Customer:
                        </strong>{" "}
                        {
                          order
                            .userId
                            ?.username
                        }
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {
                          order.orderStatus
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}

        {activeTab ===
          "products" && (
          <div className="space-y-8">

            <form
              onSubmit={
                createProduct
              }
              className="bg-white rounded-xl shadow p-6"
            >
              <h2 className="text-2xl font-bold mb-5">
                Add Product
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  name="title"
                  value={
                    productForm.title
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Title"
                  className="border p-3 rounded"
                  required
                />

                <input
                  name="category"
                  value={
                    productForm.category
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Category"
                  className="border p-3 rounded"
                  required
                />

                <input
                  name="mainImg"
                  value={
                    productForm.mainImg
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Image URL"
                  className="border p-3 rounded"
                  required
                />

                <input
                  name="sizes"
                  value={
                    productForm.sizes
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="S,M,L,XL"
                  className="border p-3 rounded"
                />

                <input
                  name="price"
                  value={productForm.price}
                  onChange={handleProductChange}
                  placeholder="Price"
                  className="border p-3 rounded"
                  required
                />

                <input
                  name="discount"
                  value={productForm.discount}
                  onChange={handleProductChange}
                  placeholder="Discount"
                  className="border p-3 rounded"
                />

                <select
                  name="gender"
                  value={productForm.gender}
                  onChange={handleProductChange}
                  className="border p-3 rounded"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  placeholder="Description"
                  className="border p-3 rounded md:col-span-2"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="mt-4 bg-black text-white px-6 py-3 rounded-lg"
              >
                Create Product
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;