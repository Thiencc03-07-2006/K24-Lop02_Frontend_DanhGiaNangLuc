import { createContext, useContext, useEffect, useState } from "react";

const ToastContext = createContext(null);

/** Provider quản lý thông báo toast dùng chung giữa các trang. */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  function showToast(text) {
    setMessage(text);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="app-toast" data-testid="toast" role="status">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/** Hook truy cập hàm hiển thị toast từ ToastProvider. */
export function useToast() {
  return useContext(ToastContext);
}

