import { Link } from "react-router";

function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              StyleHub
            </h2>

            <p className="text-gray-400 text-sm">
              Discover premium fashion for men,
              women and kids. Shop quality products
              at affordable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-gray-400">
              <Link
                to="/"
                className="hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/dashboard"
                className="hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                to="/cart"
                className="hover:text-white"
              >
                Cart
              </Link>

              <Link
                to="/profile"
                className="hover:text-white"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">
              Categories
            </h3>

            <div className="flex flex-col gap-2 text-gray-400">
              <p>Men</p>
              <p>Women</p>
              <p>Kids</p>
              <p>Accessories</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">
              Contact
            </h3>

            <div className="flex flex-col gap-2 text-gray-400">
              <p>support@stylehub.com</p>
              <p>+91 9876543210</p>
              <p>Hyderabad, India</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} StyleHub.
          All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;