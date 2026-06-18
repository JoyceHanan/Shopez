import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

function Header() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const {
    currentUser,
    isAuthenticated,
    logout,
  } = useAuthStore();

  const handleLogout = async () => {
    await logout();

    toast.success("Logged out successfully");

    navigate("/login");
  };

  const navLinkStyle = ({ isActive }) =>
    isActive
      ? "text-black font-semibold"
      : "text-gray-600 hover:text-black";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}

          <Link
            to="/"
            className="text-2xl font-bold"
          >
            StyleHub
          </Link>

          {/* Desktop Menu */}

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={navLinkStyle}
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  className={navLinkStyle}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/cart"
                  className={navLinkStyle}
                >
                  Cart
                </NavLink>

                <NavLink
                  to="/profile"
                  className={navLinkStyle}
                >
                  Profile
                </NavLink>
              </>
            )}

            {currentUser?.usertype ===
              "admin" && (
              <NavLink
                to="/admin"
                className={navLinkStyle}
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Section */}

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-black text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Hi,
                  {" "}
                  <span className="font-semibold">
                    {currentUser?.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Button */}

          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="md:hidden"
          >
            {menuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}

        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Cart
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Profile
                  </Link>
                </>
              )}

              {currentUser?.usertype ===
                "admin" && (
                <Link
                  to="/admin"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Admin
                </Link>
              )}

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-left text-red-500"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;