import { useEffect, useState } from "react";
import api from "../api/axiosClient.js";

/** Custom hook tải danh sách sản phẩm theo bộ lọc/trang, huỷ request cũ bằng AbortController. */
export default function useProductSearch(params) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");

  const q = (params?.q || "").trim();
  const category = params?.category || "";
  const status = params?.status || "";
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const requestKey = `${q}|${category}|${status}|${page}|${limit}|${reloadCount}`;

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/products", {
          params: {
            q: q || undefined,
            category: category || undefined,
            status: status || undefined,
            page,
            limit,
          },
          signal: controller.signal,
        });
        if (!isCurrent) return;
        setData(res.data.data);
        setTotal(res.data.total);
        setLoadedKey(requestKey);
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }
        if (!isCurrent) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải danh sách sản phẩm",
        );
        setLoadedKey(requestKey);
      } finally {
        if (isCurrent && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [q, category, status, page, limit, reloadCount, requestKey]);

  function refetch() {
    setReloadCount((count) => count + 1);
  }

  return {
    data,
    total,
    loading: loading || loadedKey !== requestKey,
    error,
    refetch,
  };
}
