# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên:** Cao Chí Thiện
- **Lớp:** K24-HN-CNTT2
- **Link repository:** 
- **Hệ điều hành (Windows/macOS):** Windows
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`):*6c4eaac0f17c6797c4cf9e6ab88a9322774d6961*
- **Phiên bản Node.js (gõ `node -v`):** v22.18.0

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [x] 4.1.1. Bố cục trang
- [x] 4.1.2. Bảng sản phẩm
- [x] 4.1.3. Định dạng dữ liệu
- [x] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [x] 4.2.1. Tải danh sách
- [x] 4.2.2. Form thêm sản phẩm
- [x] 4.2.3. Gửi form
- [x] 4.2.4. Sửa sản phẩm
- [x] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [x] 4.3.1. Tìm kiếm và lọc
- [x] 4.3.2. Phân trang
- [x] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Chạy mock API ở chế độ chậm (`npm run api:cham` — trong đó GET /api/products với từ khoá `q` bắt đầu bằng "ban" bị trễ 2.500 ms, còn các request khác trễ 100 ms) và dùng hook `src/ai/useProductSearch_ai.js`.
2. Nhập từ khoá "ban" để gửi request tìm kiếm thứ nhất (`GET /api/products?q=ban&page=1&limit=10`).
3. Khoảng 200 ms sau (khi request "ban" chưa phản hồi), đổi từ khoá sang "chuot" để gửi request tìm kiếm thứ hai (`GET /api/products?q=chuot&page=1&limit=10`).
```

Kết quả hiển thị:

```text
Sau khoảng 300–600 ms (request "chuot" trả về trước sau 100 ms), danh sách hiển thị đúng các sản phẩm chuột (Chuột trackball T50 Pro, Chuột bluetooth Travel Pro, Chuột văn phòng Silent Pro). Tuy nhiên sau khoảng 2,5 giây khi request "ban" hoàn thành muộn hơn, giao diện bị ghi đè thành các sản phẩm bàn/bàn phím (Bàn làm việc trẻ em Pro, Bàn phím văn phòng Basic Pro, Bàn làm việc khung sắt Pro) dù từ khoá hiện tại là "chuot".
```

Kết quả đúng:

```text
Danh sách phải luôn hiển thị kết quả khớp với từ khoá mới nhất ("chuot" — các sản phẩm chuột). Request cũ ("ban") phải bị huỷ hoặc bỏ qua kết quả khi tham số tìm kiếm đã thay đổi, không được ghi đè dữ liệu mới.
```

#### b) Vì sao hook hiển thị sai

Trong `src/ai/useProductSearch_ai.js`, `useEffect` không trả về hàm cleanup dùng `AbortController` hay cờ theo dõi hiệu lực, nên khi `params.q` đổi từ `"ban"` sang `"chuot"`, request `"ban"` (mạng chậm 2.500 ms) vẫn tiếp tục chạy và phản hồi sau request `"chuot"` (100 ms) rồi gọi `setData(res.data.data)` ghi đè lên dữ liệu mới. Đồng thời khối `finally { setLoading(false); }` không kiểm tra request có còn là mới nhất hay không, và `setError(err.message)` không lấy thông điệp từ `err.response.data.message`. Chỉ dùng debounce 400 ms cũng không giải quyết được lỗi này vì một khi request cũ đã được gửi đi sau khi ngừng gõ, tốc độ phản hồi mạng khác nhau vẫn khiến request gửi trước có thể về sau.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | Phân tích và viết lại hook tìm kiếm sản phẩm `useProductSearch` khắc phục race condition từ mẫu AI `src/ai/useProductSearch_ai.js`. | Đề xuất thay `src/ai/useProductSearch_ai.js` bằng hook mới có `AbortController` và cleanup trong `useEffect` (`src/hooks/useProductSearch.js`). | Sửa | Giữ ý tưởng `AbortController`, nhưng sửa bổ sung cờ `isCurrent`, `loadedKey` để `loading` không tắt nhầm hoặc lệch trang khi chuyển tham số nhanh, bỏ qua lỗi `ERR_CANCELED`, lấy `err.response?.data?.message` và thêm `refetch()`. | Chạy kiểm thử với `mock-api/server.js --mode cham`: gửi `"ban"` rồi đổi sang `"chuot"` sau 200 ms, log API ghi nhận request `"ban"` bị huỷ (`aborted: true`), kết quả cuối giữ đúng các sản phẩm Chuột, `error: null`, `loading: false`. |
| 2 | Xây dựng bộ lọc tìm kiếm debounce 400ms, phân trang và đồng bộ URL `useSearchParams` hỗ trợ Back/Forward và các trường hợp biên. | Dùng `useSearchParams` làm nguồn sự thật duy nhất kết hợp state cục bộ cho ô tìm kiếm và `setTimeout` 400 ms (`src/pages/ProductListPage.jsx`). | Sửa | Bổ sung đồng bộ ngược từ URL vào ô tìm kiếm khi Back/Forward (giữ khoảng trắng người dùng đang gõ giữa câu), ép về `page=1` khi đổi bộ lọc, và chuẩn hoá các giá trị biên (`q` toàn khoảng trắng, `page=-3`, `page=999`). | Chạy kiểm thử Vitest E2E với `mock-api/server.js`: gõ liên tục 3 lần trong 450 ms không gửi request sớm và chỉ gửi 1 request sau 400 ms; Back/Forward chuyển qua lại `1 / 12` và `2 / 12` khớp dữ liệu; `page=-3` về `1`, `page=999` về `12 / 12`. |

## Ghi chú (không tính điểm)

Các trường hợp biên đã xử lý và kiểm chứng trong `src/pages/ProductListPage.jsx` và `src/hooks/useProductSearch.js`:
- **Từ khoá rỗng hoặc chỉ gồm khoảng trắng (`q="   "`):** `trim()` trước khi cập nhật URL và trước khi gửi API; nếu chỉ có khoảng trắng thì xoá tham số `q` khỏi URL thay vì gửi request lọc thừa.
- **Tham số `page` âm hoặc không hợp lệ (`page=-3`, `page=0`, `page=abc`):** chuẩn hoá về `1` và đồng bộ lại URL (`replace: true`).
- **Tham số `page` vượt tổng số trang (`page=999` hoặc sau khi xoá sản phẩm cuối cùng ở trang cuối):** nhờ `loadedKey` đồng bộ trạng thái `loading`, chỉ sau khi API trả `total` mới nhất thì tự động đưa `page` về `Math.max(1, Math.ceil(total / 10))` (`replace: true`).
- **Tổng số trang bằng 1 (`t1` = 8 sản phẩm) hoặc tổng sản phẩm bằng 0 (`empty`):** khoá cả 2 nút `page-prev` và `page-next` khi có 1 trang; hiển thị `empty-state` khi không có sản phẩm.
- **API lỗi 500 (`--mode loi`) và sửa ID không tồn tại (404):** tắt `loading`, hiển thị `error-message` lấy từ `err.response.data.message`, có nút `retry-button` hoặc quay lại danh sách.
- **Lưu ý kiểm thử giao diện:** Do công cụ Chrome DevTools MCP không khả dụng trong phiên làm việc, chưa kiểm tra trực tiếp trên trình duyệt Chrome thật; toàn bộ logic, routing, CRUD, đồng bộ URL, debounce và race condition đã được kiểm chứng qua `npm run tu-kiem-tra`, `npx vite build` và kịch bản Vitest E2E chạy với `mock-api/server.js`.
