import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ================= USER PAGES ================= */
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Services from "./pages/Services";
import BookConsultation from "./pages/BookConsultation";
import RequireUserAuth from "./pages/RequireUserAuth";

import UserDashboard from "./pages/UserDashboard";
import LatestProductsPage from "./pages/LatestProductsPage";
import UpdateProfile from "./pages/UpdateProfile";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import OrderDetails from "./pages/user/OrderDetails";
import UserInquiryList from "./pages/user/UserInquiryList";
import UserConsultations from "./pages/user/UserConsultations";

/* ================= USER PRODUCT FLOW ================= */
import CategoryPage from "./pages/user-products/CategoryPage";
import TypePage from "./pages/user-products/TypePage";
import UserProducts from "./pages/user-products/UserProducts";

/* ================= CATEGORY DETAIL PAGES ================= */
import SofaDetails from "./pages/product-details/SofaDetails";
import CurtainDetails from "./pages/product-details/CurtainDetails";
import WoodenFlooringDetails from "./pages/product-details/WoodenFlooringDetails";
import PillowsDetails from "./pages/product-details/PillowsDetails";
import CottonGaddaDetails from "./pages/product-details/CottonGaddaDetails";
import CarpetDetails from "./pages/product-details/CarpetDetails";

/* ================= ADMIN AUTH ================= */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RequireAdminAuth from "./pages/admin/RequireAdminAuth";

/* ================= ADMIN CRUD ================= */
import AddCategory from "./pages/admin/AddCategory";
import AddType from "./pages/admin/AddType";
import AdminOrders from "./pages/admin/AdminOrders";
import AddProduct from "./pages/admin/AddProduct";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminDeliveredOrders from "./pages/admin/AdminDeliveredOrders";
import AdminUsers from "./pages/admin/AdminUsers";

import ManageCategories from "./pages/admin/ManageCategories";
import ManageTypes from "./pages/admin/ManageTypes";
import ManageProducts from "./pages/admin/ManageProducts";
import AdminServices from "./pages/admin/AdminServices";
import AdminConsultations from "./pages/admin/AdminConsultations";

/* ================= ADMIN INQUIRIES ================= */
//import InquiryList from "./pages/admin/InquiryList";
import InquiryDetails from "./pages/admin/InquiryDetails";
import Checkout from "./pages/user/Checkout";
import AdminInquiryPremium from "./pages/admin/AdminInquiryPremium";
function App() {
  return (
    <BrowserRouter>

      {/* USER POPUPS (Top Center) */}
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: { background: "#22c55e", color: "white" }, // green success
          },
          error: {
            style: { background: "#dc2626", color: "white" }, // red error
          },
          info: {
            style: { background: "#2563eb", color: "white" }, // blue info
          },
        }}
      />

      {/* ADMIN POPUPS (Top Right) */}
      <Toaster
        toastOptions={{
          // USER SUCCESS (top-center)
          success: {
            style: {
              background: "#22c55e",
              color: "white",
            },
          },

          // USER ERROR (top-center)
          error: {
            style: {
              background: "#dc2626",
              color: "white",
            },
          },

          // INFO
          info: {
            style: {
              background: "#2563eb",
              color: "white",
            },
          },

          // ADMIN THEME (dark)
          default: {
            style: {
              background: "#1f2937",
              color: "#f3f4f6",
              padding: "12px 16px",
              borderRadius: "8px",
            },
          },
        }}
        position="top-center"
      />

      <Routes>

        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book-consultation" element={<RequireUserAuth><BookConsultation /></RequireUserAuth>} />

        <Route path="/latest-products" element={<LatestProductsPage />} />

        <Route path="/user/dashboard" element={<RequireUserAuth><UserDashboard /></RequireUserAuth>} />
        <Route path="/user/update-profile" element={<RequireUserAuth><UpdateProfile /></RequireUserAuth>} />
        <Route path="/user/cart" element={<RequireUserAuth><Cart /></RequireUserAuth>} />
        <Route path="/user/checkout" element={<RequireUserAuth><Checkout /></RequireUserAuth>} />
        <Route path="/user/orders" element={<RequireUserAuth><Orders /></RequireUserAuth>} />
        <Route path="/user/order/:orderId" element={<RequireUserAuth><OrderDetails /></RequireUserAuth>} />
        <Route path="/user/inquiries" element={<RequireUserAuth><UserInquiryList /></RequireUserAuth>} />
        <Route path="/user/consultations" element={<RequireUserAuth><UserConsultations /></RequireUserAuth>} />

        {/* ================= USER PRODUCT FLOW ================= */}
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/types/:categoryId" element={<TypePage />} />
        <Route path="/products/:typeId" element={<UserProducts />} />

        {/* ================= PRODUCT DETAIL ROUTES ================= */}
        <Route path="/product/sofa/:id" element={<SofaDetails />} />
        <Route path="/product/curtains/:id" element={<CurtainDetails />} />
        <Route path="/product/wooden-flooring/:id" element={<WoodenFlooringDetails />} />
        <Route path="/product/pillows/:id" element={<PillowsDetails />} />
        <Route path="/product/cotton-gadda/:id" element={<CottonGaddaDetails />}/>
        <Route path="/product/carpet/:id" element={<CarpetDetails />} />
        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/delivered" element={<AdminDeliveredOrders />} />
        <Route
          path="/admin"
          element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>}
        />
        <Route path="/admin/users" element={<AdminUsers />} />


        <Route path="/admin/categories" element={<RequireAdminAuth><ManageCategories /></RequireAdminAuth>} />

        {/* ORDERS */}
        <Route path="/admin/orders" element={<RequireAdminAuth><AdminOrders /></RequireAdminAuth>} />
        <Route path="/admin/orders/:orderId" element={<RequireAdminAuth><AdminOrderDetails /></RequireAdminAuth>} />

        <Route path="/admin/category/add" element={<RequireAdminAuth><AddCategory /></RequireAdminAuth>} />

        <Route path="/admin/category/edit/:id" element={<RequireAdminAuth><AddCategory /></RequireAdminAuth>} />

        <Route path="/admin/types" element={<RequireAdminAuth><ManageTypes /></RequireAdminAuth>} />

        <Route path="/admin/type/add" element={<RequireAdminAuth><AddType /></RequireAdminAuth>} />

        <Route path="/admin/type/edit/:id" element={<RequireAdminAuth><AddType /></RequireAdminAuth>} />

        <Route path="/admin/products" element={<RequireAdminAuth><ManageProducts /></RequireAdminAuth>} />

        {/* Add + Edit Product */}
        <Route path="/admin/products/add" element={<RequireAdminAuth><AddProduct /></RequireAdminAuth>} />
        <Route path="/admin/products/edit/:id" element={<RequireAdminAuth><AddProduct /></RequireAdminAuth>} />

        <Route path="/admin/services" element={<RequireAdminAuth><AdminServices /></RequireAdminAuth>} />
        <Route path="/admin/consultations" element={<RequireAdminAuth><AdminConsultations /></RequireAdminAuth>} />

        {/* ================= ADMIN INQUIRIES ================= */}

        <Route path="/admin/inquiries/:id?" element={<AdminInquiryPremium />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
