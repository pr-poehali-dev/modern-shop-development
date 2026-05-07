import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import CatalogPage from "./pages/CatalogPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage";
import AdminWarehousesPage from "./pages/admin/AdminWarehousesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminLayout from "./admin/AdminLayout";
import { AdminAuthProvider } from "./admin/AdminAuth";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          <Route path="/admin/login" element={
            <AdminAuthProvider>
              <AdminLoginPage />
            </AdminAuthProvider>
          } />

          <Route path="/admin" element={
            <AdminAuthProvider>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/orders" element={
            <AdminAuthProvider>
              <AdminLayout><AdminOrdersPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/catalog" element={
            <AdminAuthProvider>
              <AdminLayout><AdminCatalogPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/banners" element={
            <AdminAuthProvider>
              <AdminLayout><AdminBannersPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/locations" element={
            <AdminAuthProvider>
              <AdminLayout><AdminLocationsPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/warehouses" element={
            <AdminAuthProvider>
              <AdminLayout><AdminWarehousesPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/users" element={
            <AdminAuthProvider>
              <AdminLayout><AdminUsersPage /></AdminLayout>
            </AdminAuthProvider>
          } />
          <Route path="/admin/settings" element={
            <AdminAuthProvider>
              <AdminLayout><AdminSettingsPage /></AdminLayout>
            </AdminAuthProvider>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;