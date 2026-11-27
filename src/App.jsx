import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProductFormPage from "./pages/ProductFormPage.jsx";
import ProductListPage from "./pages/ProductListPage.jsx";

/** Bố cục chung và định tuyến ứng dụng OfficeMart Admin. */
export default function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-title">OfficeMart Admin</div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
