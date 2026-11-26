# Hướng dẫn Mở Web Local, Đưa lên GitHub & Chỉnh sửa / Mở rộng Web

Tài liệu này hướng dẫn bạn toàn bộ quy trình:
1. Mở web nhanh trên máy tính bằng **Microsoft Edge**.
2. Đưa mã nguồn lên **GitHub** và xuất bản web online miễn phí qua **GitHub Pages** (hoặc **Vercel**).
3. Chỉnh sửa **tính năng, giao diện, màu sắc, bố cục, nội dung học**.
4. Thêm **tính năng mới / chế độ học mới / tab mới** vào web.

---

## 1. Cách mở web trên máy tính bằng Microsoft Edge

> **Lưu ý quan trọng:** Không bấm đúp trực tiếp vào file `index.html` (dạng `file:///...`) vì trình duyệt sẽ chặn module JavaScript của React/Vite và chặn Micro (Speaking Lab). Hãy dùng **1 trong 2 file shortcut** đã tạo sẵn trong thư mục dự án:

1. **`MO-WEB-BANG-EDGE.bat`** *(Khuyên dùng — 1 chạm)*:
   - Bấm đúp vào file `MO-WEB-BANG-EDGE.bat`.
   - File sẽ tự kiểm tra xem server đã chạy chưa; nếu chưa, nó tự bật `npm run dev` ở cổng `5173` và tự mở **`http://localhost:5173`** bằng **Microsoft Edge**.
   - **Lưu ý:** Giữ cửa sổ dòng lệnh màu đen mở trong suốt lúc học; khi học xong chỉ cần đóng cửa sổ đó hoặc bấm `Ctrl + C`.
2. **`Mo-Web-Local.url`** *(Link web local)*:
   - Là file shortcut trỏ thẳng tới `http://localhost:5173`.
   - Dùng khi server đã được bật sẵn (từ `MO-WEB-BANG-EDGE.bat` hoặc `npm run dev`) để mở thêm tab mới nhanh trong Edge.

---

## 2. Trạng thái GitHub Hiện tại & Cách Cập nhật Web Online

### 2.1. Link GitHub & Link Web Online đã xuất bản
- **Repository GitHub (Public):** https://github.com/anhtuan13112007-bit/web-situation-english-app
- **Link Web Online (GitHub Pages):** https://anhtuan13112007-bit.github.io/web-situation-english-app/
- **Cơ chế nhánh đang dùng:**
  - Nhánh `main`: lưu toàn bộ mã nguồn dự án (`src/`, `api/`, `Situation.docx`, `HUONG_DAN_DEPLOY_VA_CHINH_SUA.md`...).
  - Nhánh `gh-pages`: chứa bản build tĩnh (`dist/` + file `.nojekyll`) để GitHub Pages phát trực tiếp.
  - File `.gitignore` đã loại trừ `node_modules/`, `dist/`, `.env`, `.env.local` và `.github/workflows/` để đảm bảo không lộ API Key và tránh lỗi quyền `workflow` khi push.

### 2.2. Lưu ý quan trọng về Token `gh` & `.github/workflows/deploy.yml`
- Token GitHub CLI (`gh`) hiện tại có các quyền `repo`, `gist`, `read:org` (chưa có scope `workflow`), nên GitHub từ chối push trực tiếp file `.github/workflows/deploy.yml`.
- Vì vậy, hiện tại dự án **đã chặn `.github/workflows/` trong `.gitignore`** và deploy web online bằng cách đẩy thư mục `dist/` sang nhánh `gh-pages`.
- Nếu sau này bạn muốn dùng **GitHub Actions** tự động build mỗi khi push `main`, hãy cấp thêm quyền `workflow` bằng lệnh:
  ```powershell
  gh auth refresh -h github.com -s workflow
  ```
  Sau đó xóa dòng `.github/workflows/` khỏi `.gitignore`, rồi đổi GitHub Pages sang **Settings → Pages → Source: GitHub Actions**.

### 2.3. Cách cập nhật web sau khi bạn sửa code / thêm nội dung
Mỗi khi bạn sửa màu sắc, bố cục, từ vựng hoặc thêm tính năng mới trên máy:

**Bước 1 — Lưu mã nguồn lên nhánh `main`:**
```powershell
git add .
git commit -m "Mo ta ngan gon nhung gi ban vua sua"
git push
```

**Bước 2 — Build lại và cập nhật trang web online (`gh-pages`):**
```powershell
npm run build
$tmp = Join-Path $env:TEMP 'wse-gh-pages'
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item -Path 'dist\*' -Destination $tmp -Recurse -Force
New-Item -ItemType File -Path (Join-Path $tmp '.nojekyll') -Force | Out-Null
Push-Location $tmp
git init -b gh-pages
git add .
git commit -m "Update GitHub Pages"
git remote add origin https://github.com/anhtuan13112007-bit/web-situation-english-app.git
git push -f origin gh-pages
Pop-Location
Remove-Item -Recurse -Force $tmp
```
Sau ~30–60 giây, link https://anhtuan13112007-bit.github.io/web-situation-english-app/ sẽ hiển thị bản mới nhất (bấm `Ctrl + F5` trên Edge nếu trình duyệt lưu cache cũ).

### 2.4. (Tùy chọn) Đưa lên Vercel nếu muốn ẩn API Key cho người khác dùng chung
- Trên GitHub Pages, người dùng tự nhập key Gemini/Groq miễn phí của họ trong mục **Cài đặt AI** (lưu cục bộ trên trình duyệt).
- Nếu bạn muốn tạo link public dùng key của bạn thông qua proxy `api/grade.ts`:
  1. Vào [Vercel](https://vercel.com) → **Add New Project** → chọn repo `anhtuan13112007-bit/web-situation-english-app`.
  2. Vào **Settings → Environment Variables**, thêm `GEMINI_API_KEY` và/hoặc `GROQ_API_KEY`.
  3. Deploy xong, người dùng chỉ cần mở **Cài đặt AI** trên web và chọn chế độ **Vercel Proxy (`/api/grade`)**.

---

## 3. Bản đồ Chỉnh sửa Web (Giao diện, Màu sắc, Bố cục, Nội dung)

Trước khi chỉnh sửa lớn, bạn có thể bật server (`MO-WEB-BANG-EDGE.bat`) để mọi thay đổi hiển thị ngay lập tức trên Edge (Hot Reload).

### 3.1. Sửa Màu sắc, Font chữ & Hiệu ứng
| Muốn sửa gì | Mở file nào | Hướng dẫn nhanh |
| :--- | :--- | :--- |
| **Bảng màu chủ đạo** (Navy, Accent, Nền, Nhấn ngữ nghĩa) | `src/index.css` | Sửa các biến trong `:root`: `--color-navy`, `--color-accent`, `--color-canvas`, `--color-info`, `--color-warning`, `--color-success`, `--color-error`. |
| **Màu cụ thể từng nút / thẻ** | Các file trong `src/components/` | Tìm mã màu hex như `bg-[#1B365D]`, `text-[#2E6B9E]`, `bg-[#F5F7FA]` và đổi sang mã màu Tailwind/Hex bạn muốn. |
| **Font chữ & Tiêu đề tab trình duyệt** | `index.html` & `src/index.css` | Đổi link Google Fonts và thẻ `<title>` trong `index.html`; sửa `font-family` trong `body` và `.ipa-text` ở `src/index.css`. |

**Ví dụ đổi bảng màu sang tông Xanh Rừng (Emerald Academic):**
- Trong `src/index.css` và các component dùng `#1B365D` / `#2E6B9E`, thay `#1B365D` thành `#064E3B` và `#2E6B9E` thành `#059669`.

### 3.2. Sửa Bố cục (Layout, Sidebar, Mobile Bar, Lưới Bento 12 thẻ)
| Muốn sửa gì | Mở file nào | Hướng dẫn nhanh |
| :--- | :--- | :--- |
| **Sidebar trái, Top Header, Thanh điều hướng Mobile** | `src/components/Layout.tsx` | Chỉnh độ rộng sidebar (`md:w-[240px]`), tên thương hiệu (`Situation English`), độ rộng tối đa nội dung (`max-w-[1040px]`), hoặc thứ tự `NAV_ITEMS`. |
| **Bố cục lưới 12 thẻ (Bento Grid)** | `src/components/StudyHub.tsx` | Sửa `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (đổi `lg:grid-cols-4` thành `lg:grid-cols-3` nếu muốn 3 cột to hơn), hoặc sửa mảng `BENTO_CARDS` (tiêu đề, mô tả, icon, thứ tự thẻ). |
| **Bố cục chia đôi Luyện tập AI** | `src/components/PracticeWorkspace.tsx` | Đổi tỉ lệ cột trái/phải (`lg:col-span-5` và `lg:col-span-7`). |

### 3.3. Sửa hoặc Thêm Nội dung Học (Từ vựng, Mẫu câu, Ngữ pháp, Tình huống)
Tất cả nội dung học nằm gọn trong thư mục `src/data/`:

1. **Thêm từ vựng Oxford IPA (`src/data/vocabulary.ts`)**:
   Thêm 1 object mới vào mảng `VOCABULARY_ITEMS`:
   ```ts
   {
     id: 'empathy',
     word: 'empathy',
     pos: 'n',
     ipaBrE: '/ˈempəθi/',
     ipaNAmE: '/ˈempəθi/',
     meaningVi: 'sự thấu cảm, đồng cảm',
     exampleEn: 'Teachers should respond with empathy during difficult conversations.',
     exampleVi: 'Giáo viên nên phản hồi bằng sự thấu cảm trong những cuộc trao đổi khó khăn.',
     category: 'pedagogy', // hoặc 'problem'
   },
   ```
   *(Mọi chế độ như Flashcard, Quiz, Listening, Gõ nghĩa, Viết câu, Minigame, Speaking, Sổ từ vựng sẽ **tự động cập nhật** theo mảng này!)*

2. **Thêm mẫu câu Form Ảnh 4 (`src/data/patterns.ts`)**:
   Thêm vào `SENTENCE_PATTERNS` với `category: 'action' | 'saying' | 'goal'` và các biến `[slot]` trong `template`.

3. **Thêm câu trắc nghiệm / câu viết lại ngữ pháp (`src/data/grammar.ts`)**:
   Thêm vào mảng `quiz` hoặc `writingDrills` của từng bài trong `GRAMMAR_LESSONS`.

4. **Thêm tình huống mẫu (`src/data/situations.ts`)**:
   Thêm vào `SITUATION_ITEMS`, tuân thủ quy tắc: **1 vấn đề = 1 phần tử trong `frames`**, **2 vấn đề riêng biệt = 2 phần tử trong `frames`**.

### 3.4. Chỉnh Sửa Tiêu chí & Prompt Chấm bài AI
- Mở `src/services/aiGrader.ts` → tìm biến `GRADER_SYSTEM_PROMPT` để điều chỉnh thang điểm, tiêu chí nhận xét hoặc ngôn ngữ phản hồi.
- Danh sách model gợi ý mặc định nằm ở `GEMINI_MODEL_PRESETS` và `GROQ_MODEL_PRESETS` trong cùng file.

---

## 4. Hướng dẫn Thêm Tính năng Mới vào Web

### Cách A: Thêm 1 Chế độ học mới vào Hub 12+ thẻ (`StudyHub`)
1. **Bước 1:** Tạo file giao diện mới trong `src/components/study/TenCheDoMoi.tsx`.
2. **Bước 2:** Mở `src/types/index.ts`, thêm tên định danh vào `StudyModeId` (ví dụ: `| 'roleplay'`).
3. **Bước 3:** Mở `src/components/StudyHub.tsx`:
   - Thêm 1 thẻ mới vào mảng `BENTO_CARDS` (`title`, `category`, `bullets`, `targetMode: 'roleplay'`).
   - Thêm vào `INTERNAL_MODE_OPTIONS` để hiện trong menu chuyển nhanh.
   - Render `{mode === 'roleplay' && <TenCheDoMoi ... />}` ở phần thân component.

### Cách B: Thêm 1 Tab mới trên Thanh Sidebar chính
1. Mở `src/types/index.ts` → thêm ID tab mới vào `TabId` (ví dụ: `| 'stats'`).
2. Mở `src/components/Layout.tsx` → thêm mục mới vào mảng `NAV_ITEMS` (chọn icon từ `lucide-react`).
3. Mở `src/App.tsx` → render component tương ứng khi `activeTab === 'stats'`.

### Cách C: Câu lệnh mẫu để nhờ AI chỉnh sửa / thêm tính năng nhanh
Khi mở dự án bằng Antigravity hoặc AI coding agent, bạn có thể copy các mẫu lệnh sau để AI sửa chuẩn xác ngay:
- **Đổi màu / Dark mode:**
  > *"Hãy thêm nút chuyển Sáng / Tối (Light / Dark mode) vào Layout.tsx và src/index.css, lưu lựa chọn vào localStorage, giữ nguyên độ tương phản của Action/Saying/Goal."*
- **Nạp thêm dữ liệu từ Word/PDF mới:**
  > *"Đọc file @[TenFileMoi.docx] và gộp thêm từ vựng, mẫu câu, tình huống mới vào src/data/vocabulary.ts, patterns.ts, situations.ts."*
- **Thêm tính năng viết mới:**
  > *"Thêm chế độ luyện viết đoạn Action–Saying–Goal có đồng hồ đếm ngược 10 phút vào StudyHub.tsx, chấm sơ bộ bằng diffWords đối chiếu với đáp án mẫu trong situations.ts."*

---

## 5. Kiểm tra Lỗi trước khi Đẩy lên GitHub & Lỗi Thường Gặp

Trước khi chạy `git push`, hãy chạy lệnh kiểm tra build:
```powershell
npm run build
```
Nếu lệnh báo `built in ...s` (không có lỗi đỏ TypeScript hay Vite), bạn yên tâm đẩy lên GitHub.

- **Lỗi cổng `5173` đang bận:** Đóng các cửa sổ terminal chạy `npm run dev` cũ, hoặc chạy `npm run dev -- --port 5174`.
- **Micro không hoạt động ở Speaking Lab:** Chỉ hoạt động trên `http://localhost:...` hoặc `https://...` (như GitHub Pages / Vercel) bằng **Microsoft Edge** hoặc **Google Chrome**, và nhớ bấm **Allow (Cho phép)** quyền Micro khi trình duyệt hỏi.
- **Chấm bài AI báo lỗi 429:** Đã chạm giới hạn lượt gọi miễn phí trong phút của Gemini hoặc Groq. Hãy đợi ~30 giây hoặc bấm **Cài đặt AI** để đổi qua lại giữa Gemini và Groq.
