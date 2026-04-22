# EQMS — API Specification (OpenAPI 3.0 Style)

> Tổng hợp từ toàn bộ source code front-end. Phiên bản: April 2026.

---

## Mục lục

1. [Cấu hình chung](#1-cấu-hình-chung)
2. [Authentication](#2-authentication)
3. [Metadata & Dropdown Options](#3-metadata--dropdown-options) ← *dữ liệu cho Select/Dropdown*
4. [Global Search & Saved Filters](#4-global-search--saved-filters)
5. [Sidebar Favorites](#5-sidebar-favorites)
6. [Count & Badge APIs](#6-count--badge-apis)
7. [Documents — Tài liệu](#7-documents)
8. [Training — Course](#8-training--course) ← *tách biệt với Material*
9. [Training — Material](#9-training--material) ← *thực thể riêng*
10. [Training — Assignments & Records](#10-training--assignments--records)
11. [Deviations](#11-deviations)
12. [CAPA](#12-capa)
13. [Complaints](#13-complaints)
14. [Change Control](#14-change-control)
15. [Equipment](#15-equipment)
16. [Supplier](#16-supplier)
17. [Product](#17-product)
18. [Regulatory](#18-regulatory)
19. [Risk Management](#19-risk-management)
20. [Audit Trail](#20-audit-trail)
21. [Notifications](#21-notifications)
22. [My Tasks](#22-my-tasks)
23. [My Team](#23-my-team)
24. [Dashboard](#24-dashboard)
25. [Reports](#25-reports)
26. [Settings — Users & Roles](#26-settings--users--roles)
27. [Settings — Departments, Dictionaries & System](#27-settings--departments-dictionaries--system)
28. [Preferences (User)](#28-preferences-user)
29. [Help & Support](#29-help--support)
30. [Shared APIs (Cross-module)](#30-shared-apis-cross-module)
31. [File Upload / Download](#31-file-upload--download)
32. [Chuẩn Pagination & Filters](#32-chuẩn-pagination--filters)
33. [Common Response Shapes](#33-common-response-shapes)
34. [Enum Reference](#34-enum-reference)
35. [Database Schema Hints](#35-database-schema-hints)

---

## 1. Cấu hình chung

| Key | Value |
|-----|-------|
| Base URL | `http://localhost:5000/api` |
| Auth | Cookie-based — `accessToken` & `refreshToken` trong **HttpOnly Cookies** (tự động gửi kèm mỗi request) |
| Content-Type | `application/json` (file upload: `multipart/form-data`) |
| X-Correlation-ID | UUID per request (server tracing) |
| CSRF Protection | `X-CSRF-Token` header bắt buộc cho mọi mutation (POST/PUT/PATCH/DELETE) |
| Timeout | 30 seconds |
| Token refresh | POST `/auth/refresh` khi nhận `401 Unauthorized` — tự động bởi axios interceptor |
| File size limit | Default 50 MB; Training/Regulatory dossier: 500 MB |

---

## 2. Authentication

> **Chiến lược xác thực:**
> - **JWT Access Token** (15 phút) lưu trong `HttpOnly; Secure; SameSite=Strict` cookie — không accessible từ JavaScript
> - **Refresh Token** (7 ngày, rotate-on-use) lưu trong `HttpOnly` cookie riêng biệt — path `/api/auth/refresh`
> - **CSRF Token** trả về qua cookie `csrfToken` (readable) + frontend gửi lại trong header `X-CSRF-Token`
> - **MFA** hỗ trợ 2 phương thức: **TOTP** (Google/Microsoft Authenticator) hoặc **Email OTP**

### Endpoints

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `POST` | `/auth/login` | Đăng nhập — bước 1 (username/password) |
| `POST` | `/auth/mfa/verify` | Đăng nhập — bước 2 (xác minh OTP) |
| `POST` | `/auth/mfa/email-otp/send` | Gửi lại Email OTP |
| `POST` | `/auth/logout` | Đăng xuất (xoá cookies, thu hồi refresh token) |
| `POST` | `/auth/refresh` | Làm mới access token (dùng refresh token cookie) |
| `GET` | `/auth/csrf` | Lấy CSRF token mới |
| `GET` | `/auth/me` | Thông tin user đang đăng nhập |
| `PUT` | `/auth/me/profile` | Cập nhật profile |
| `POST` | `/auth/me/change-password` | Đổi mật khẩu |
| `POST` | `/auth/verify-signature` | Xác thực chữ ký điện tử (21 CFR Part 11) |
| `GET` | `/auth/sessions` | Danh sách phiên đăng nhập đang hoạt động |
| `DELETE` | `/auth/sessions/:sessionId` | Thu hồi phiên cụ thể |
| `DELETE` | `/auth/sessions` | Thu hồi tất cả phiên khác |
| `POST` | `/auth/forgot-password` | Yêu cầu reset mật khẩu (gửi email) |
| `POST` | `/auth/reset-password` | Đặt mật khẩu mới bằng token từ email |
| `GET` | `/auth/reset-password/validate-token` | Kiểm tra token reset còn hợp lệ không |
| `POST` | `/auth/accept-invitation` | Kích hoạt tài khoản lần đầu qua lời mời |

---

### POST `/auth/login`

**Request Body:**
```json
{
  "username": "john.doe",
  "password": "MyP@ssword123!"
}
```

**Response — Đăng nhập thành công (MFA đã tắt):** `HTTP 200`
```json
{
  "user": {
    "id": "uuid",
    "username": "john.doe",
    "fullName": "John Doe",
    "email": "john@pharma.com",
    "role": "QA Manager",
    "department": "Quality Assurance",
    "permissions": ["documents.view", "documents.approve"],
    "avatarUrl": "/uploads/avatars/uuid.jpg",
    "mfaEnabled": false,
    "requirePasswordChange": false
  }
}
```

> Tokens **không** trả về trong body. Server set:
> ```
> Set-Cookie: accessToken=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=900
> Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
> Set-Cookie: csrfToken=<random>; Secure; SameSite=Strict; Path=/; Max-Age=900
> ```

**Response — Yêu cầu MFA:** `HTTP 200`
```json
{
  "mfaRequired": true,
  "mfaToken": "short-lived-opaque-token-10min",
  "availableMethods": ["totp", "email_otp"],
  "defaultMethod": "totp",
  "maskedEmail": "j***@pharma.com"
}
```

> `mfaToken` là opaque token tạm thời (10 phút, một lần dùng), dùng cho bước tiếp theo `/auth/mfa/verify`.  
> Không có cookie nào được set ở bước này.

**Response — Tài khoản bị khoá:** `HTTP 423`
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account locked due to 5 failed attempts.",
  "lockedUntil": "2026-04-21T10:30:00Z",
  "remainingSeconds": 1800
}
```

---

### POST `/auth/mfa/verify`

> Bước 2 đăng nhập — xác minh OTP. Hỗ trợ cả TOTP và Email OTP.

**Request — TOTP (Google/Microsoft Authenticator):**
```json
{
  "mfaToken": "short-lived-opaque-token-10min",
  "method": "totp",
  "otp": "123456"
}
```

**Request — Email OTP:**
```json
{
  "mfaToken": "short-lived-opaque-token-10min",
  "method": "email_otp",
  "otp": "847291"
}
```

**Response — Thành công:** `HTTP 200`
```json
{
  "user": {
    "id": "uuid",
    "username": "john.doe",
    "fullName": "John Doe",
    "email": "john@pharma.com",
    "role": "QA Manager",
    "department": "Quality Assurance",
    "permissions": ["documents.view", "documents.approve"],
    "avatarUrl": "/uploads/avatars/uuid.jpg",
    "mfaEnabled": true,
    "requirePasswordChange": false
  }
}
```

> Server set `accessToken`, `refreshToken`, `csrfToken` cookies sau khi xác minh thành công.

**Response — OTP sai:** `HTTP 401`
```json
{
  "error": "INVALID_OTP",
  "message": "Invalid or expired OTP.",
  "remainingAttempts": 2
}
```

---

### POST `/auth/mfa/email-otp/send`

> Gửi lại hoặc gửi lần đầu Email OTP cho phiên MFA đang chờ. Rate-limited: tối đa 3 lần / 10 phút.

```json
{ "mfaToken": "short-lived-opaque-token-10min" }
```

**Response:** `HTTP 200`
```json
{
  "sent": true,
  "maskedEmail": "j***@pharma.com",
  "expiresInSeconds": 300,
  "retryAfterSeconds": 60
}
```

---

### POST `/auth/refresh`

> Frontend gọi khi nhận `401`. Dùng `refreshToken` cookie (tự động gửi kèm).  
> Server rotate refresh token: thu hồi token cũ, set cookie mới.

**Request Body:** *(trống — token đọc từ cookie)*

**Response:** `HTTP 200`
```json
{ "ok": true }
```

> Server set cookies mới: `accessToken` + `refreshToken` (rotated) + `csrfToken`.

**Response — Refresh token hết hạn/bị thu hồi:** `HTTP 401`
```json
{ "error": "REFRESH_TOKEN_EXPIRED", "message": "Session expired. Please log in again." }
```

---

### GET `/auth/csrf`

> Gọi một lần khi app khởi động để lấy CSRF token đầu tiên.

**Response:** `HTTP 200`
```json
{ "csrfToken": "random-csrf-token" }
```

> Đồng thời server set `Set-Cookie: csrfToken=...; Path=/; Secure; SameSite=Strict` (không HttpOnly — frontend cần đọc được).

---

### POST `/auth/logout`

**Request Body:** *(trống)*

**Response:** `HTTP 200`
```json
{ "ok": true }
```

> Server thu hồi refresh token khỏi DB và xoá tất cả cookies (`Max-Age=0`).

---

### POST `/auth/verify-signature` *(21 CFR Part 11)*

**Request:**
```json
{ "username": "john.doe", "password": "MyP@ssword123!" }
```
**Response:**
```json
{
  "valid": true,
  "userId": "uuid",
  "timestamp": "2026-04-21T10:00:00Z",
  "signatureToken": "short-lived-jwt-5min"
}
```

---

### GET `/auth/sessions`

```json
[
  {
    "sessionId": "uuid",
    "device": "Chrome 124 / Windows 11",
    "ipAddress": "192.168.1.50",
    "location": "Ho Chi Minh City, VN",
    "lastActivity": "2026-04-21T09:45:00Z",
    "current": true
  }
]
```

---

### DELETE `/auth/sessions/:sessionId`

> Thu hồi một phiên đăng nhập cụ thể (từ xa). Không thể thu hồi phiên hiện tại bằng endpoint này — dùng `/auth/logout`.

**Response:** `HTTP 200`
```json
{ "ok": true, "sessionId": "uuid" }
```

**Response — Phiên không tồn tại hoặc không thuộc user:** `HTTP 404`
```json
{ "error": "SESSION_NOT_FOUND" }
```

---

### DELETE `/auth/sessions`

> Thu hồi **tất cả** phiên khác ngoại trừ phiên hiện tại (đăng xuất toàn bộ thiết bị khác).

**Response:** `HTTP 200`
```json
{ "ok": true, "revokedCount": 3 }
```

---

## 3. Metadata & Dropdown Options

> Tất cả các `<Select>` / dropdown trong UI đều cần dữ liệu từ API. Các endpoint này cung cấp danh sách lựa chọn động theo module.

### Endpoints

| Method | Endpoint | Query Params | Mục đích |
|--------|----------|-------------|---------|
| `GET` | `/metadata/departments` | `businessUnit?` | Danh sách phòng ban cho dropdown |
| `GET` | `/metadata/users` | `search?,role?,department?,status?` | Lookup users (assignee, reviewer,...) |
| `GET` | `/metadata/products` | `search?,status?` | Lookup sản phẩm cho dropdown |
| `GET` | `/metadata/suppliers` | `search?,status?` | Lookup nhà cung cấp cho dropdown |
| `GET` | `/metadata/courses` | `search?,status?` | Lookup khoá học cho dropdown |
| `GET` | `/metadata/equipment` | `search?,status?,department?` | Lookup thiết bị |
| `GET` | `/metadata/custom-fields/:module` | - | Cấu hình custom fields theo module |
| `GET` | `/:module/filters` | - | Tất cả options filter cho 1 module cụ thể |

---

### GET `/metadata/departments`

```json
[
  { "id": "uuid", "name": "Quality Assurance", "code": "QA", "businessUnit": "Quality Unit" },
  { "id": "uuid", "name": "Manufacturing", "code": "MFG", "businessUnit": "Operation Unit" }
]
```

---

### GET `/metadata/users`

**Query Params:**
```
search=john
role=QA Manager
department=Quality Assurance
status=Active
```

**Response:**
```json
[
  {
    "id": "uuid",
    "fullName": "John Doe",
    "username": "john.doe",
    "email": "john@pharma.com",
    "role": "QA Manager",
    "department": "Quality Assurance",
    "avatar": "/uploads/avatars/uuid.jpg"
  }
]
```

*Dùng cho: Assignee dropdown, Reviewer, Approver, Instructor, Conducted By, ...*

---

### GET `/:module/filters`

> Mỗi module có endpoint riêng trả về **tất cả options cần thiết cho bộ lọc** của module đó trong một lần gọi.

**Ví dụ: GET `/deviations/filters`**
```json
{
  "categories": [
    { "value": "Product Quality", "label": "Product Quality" },
    { "value": "Process", "label": "Process" },
    { "value": "Equipment", "label": "Equipment" }
  ],
  "severities": [
    { "value": "Critical", "label": "Critical", "color": "#dc2626" },
    { "value": "Major", "label": "Major", "color": "#ea580c" },
    { "value": "Minor", "label": "Minor", "color": "#ca8a04" }
  ],
  "statuses": [
    { "value": "Open", "label": "Open" },
    { "value": "Under Investigation", "label": "Under Investigation" },
    { "value": "Closed", "label": "Closed" }
  ],
  "departments": [
    { "value": "uuid-1", "label": "Quality Assurance" },
    { "value": "uuid-2", "label": "Manufacturing" }
  ],
  "assignees": [
    { "value": "uuid-user-1", "label": "John Doe (QA)" }
  ]
}
```

**Tương tự cho các module khác:**
- `GET /documents/filters` → types, statuses, departments, classifications
- `GET /capa/filters` → types, sources, statuses, departments
- `GET /complaints/filters` → types, priorities, statuses, sources
- `GET /equipment/filters` → types, statuses, locations, departments
- `GET /suppliers/filters` → categories, statuses, riskRatings, countries
- `GET /risks/filters` → categories, levels, statuses, assessmentMethods
- `GET /regulatory/filters` → types, authorities, statuses
- `GET /training/filters` → types, categories, statuses
- `GET /change-control/filters` → types, impacts, statuses

---

### GET `/metadata/custom-fields/:module`

```json
[
  {
    "fieldId": "cf_001",
    "label": "Batch Size (kg)",
    "fieldType": "number",
    "required": false,
    "module": "deviations"
  },
  {
    "fieldId": "cf_002",
    "label": "Root Cause Category",
    "fieldType": "select",
    "required": true,
    "options": [
      { "value": "human_error", "label": "Human Error" },
      { "value": "equipment_failure", "label": "Equipment Failure" }
    ],
    "module": "deviations"
  }
]
```

---

## 4. Global Search & Saved Filters

### Endpoints

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/search` | Tìm kiếm toàn cục |
| `GET` | `/search/suggestions` | Gợi ý tìm kiếm (autocomplete) |
| `GET` | `/search/:module` | Tìm kiếm trong 1 module |
| `GET` | `/search/recent` | Lịch sử tìm kiếm gần đây |
| `DELETE` | `/search/recent` | Xoá lịch sử tìm kiếm |
| `GET` | `/search/saved` | Danh sách bộ lọc đã lưu |
| `POST` | `/search/saved` | Lưu bộ lọc |
| `DELETE` | `/search/saved/:id` | Xoá bộ lọc đã lưu |

---

### GET `/search`

> Keyboard shortcut: `Ctrl+K` / `Cmd+K` — tìm kiếm toàn hệ thống với debounce 300ms.

**Query Params:**
```
q=amoxicillin           # bắt buộc
modules=documents,capa  # optional, mặc định tìm tất cả
limit=10                # optional, mặc định 10
highlight=true          # optional, highlight kết quả tìm
```

**Response:**
```json
{
  "took": 45,
  "total": 23,
  "results": {
    "documents": [
      {
        "id": "uuid",
        "entityType": "document",
        "title": "SOP for Amoxicillin Batch Release",
        "highlight": "SOP for <em>Amoxicillin</em> Batch Release",
        "status": "Effective",
        "url": "/documents/uuid",
        "updatedAt": "2026-04-10T08:00:00Z"
      }
    ],
    "deviations": [ ... ],
    "capa": [ ... ]
  }
}
```

---

### GET `/search/suggestions`

> Kích hoạt sau khi gõ tối thiểu 2 ký tự.

**Query Params:** `q=amox&modules=documents&limit=5`

**Response:**
```json
[
  { "text": "Amoxicillin 500mg Batch Release", "module": "documents", "entityId": "uuid", "type": "SOP" },
  { "text": "Amoxicillin OOS Investigation", "module": "deviations", "entityId": "uuid", "type": "Major" }
]
```

---

### GET `/search/recent`

```json
[
  { "query": "amoxicillin", "searchedAt": "2026-04-21T09:00:00Z" },
  { "query": "CAPA overdue", "searchedAt": "2026-04-20T14:30:00Z" }
]
```

---

### POST `/search/saved`

**Request:**
```json
{
  "name": "My Open Deviations",
  "module": "deviations",
  "filters": {
    "statusFilter": "Open",
    "severityFilter": "Major",
    "department": "Quality Control"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Open Deviations",
  "module": "deviations",
  "filters": { "statusFilter": "Open", "severityFilter": "Major" },
  "createdAt": "2026-04-21T10:00:00Z"
}
```

---

## 5. Sidebar Favorites

> Người dùng có thể đánh dấu ⭐ bất kỳ mục menu nào (leaf item). Dữ liệu cần được persist qua API để dùng trên nhiều thiết bị.

### Endpoints

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/preferences/favorites` | Lấy danh sách menu yêu thích của user |
| `POST` | `/preferences/favorites` | Thêm mục vào yêu thích |
| `DELETE` | `/preferences/favorites/:navItemId` | Xoá mục khỏi yêu thích |
| `PUT` | `/preferences/favorites/reorder` | Sắp xếp lại thứ tự yêu thích |

---

### GET `/preferences/favorites`

**Response:**
```json
[
  {
    "navItemId": "documents-all",
    "label": "All Documents",
    "path": "/documents",
    "icon": "FileText",
    "parentLabel": "Document Control",
    "order": 0
  },
  {
    "navItemId": "capa-list",
    "label": "CAPA List",
    "path": "/capa",
    "icon": "ClipboardCheck",
    "parentLabel": "Quality Events",
    "order": 1
  }
]
```

---

### POST `/preferences/favorites`

**Request:**
```json
{
  "navItemId": "training-compliance",
  "label": "Compliance Tracking",
  "path": "/training/compliance",
  "icon": "GraduationCap",
  "parentLabel": "Training Management"
}
```

---

### PUT `/preferences/favorites/reorder`

**Request:**
```json
{
  "orderedIds": ["documents-all", "training-compliance", "capa-list"]
}
```

---

## 6. Count & Badge APIs

> Dùng để hiển thị badge số đếm trên sidebar và dashboard. Endpoint `/count/my-actions` được poll mỗi 30 giây.

| Method | Endpoint | Query Params | Mục đích |
|--------|----------|-------------|---------|
| `GET` | `/count/all` | - | Đếm tất cả module (cache 60s) |
| `GET` | `/count/my-actions` | - | Số việc cần làm của user hiện tại |
| `GET` | `/count/:module` | Filter params tương tự module đó | Đếm theo filter |

---

### GET `/count/my-actions`

> Poll interval: 30 giây.

```json
{
  "pendingApprovals": 3,
  "pendingReviews": 7,
  "myTasks": 12,
  "overdueTasks": 2,
  "unreadNotifications": 5
}
```

---

### GET `/count/all`

```json
{
  "documents": { "total": 340, "draft": 12, "pendingApproval": 5 },
  "deviations": { "total": 48, "open": 15, "overdue": 3 },
  "capa": { "total": 32, "inProgress": 10 },
  "complaints": { "total": 21, "received": 6 },
  "equipment": { "total": 67, "calibrationDue": 4, "maintenanceDue": 2 },
  "training": { "total": 89, "overdue": 11 },
  "suppliers": { "total": 45, "certificatesExpiring": 3 }
}
```

---

### GET `/count/:module`

**Ví dụ:** `GET /count/deviations?statusFilter=Open&severityFilter=Major`

```json
{ "count": 8 }
```

---

## 7. Documents

### 7.1 CRUD & Danh sách

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/documents` | Danh sách tài liệu |
| `GET` | `/documents/:id` | Chi tiết tài liệu |
| `POST` | `/documents` | Tạo tài liệu mới |
| `PUT` | `/documents/:id` | Cập nhật tài liệu |
| `DELETE` | `/documents/:id` | Xoá tài liệu (chỉ Draft) |
| `GET` | `/documents/stats` | Thống kê theo trạng thái |
| `GET` | `/documents/export` | Xuất danh sách XLSX |
| `GET` | `/documents/:id/file/download` | Tải file tài liệu |
| `POST` | `/documents/:id/file` | Upload file cho tài liệu (`multipart/form-data`) |

**Filter Params cho `GET /documents`:**
```
page=1&limit=10
search=SOP batch release
status=Effective
type=SOP
owner=uuid-user
department=Quality Control
businessUnit=Quality Unit
isTemplate=false
relatedDocument=uuid-doc
correlatedDocument=uuid-doc
dateFrom=2026-01-01
dateTo=2026-04-21
sort=updatedAt&order=desc
```

**Request: POST `/documents`**
```json
{
  "title": "SOP for Batch Release Testing",
  "titleLocalLanguage": "Quy trình kiểm tra trước khi xuất lô",
  "type": "SOP",
  "subType": "Manufacturing",
  "businessUnit": "Quality Unit",
  "department": "Quality Control",
  "knowledgeBase": "GMP",
  "language": "en",
  "description": "Standard procedure for batch release testing per EU GMP Annex 1",
  "isTemplate": false,
  "author": "uuid-author",
  "coAuthors": ["uuid-co-author-1"],
  "effectiveDate": "2026-05-01",
  "validUntil": "2028-05-01",
  "periodicReviewCycle": 24,
  "periodicReviewNotification": 30,
  "reviewFlowType": "sequential",
  "reviewers": [
    { "userId": "uuid-reviewer-1", "order": 1 },
    { "userId": "uuid-reviewer-2", "order": 2 }
  ],
  "approvers": [
    { "userId": "uuid-approver", "order": 1 }
  ],
  "parentDocumentId": "uuid-parent",
  "relatedDocuments": [
    { "documentId": "uuid-rel", "relationshipType": "reference" }
  ],
  "correlatedDocuments": [
    { "documentId": "uuid-corr", "correlationType": "supersedes" }
  ]
}
```

> **periodicReviewCycle**: số tháng giữa mỗi lần review định kỳ  
> **periodicReviewNotification**: số ngày trước hạn review để gửi thông báo  
> **relationshipType**: `reference | supersedes | child`

**Response: Document**
```json
{
  "id": "uuid",
  "documentId": "SOP-QC-2026-001",
  "title": "SOP for Batch Release Testing",
  "titleLocalLanguage": "Quy trình kiểm tra trước khi xuất lô",
  "type": "SOP",
  "subType": "Manufacturing",
  "version": "1.0",
  "status": "Draft",
  "businessUnit": "Quality Unit",
  "department": "Quality Control",
  "knowledgeBase": "GMP",
  "language": "en",
  "description": "...",
  "isTemplate": false,
  "author": "uuid-author",
  "authorName": "Jane Smith",
  "coAuthors": ["uuid-co-author-1"],
  "effectiveDate": "2026-05-01",
  "validUntil": "2028-05-01",
  "periodicReviewCycle": 24,
  "periodicReviewNotification": 30,
  "reviewFlowType": "sequential",
  "reviewers": [
    { "userId": "uuid-1", "fullName": "Bob Lee", "role": "Reviewer", "department": "QC", "order": 1, "status": "Pending" }
  ],
  "approvers": [
    { "userId": "uuid-approver", "fullName": "Dr. Alice Wang", "role": "Approver", "department": "QA", "order": 1, "status": "Pending" }
  ],
  "openedBy": "uuid-user",
  "openedByName": "Jane Smith",
  "createdAt": "2026-04-21T10:00:00Z",
  "updatedAt": "2026-04-21T10:00:00Z"
}
```

**GET `/documents/stats`**
```json
{
  "total": 340,
  "draft": 12,
  "pendingReview": 8,
  "pendingApproval": 5,
  "active": 15,
  "pendingTraining": 6,
  "readyForPublishing": 3,
  "published": 20,
  "effective": 241,
  "archive": 10,
  "obsoleted": 20,
  "closedCancelled": 0
}
```

---

### 7.2 Document Workflow (Document cha)

> Workflow chi tiết (review/approval/training/publish) áp dụng cho **Revision**.  
> `Document` chỉ quản lý trạng thái mức cao: `Draft | Active | Closed - Cancelled | Obsoleted`.

| Method | Endpoint | Request Body | Mục đích |
|--------|----------|-------------|---------|
| `POST` | `/documents/:id/cancel` | `{ summary }` | Huỷ document (Draft/Active → Closed - Cancelled) |
| `POST` | `/documents/:id/obsolete` | `{ signatureToken, summary, obsoleteDate? }` | Obsolete document (Active → Obsoleted) |
| `POST` | `/documents/:id/reopen` | `{ summary }` | Mở lại từ closed state về trạng thái trước khi đóng |

> `signatureToken` là token ngắn hạn (5 phút) lấy từ `POST /auth/verify-signature` (21 CFR Part 11).

**Response chung cho workflow endpoints** — `200 OK`:
```json
{
  "success": true,
  "documentId": "uuid",
  "previousStatus": "Active",
  "currentStatus": "Obsoleted",
  "transitionedAt": "2026-04-21T10:00:00Z",
  "transitionedBy": "dco.owner",
  "message": "Document obsoleted successfully."
}
```

#### State Machine — Document

```
               (create)
                  │
                  ▼
               [Draft]
                  │
                  │ BR_DOCR01: first revision submit
                  ▼
               [Active]
                │   │
      cancel()  │   │ obsolete(signature)
                ▼   ▼
 [Closed - Cancelled] [Obsoleted]
                │         │
                └── reopen(summary) ──► previous state before closure
```

**Bảng chuyển trạng thái hợp lệ (Document):**

| Trạng thái hiện tại | Action | Trạng thái tiếp theo | Điều kiện |
|---------------------|--------|---------------------|-----------|
| `Draft` | `cancel` | `Closed - Cancelled` | `summary` bắt buộc |
| `Active` | `cancel` | `Closed - Cancelled` | `summary` bắt buộc |
| `Active` | `obsolete` | `Obsoleted` | Cần `signatureToken` |
| `Closed - Cancelled` | `reopen` | `Draft` hoặc `Active` | quay về trạng thái trước khi đóng |
| `Obsoleted` | `reopen` | `Active` | chỉ DCO Owner |

> Mọi action không hợp lệ trả về `409 Conflict` với `INVALID_TRANSITION` (xem bảng chuẩn hoá lỗi tại mục 7.3.6).

---

### 7.3 Revisions (Document Revision Workflow)

| Method | Endpoint | Query / Body | Mục đích |
|--------|----------|-------------|---------|
| `GET` | `/revisions` | Xem params bên dưới | Danh sách tất cả revisions |
| `GET` | `/documents/:id/revisions` | `page, limit` | Revisions của một document cụ thể |
| `GET` | `/revisions/:id` | — | Chi tiết revision |
| `POST` | `/documents/:id/revisions` | `{ revisionName, changeDescription, revisionType }` | Tạo revision mới |
| `PUT` | `/revisions/:id` | Partial fields | Cập nhật revision (chỉ khi chưa locked) |
| `DELETE` | `/revisions/:id` | — | Xoá revision (chỉ `Draft`) |
| `POST` | `/revisions/:id/upload` | `FormData{ file, note?, useTemplate?, templateId? }` | Upload/thay file revision |
| `GET` | `/revisions/:id/file/download` | — | Tải file revision |
| `POST` | `/revisions/:id/submit` | `{ signatureToken }` | DCO submit revision (`Draft` → `Pending Review`) |
| `POST` | `/revisions/:id/review` | `{ signatureToken, decision, comment }` | Reviewer xử lý review |
| `POST` | `/revisions/:id/approve` | `{ signatureToken, comment }` | Approver phê duyệt |
| `POST` | `/revisions/:id/reject` | `{ signatureToken, reason, summary }` | Reviewer/Approver từ chối (→ `Draft`) |
| `POST` | `/revisions/:id/complete-training` | `{ signatureToken }` | Xác nhận hoàn tất training (→ `Ready for Publishing`) |
| `POST` | `/revisions/:id/publish` | `{ signatureToken, effectiveDate }` | DCO Owner publish revision |
| `POST` | `/revisions/:id/obsolete` | `{ signatureToken, summary }` | Obsolete revision |
| `POST` | `/revisions/:id/cancel` | `{ summary }` | Huỷ revision (`Draft` → `Closed - Cancelled`) |

**Filter Params cho `GET /revisions`:**
```
page=1&limit=10
search=SOP batch
state=Pending Review
type=SOP
businessUnit=Quality Unit
department=Quality Control
author=uuid-user
ownedByMe=true
pendingReview=true
pendingApproval=true
relatedDocument=uuid-doc
correlatedDocument=uuid-doc
isTemplate=false
createdFrom=01/01/2026
createdTo=21/04/2026
effectiveFrom=01/05/2026
effectiveTo=31/12/2026
validFrom=01/01/2026
validTo=31/12/2028
sort=revisionName&order=asc
```

**revisionType:** `Major | Minor`

**Response: Revision**
```json
{
  "id": "uuid",
  "documentNumber": "SOP-QC-2026-001",
  "revisionNumber": "REV-001",
  "revisionName": "Annual review update",
  "changeDescription": "Updated section 3.2 per latest EU GMP guidance",
  "revisionType": "Minor",
  "state": "Pending Review",
  "isLocked": true,
  "lockReason": "Pending Review - content editing disabled",
  "documentName": "SOP for Batch Release Testing",
  "type": "SOP",
  "author": "Jane Smith",
  "coAuthors": [],
  "businessUnit": "Quality Unit",
  "department": "Quality Control",
  "effectiveDate": "2026-05-01",
  "validUntil": "2028-05-01",
  "isTemplate": false,
  "created": "21/04/2026",
  "openedBy": "jane.smith",
  "reviewers": [{ "userId": "uuid", "fullName": "Bob Lee", "order": 1, "status": "Pending" }],
  "approvers": [{ "userId": "uuid", "fullName": "Dr. Alice Wang", "order": 1, "status": "Pending" }],
  "reviewFlowType": "sequential",
  "hasRelatedDocuments": true,
  "hasCorrelatedDocuments": false,
  "trainingPlannedDate": null,
  "trainingPeriodEndDate": null,
  "trainingCompletionDate": null
}
```

#### State Machine — Revision

```
[Draft]
  ├─ cancel(summary) ─────────────────────────────► [Closed - Cancelled]
  └─ submit(signature, DCO) ─────────────────────► [Pending Review] (locked)
                        ├─ review(rejected) ─────► [Draft]
                        └─ review(approved all) ─► [Pending Approval] (locked)
                                    ├─ reject ───► [Draft]
                                    └─ approve(all)► [Pending Training] (locked)
                                                     ├─ complete-training ─► [Ready for Publishing] (locked)
                                                     └─ BR_TRG07 (auto) ───► [Ready for Publishing] (locked)
 [Ready for Publishing] -- publish(signature) ----► [Effective] (locked)
 [Effective] ---------- obsolete(signature) ------► [Obsoleted]
```

> Locked states: `Pending Review`, `Pending Approval`, `Pending Training`, `Ready for Publishing`, `Effective`.

---

### 7.3.1 Revision Reviewers / Approvers

| Method | Endpoint | Body | Mục đích |
|--------|----------|------|---------|
| `GET` | `/revisions/:id/reviewers` | — | Danh sách reviewers |
| `PUT` | `/revisions/:id/reviewers` | `{ reviewers: [{userId, order}], reviewFlowType }` | Thay thế danh sách reviewers |
| `GET` | `/revisions/:id/approvers` | — | Danh sách approvers |
| `PUT` | `/revisions/:id/approvers` | `{ approvers: [{userId, order}] }` | Thay thế danh sách approvers |

**Ràng buộc cập nhật theo workflow:**
- Reviewers: nếu revision **chưa** vào `Pending Review`, cập nhật áp dụng cho revision hiện tại; nếu đã vào `Pending Review` trở đi, thay đổi chỉ áp dụng cho revision tương lai.
- Approvers: nếu revision **chưa** vào `Pending Approval`, cập nhật áp dụng cho revision hiện tại; nếu đã vào `Pending Approval` trở đi, thay đổi chỉ áp dụng cho revision tương lai.

Khi vi phạm ràng buộc, trả về `409 REVIEWER_APPROVER_LOCKED` (xem mục 7.3.6).

---

### 7.3.2 Working Notes (Revision)

> Ghi chú nội bộ trong quá trình soạn thảo/review. Chỉ hiển thị cho người tham gia revision.

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/revisions/:id/working-notes` | Danh sách working notes |
| `POST` | `/revisions/:id/working-notes` | Thêm ghi chú |
| `DELETE` | `/revisions/:id/working-notes/:noteId` | Xoá ghi chú (chỉ tác giả) |

**POST body:**
```json
{ "content": "Updated section 3.2 - please re-check references to Annex 1." }
```

**Response item:**
```json
{
  "id": "uuid",
  "author": "Jane Smith",
  "authorId": "uuid-user",
  "content": "Updated section 3.2...",
  "timestamp": "2026-04-21T10:00:00Z"
}
```

---

### 7.3.3 Training Info (Revision)

| Method | Endpoint | Body | Mục đích |
|--------|----------|------|---------|
| `GET` | `/revisions/:id/training-info` | — | Lấy thông tin training của revision |
| `PUT` | `/revisions/:id/training-info` | Xem bên dưới | Cập nhật thông tin training |

**PUT body:**
```json
{
  "trainingPlannedDate": "2026-05-15",
  "trainingPeriodEndDate": "2026-06-15",
  "trainingCompletionDate": null
}
```

---

### 7.3.4 Impact Analysis — Linked Documents

> Khi tạo revision mới, hệ thống phân tích tài liệu liên kết (related docs). User quyết định mỗi tài liệu liên kết cần "Upgrade" (tạo revision mới) hay "Keep Current" (giữ nguyên). Sau đó workspace cho phép upload file cho tất cả tài liệu cần upgrade cùng lúc.

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| `GET` | `/documents/:id/linked-documents` | Lấy danh sách tài liệu liên kết để phân tích impact |
| `POST` | `/revisions/batch` | Tạo nhiều revisions cùng lúc (sau impact analysis) |

**GET `/documents/:id/linked-documents` response:**
```json
[
  {
    "id": "uuid",
    "code": "FORM.0001.01",
    "name": "Quality Control Test Record Form",
    "type": "Form",
    "currentVersion": "1.0",
    "nextVersion": "2.0",
    "status": "Active",
    "author": "Jane Smith",
    "department": "Quality Control",
    "businessUnit": "Quality Unit"
  }
]
```

**POST `/revisions/batch`** — tạo revisions cho nhiều documents từ impact analysis:
```json
{
  "sourceDocumentId": "uuid-source",
  "reasonForChange": "Annual review update per EU GMP guidance",
  "revisionType": "Minor",
  "documents": [
    {
      "documentId": "uuid-doc-1",
      "revisionName": "Annual review update",
      "file": "<base64 hoặc dùng multipart>"
    },
    {
      "documentId": "uuid-doc-2",
      "revisionName": "Annual review update",
      "file": "<base64 hoặc dùng multipart>"
    }
  ],
  "reviewers": [{ "userId": "uuid", "order": 1 }],
  "approvers": [{ "userId": "uuid", "order": 1 }],
  "reviewFlowType": "sequential"
}
```

> **Note:** Nếu dùng multipart/form-data cho batch upload, frontend submit từng file riêng theo `documentId`, sau đó gọi `POST /revisions/batch` với metadata (không kèm file). Backend ghép file đã upload từ temporary storage.

**Response:** Mảng các `Revision` object vừa tạo.

---

### 7.3.5 Business Rules & Side Effects (Document + Revision)

| Rule | Trigger | Side Effect bắt buộc |
|------|---------|----------------------|
| `BR_DOCR01` | `POST /revisions/:id/submit` lần đầu của document | Document cha tự động chuyển `Draft` → `Active` |
| `BR_DOC02` | `POST /documents/:id/obsolete` | Toàn bộ revisions chưa đóng của document đó chuyển `Obsoleted` |
| `BR_DOCR02` | Revision được publish/effective | Các revisions đang mở của cùng document tự động obsolete |
| `BR_DOCR06` | Revision vào `Pending Review`, `Pending Approval`, hoặc `Effective` | Tự động convert file Word sang PDF |
| `BR_DOCR11` | `POST /revisions/:id/publish` | Tự động tạo Knowledge Article theo `knowledgeBase` của document cha |
| `BR_DOCR16` | Publish revision mới | Tất cả revision cũ hơn của cùng document bị obsolete |
| `BR_TRG07` | `trainingPeriodEndDate == today` | Job scheduler tự động chuyển `Pending Training` → `Ready for Publishing` |

> Tất cả side effects trên phải được ghi đầy đủ vào Audit Trail (`module: Document/Revision`, `action: Update/Publish/Obsolete`, có `changes[]`).

---

### 7.3.6 Error Codes chuẩn hoá cho Document/Revision Workflow

> Mục tiêu: backend trả lỗi nhất quán cho toàn bộ workflow tại 7.2 và 7.3.

**Error response envelope (chuẩn dùng chung):**
```json
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot approve revision in state Draft.",
  "status": 409,
  "workflow": "revision",
  "resourceId": "uuid-revision",
  "currentState": "Draft",
  "allowedActions": ["submit", "cancel"],
  "traceId": "req-4f4b2f1f-0a3f-4f19-9c38-7f4d9d0f0198",
  "timestamp": "2026-04-21T10:00:00Z"
}
```

**Validation error envelope:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request payload is invalid.",
  "status": 422,
  "details": [
    { "field": "trainingPeriodEndDate", "code": "DATE_BEFORE_START", "message": "Must be greater than trainingPlannedDate." }
  ],
  "traceId": "req-f95c178d-b62e-4f4f-bf18-072366ec14b8",
  "timestamp": "2026-04-21T10:00:00Z"
}
```

**Danh sách mã lỗi nghiệp vụ chuẩn:**

| Error Code | HTTP | Áp dụng | Ý nghĩa |
|-----------|------|---------|---------|
| `INVALID_TRANSITION` | `409` | Mọi workflow actions | Action không hợp lệ với trạng thái hiện tại |
| `REVISION_LOCKED` | `409` | `PUT /revisions/:id`, `POST /revisions/:id/upload` | Revision đang ở locked state, không cho sửa nội dung |
| `REVIEWER_APPROVER_LOCKED` | `409` | `PUT /revisions/:id/reviewers`, `PUT /revisions/:id/approvers` | Không còn được đổi reviewer/approver cho revision hiện tại |
| `PENDING_REVISION_EXISTS` | `409` | `POST /documents/:id/revisions` | Document đã có revision đang mở, chưa cho tạo revision mới |
| `TRAINING_INFO_LOCKED` | `409` | `PUT /revisions/:id/training-info` | Không được sửa training info khi revision đã vượt mốc cho phép |
| `REVISION_FILE_REQUIRED` | `422` | `POST /revisions/:id/submit` | Chưa có file revision hợp lệ trước khi submit |
| `INVALID_REVIEW_DECISION` | `422` | `POST /revisions/:id/review` | Giá trị `decision` không thuộc tập cho phép |
| `INVALID_DATE_RANGE` | `422` | `PUT /revisions/:id/training-info`, `POST /revisions/:id/publish` | Khoảng ngày không hợp lệ |
| `ESIGN_REQUIRED` | `401` | Endpoints yêu cầu e-signature | Thiếu chữ ký điện tử hoặc signatureToken |
| `ESIGN_INVALID` | `401` | Endpoints yêu cầu e-signature | signatureToken sai/hết hạn |
| `NOT_ASSIGNED_REVIEWER` | `403` | `POST /revisions/:id/review` | User không nằm trong danh sách reviewer hợp lệ |
| `NOT_ASSIGNED_APPROVER` | `403` | `POST /revisions/:id/approve`, `POST /revisions/:id/reject` | User không nằm trong danh sách approver hợp lệ |
| `ROLE_NOT_ALLOWED` | `403` | `submit/publish/obsolete/reopen` | Sai vai trò thực hiện action (DCO, DCO Owner...) |
| `ALREADY_DECIDED` | `409` | `review/approve/reject` | User đã ký quyết định ở bước hiện tại |
| `ENTITY_NOT_FOUND` | `404` | Mọi endpoints | Không tìm thấy document/revision |
| `DEPENDENCY_SIDE_EFFECT_FAILED` | `424` | publish/obsolete actions | Lỗi side effect bắt buộc (PDF convert, KB sync, cascade obsolete) |

**Mapping tối thiểu theo action (để backend implement thống nhất):**

| Endpoint | Error codes bắt buộc hỗ trợ |
|----------|-----------------------------|
| `POST /documents/:id/cancel` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ROLE_NOT_ALLOWED`, `VALIDATION_ERROR` |
| `POST /documents/:id/obsolete` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED`, `DEPENDENCY_SIDE_EFFECT_FAILED` |
| `POST /documents/:id/reopen` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ROLE_NOT_ALLOWED` |
| `POST /revisions/:id/submit` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED`, `REVISION_FILE_REQUIRED` |
| `POST /revisions/:id/review` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `NOT_ASSIGNED_REVIEWER`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `INVALID_REVIEW_DECISION`, `ALREADY_DECIDED` |
| `POST /revisions/:id/approve` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `NOT_ASSIGNED_APPROVER`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ALREADY_DECIDED` |
| `POST /revisions/:id/reject` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED`, `ALREADY_DECIDED` |
| `POST /revisions/:id/complete-training` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED` |
| `POST /revisions/:id/publish` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED`, `INVALID_DATE_RANGE`, `DEPENDENCY_SIDE_EFFECT_FAILED` |
| `POST /revisions/:id/obsolete` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED`, `DEPENDENCY_SIDE_EFFECT_FAILED` |
| `POST /revisions/:id/cancel` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ROLE_NOT_ALLOWED`, `VALIDATION_ERROR` |
| `PUT /revisions/:id` | `ENTITY_NOT_FOUND`, `REVISION_LOCKED`, `VALIDATION_ERROR` |
| `POST /revisions/:id/upload` | `ENTITY_NOT_FOUND`, `REVISION_LOCKED`, `VALIDATION_ERROR` |
| `PUT /revisions/:id/reviewers` | `ENTITY_NOT_FOUND`, `REVIEWER_APPROVER_LOCKED`, `VALIDATION_ERROR` |
| `PUT /revisions/:id/approvers` | `ENTITY_NOT_FOUND`, `REVIEWER_APPROVER_LOCKED`, `VALIDATION_ERROR` |
| `PUT /revisions/:id/training-info` | `ENTITY_NOT_FOUND`, `TRAINING_INFO_LOCKED`, `INVALID_DATE_RANGE`, `VALIDATION_ERROR` |

**Quy ước triển khai backend:**
- Luôn trả cả `error` và `status` trong body khi lỗi nghiệp vụ.
- `message` dùng cho người dùng cuối; `error` dùng cho frontend mapping logic.
- Với `409 INVALID_TRANSITION`, bắt buộc trả thêm `currentState` và `allowedActions`.
- Mọi lỗi workflow phải được ghi Audit Trail với `module`, `action`, `entityId`, `metadata.errorCode`.

---

### 7.3.7 Chi tiết triển khai workflow (Backend Contract)

#### A. Role-Permission Matrix (bắt buộc)

| Endpoint | Author | Reviewer | Approver | DCO | DCO Owner | System Scheduler |
|----------|--------|----------|----------|-----|-----------|------------------|
| `POST /documents/:id/cancel` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `POST /documents/:id/obsolete` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `POST /documents/:id/reopen` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `POST /documents/:id/revisions` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `POST /revisions/:id/submit` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `POST /revisions/:id/review` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /revisions/:id/approve` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `POST /revisions/:id/reject` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /revisions/:id/complete-training` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ (BR_TRG07 auto) |
| `POST /revisions/:id/publish` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `POST /revisions/:id/obsolete` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

> Nếu user không có quyền theo bảng trên: trả `403 ROLE_NOT_ALLOWED`.

#### B. State Guard Rules (bắt buộc enforce server-side)

| Endpoint | Current state hợp lệ | Nếu sai state |
|----------|----------------------|---------------|
| `POST /revisions/:id/submit` | `Draft` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/review` | `Pending Review` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/approve` | `Pending Approval` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/complete-training` | `Pending Training` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/publish` | `Ready for Publishing` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/obsolete` | `Effective` | `409 INVALID_TRANSITION` |
| `POST /revisions/:id/cancel` | `Draft` | `409 INVALID_TRANSITION` |
| `PUT /revisions/:id` | `Draft` | `409 REVISION_LOCKED` |
| `POST /revisions/:id/upload` | `Draft` | `409 REVISION_LOCKED` |

#### C. Request headers chuẩn

| Header | Required | Mục đích |
|--------|----------|----------|
| `Authorization: Bearer <token>` | Có | Xác thực phiên |
| `X-CSRF-Token` | Có (cookie flow) | Chống CSRF |
| `X-Request-Id` | Khuyến nghị | Truy vết request |
| `Idempotency-Key` | Khuyến nghị cho `submit/approve/publish/obsolete` | Chống gửi trùng do retry |

> Với các action có e-signature, `signatureToken` vẫn bắt buộc trong body theo các mục 7.2/7.3.

#### D. Idempotency & Retry semantics

- Nếu client retry cùng `Idempotency-Key` trong vòng 24h và payload giống nhau, server trả lại cùng kết quả lần đầu (`200` hoặc lỗi đã phát sinh).
- Nếu cùng `Idempotency-Key` nhưng payload khác, trả `409 IDEMPOTENCY_KEY_REUSED`.
- Các endpoint khuyến nghị bắt buộc hỗ trợ idempotency:  
  `POST /revisions/:id/submit`, `POST /revisions/:id/approve`, `POST /revisions/:id/publish`, `POST /documents/:id/obsolete`.

#### E. Concurrency control

- `GET /revisions/:id` và `GET /documents/:id` trả thêm `version` (int) hoặc `etag`.
- Với endpoint cập nhật (`PUT /revisions/:id`, `PUT /revisions/:id/training-info`, reviewer/approver update), client gửi `If-Match` hoặc `version`.
- Nếu version mismatch: trả `409 VERSION_CONFLICT`.

**Ví dụ response object có version:**
```json
{
  "id": "uuid",
  "state": "Draft",
  "version": 12,
  "updatedAt": "2026-04-21T10:00:00Z"
}
```

---

### 7.3.8 Luồng mẫu end-to-end (Request/Response)

#### Luồng 1: Submit revision (DCO)

**Request**
```http
POST /revisions/uuid-rev-001/submit
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf>
Idempotency-Key: 3d3f9a32-2dc9-4a9d-a22e-8f86f3120ac1
Content-Type: application/json

{
  "signatureToken": "sig-otp-token-5min"
}
```

**Response `200`**
```json
{
  "success": true,
  "revisionId": "uuid-rev-001",
  "previousState": "Draft",
  "currentState": "Pending Review",
  "isLocked": true,
  "transitionedAt": "2026-04-21T10:05:00Z",
  "transitionedBy": "dco.user",
  "sideEffects": [
    { "code": "BR_DOCR01", "status": "DONE", "message": "Parent document moved to Active" },
    { "code": "BR_DOCR06", "status": "DONE", "message": "Word file converted to PDF" },
    { "code": "BR_DOCR03", "status": "DONE", "message": "Reviewer notifications sent" }
  ]
}
```

#### Luồng 2: Review rejected (Reviewer)

**Request**
```http
POST /revisions/uuid-rev-001/review
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf>
Content-Type: application/json

{
  "signatureToken": "sig-otp-token-5min",
  "decision": "rejected",
  "comment": "Section 4.2 lacks acceptance criteria"
}
```

**Response `200`**
```json
{
  "success": true,
  "revisionId": "uuid-rev-001",
  "previousState": "Pending Review",
  "currentState": "Draft",
  "isLocked": false,
  "message": "Revision sent back to Draft."
}
```

#### Luồng 3: Publish revision (DCO Owner)

**Request**
```http
POST /revisions/uuid-rev-001/publish
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf>
Idempotency-Key: 0a7777cc-b8d8-4f64-b74d-b5ea8843f72a
Content-Type: application/json

{
  "signatureToken": "sig-otp-token-5min",
  "effectiveDate": "2026-04-22"
}
```

**Response `200`**
```json
{
  "success": true,
  "revisionId": "uuid-rev-001",
  "previousState": "Ready for Publishing",
  "currentState": "Effective",
  "isLocked": true,
  "sideEffects": [
    { "code": "BR_DOCR06", "status": "DONE", "message": "Final PDF generated" },
    { "code": "BR_DOCR11", "status": "DONE", "message": "Knowledge article created" },
    { "code": "BR_DOCR16", "status": "DONE", "message": "Older revisions obsoleted" }
  ]
}
```

#### Luồng 4: Ví dụ lỗi chuẩn `INVALID_TRANSITION`

**Request**
```http
POST /revisions/uuid-rev-001/approve
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf>
Content-Type: application/json

{
  "signatureToken": "sig-otp-token-5min",
  "comment": "Approved"
}
```

**Response `409`**
```json
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot approve revision in state Pending Review.",
  "status": 409,
  "workflow": "revision",
  "resourceId": "uuid-rev-001",
  "currentState": "Pending Review",
  "allowedActions": ["review", "reject"],
  "traceId": "req-d2f9a6d7-3556-4f71-a443-166569cc5675",
  "timestamp": "2026-04-21T10:10:00Z"
}
```

#### Luồng 5: Ví dụ lỗi chuẩn `REVISION_LOCKED`

**Request**
```http
PUT /revisions/uuid-rev-001
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf>
Content-Type: application/json

{
  "revisionName": "Hotfix wording"
}
```

**Response `409`**
```json
{
  "error": "REVISION_LOCKED",
  "message": "Revision content is locked in state Pending Approval.",
  "status": 409,
  "currentState": "Pending Approval",
  "traceId": "req-710885b5-2d11-4ab7-b74f-f80ded5a5e65",
  "timestamp": "2026-04-21T10:12:00Z"
}
```

---

### 7.4 Related & Correlated Documents

| Method | Endpoint | Body | Mục đích |
|--------|----------|------|---------|
| `GET` | `/documents/:id/related` | — | Danh sách tài liệu liên quan |
| `POST` | `/documents/:id/related` | `{ documentId, relationshipType }` | Thêm tài liệu liên quan |
| `DELETE` | `/documents/:id/related/:relatedId` | — | Gỡ liên kết |
| `GET` | `/documents/:id/correlated` | — | Danh sách tài liệu tương quan |
| `POST` | `/documents/:id/correlated` | `{ documentId, correlationType }` | Thêm tài liệu tương quan |
| `DELETE` | `/documents/:id/correlated/:correlatedId` | — | Gỡ liên kết |

> **relationshipType**: `reference | supersedes | child`  
> **correlationType**: chuỗi tuỳ ý (ví dụ `supersedes`, `referenced-by`, `replaces`)

#### 7.4.1 Quy tắc nghiệp vụ

- Không cho phép self-link: `documentId` trong body không được trùng `:id` trên URL.
- Không cho phép duplicate link cùng cặp (`sourceDocumentId`, `targetDocumentId`, `relationshipType`).
- Nếu relation là `supersedes`, mỗi document chỉ có tối đa 1 target active tại cùng thời điểm.
- Xoá relation chỉ là unlink, không xoá document thật.

#### 7.4.2 Request/Response chuẩn

**POST `/documents/:id/related` body:**
```json
{
  "documentId": "uuid-target",
  "relationshipType": "reference"
}
```

**Response `201`:**
```json
{
  "id": "uuid-link",
  "sourceDocumentId": "uuid-source",
  "targetDocumentId": "uuid-target",
  "relationshipType": "reference",
  "createdAt": "2026-04-21T10:00:00Z",
  "createdBy": "jane.smith"
}
```

**GET `/documents/:id/related` item:**
```json
{
  "id": "uuid-link",
  "documentId": "uuid-target",
  "documentCode": "FORM.0001.01",
  "documentName": "Quality Control Test Record Form",
  "version": "1.0",
  "status": "Active",
  "relationshipType": "reference"
}
```

#### 7.4.3 Error mapping tối thiểu

| Endpoint | Error codes bắt buộc |
|----------|----------------------|
| `POST /documents/:id/related` | `ENTITY_NOT_FOUND`, `RELATION_SELF_LINK`, `RELATION_ALREADY_EXISTS`, `ROLE_NOT_ALLOWED`, `VALIDATION_ERROR` |
| `DELETE /documents/:id/related/:relatedId` | `ENTITY_NOT_FOUND`, `RELATION_NOT_FOUND`, `ROLE_NOT_ALLOWED` |
| `POST /documents/:id/correlated` | `ENTITY_NOT_FOUND`, `RELATION_SELF_LINK`, `RELATION_ALREADY_EXISTS`, `ROLE_NOT_ALLOWED`, `VALIDATION_ERROR` |
| `DELETE /documents/:id/correlated/:correlatedId` | `ENTITY_NOT_FOUND`, `RELATION_NOT_FOUND`, `ROLE_NOT_ALLOWED` |

> Format lỗi dùng chuẩn tại mục 7.3.6.

---

### 7.5 Controlled Copies

| Method | Endpoint | Body / Query | Mục đích |
|--------|----------|-------------|---------|
| `GET` | `/controlled-copies` | `page,limit,status,department,documentId` | Danh sách |
| `GET` | `/controlled-copies/:id` | — | Chi tiết |
| `POST` | `/controlled-copies` | Xem bên dưới | Tạo yêu cầu controlled copy |
| `GET` | `/controlled-copies/locations` | `department?,search?` | Danh sách địa điểm phân phối |
| `POST` | `/controlled-copies/:id/approve` | `{ signatureToken }` | QM phê duyệt |
| `POST` | `/controlled-copies/:id/print` | `{ printedBy, printedAt }` | Ghi nhận in |
| `POST` | `/controlled-copies/:id/distribute` | Xem bên dưới | Phân phối (giao tay) |
| `POST` | `/controlled-copies/:id/sign` | `{ signatureToken, signedAt }` | Người nhận ký xác nhận đã nhận |
| `POST` | `/controlled-copies/:id/recall` | `{ signatureToken, recallReason }` | Thu hồi |
| `POST` | `/controlled-copies/:id/destroy` | `{ signatureToken, destroyReason, witnessedBy }` | Huỷ |
| `GET` | `/controlled-copies/:id/audit-trail` | — | Lịch sử thao tác |

**Request: POST `/controlled-copies`**
```json
{
  "documentId": "uuid-doc",
  "locationId": "LOC-QA-01",
  "locationName": "Quality Assurance Lab",
  "reason": "Daily operations reference for batch release",
  "quantity": 2,
  "signatureToken": "short-lived-jwt-5min",
  "selectedDocumentIds": ["uuid-doc", "uuid-related-doc"]
}
```

**Response: ControlledCopy**
```json
{
  "id": "uuid",
  "documentNumber": "CC-QA-2026-001",
  "status": "Ready for Distribution",
  "currentStage": "Waiting for QM",
  "document": "uuid-doc",
  "name": "SOP for Batch Release Testing",
  "version": "1.0",
  "location": "Quality Assurance Lab",
  "locationCode": "LOC-QA-01",
  "department": "Quality Assurance",
  "reason": "Daily operations reference",
  "openedBy": "jane.smith",
  "createdDate": "21/04/2026",
  "createdTime": "10:00:00",
  "validUntil": "21/04/2027"
}
```

**POST `/controlled-copies/:id/distribute` body:**
```json
{
  "distributionType": "internal",
  "internal": {
    "employees": ["emp-uuid-1", "emp-uuid-2"],
    "groups": ["group-uuid-1"],
    "businessUnits": ["bu-uuid-1"],
    "departments": ["dept-uuid-1"]
  },
  "distributedAt": "2026-04-21T10:00:00Z"
}
```

> Khi `distributionType = "external"`:
> ```json
> {
>   "distributionType": "external",
>   "external": {
>     "type": "external-users",
>     "emails": ["partner@pharma.com", "auditor@agency.org"]
>   },
>   "distributedAt": "2026-04-21T10:00:00Z"
> }
> ```

**GET `/controlled-copies/locations` response:**
```json
[
  { "id": "LOC-QA-01", "code": "LOC-QA-01", "name": "Quality Assurance Lab", "department": "Quality Assurance" },
  { "id": "LOC-PROD-01", "code": "LOC-PROD-01", "name": "Production Floor A", "department": "Production" }
]
```

#### 7.5.1 State machine — Controlled Copy

```
[Draft Request]
  │ approve(signature)
  ▼
[Approved]
  │ print()
  ▼
[Printed]
  │ distribute()
  ▼
[Distributed]
  │ sign(signature)
  ▼
[Acknowledged]
  ├─ recall(signature) ─► [Recalled]
  └─ destroy(signature) ─► [Destroyed]
```

> Chỉ cho phép tiến trình theo thứ tự trên; mọi bước sai thứ tự trả `409 INVALID_TRANSITION`.

#### 7.5.2 Validation bắt buộc

- `quantity` phải lớn hơn 0 và không vượt max policy của site (mặc định 50/copy request).
- `selectedDocumentIds` phải chứa `documentId` chính.
- `distribute` bắt buộc có ít nhất một target hợp lệ.
- `external.emails` phải qua regex email chuẩn RFC 5322 tối giản.
- `sign` chỉ hợp lệ khi trạng thái hiện tại là `Distributed`.

#### 7.5.3 Request/Response chi tiết cho action endpoints

**POST `/controlled-copies/:id/approve`**
```json
{ "signatureToken": "short-lived-jwt-5min" }
```

**Response `200`:**
```json
{
  "id": "uuid",
  "previousStatus": "Draft Request",
  "currentStatus": "Approved",
  "currentStage": "Waiting for Print",
  "approvedAt": "2026-04-21T10:10:00Z",
  "approvedBy": "qm.user"
}
```

**POST `/controlled-copies/:id/sign`**
```json
{
  "signatureToken": "short-lived-jwt-5min",
  "signedAt": "2026-04-21T11:00:00Z"
}
```

**Response `200`:**
```json
{
  "id": "uuid",
  "previousStatus": "Distributed",
  "currentStatus": "Acknowledged",
  "acknowledgedAt": "2026-04-21T11:00:00Z",
  "acknowledgedBy": "recipient.user"
}
```

#### 7.5.4 Error mapping tối thiểu

| Endpoint | Error codes bắt buộc |
|----------|----------------------|
| `POST /controlled-copies` | `ENTITY_NOT_FOUND`, `VALIDATION_ERROR`, `ROLE_NOT_ALLOWED` |
| `POST /controlled-copies/:id/approve` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED` |
| `POST /controlled-copies/:id/print` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ROLE_NOT_ALLOWED` |
| `POST /controlled-copies/:id/distribute` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `DISTRIBUTION_TARGET_REQUIRED`, `VALIDATION_ERROR`, `ROLE_NOT_ALLOWED` |
| `POST /controlled-copies/:id/sign` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID` |
| `POST /controlled-copies/:id/recall` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `ROLE_NOT_ALLOWED` |
| `POST /controlled-copies/:id/destroy` | `ENTITY_NOT_FOUND`, `INVALID_TRANSITION`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `WITNESS_REQUIRED`, `ROLE_NOT_ALLOWED` |

> Tất cả transitions phải ghi audit trail: `module=Controlled Copy`.

---

### 7.6 Archived Documents

| Method | Endpoint | Query / Body | Mục đích |
|--------|----------|-------------|---------|
| `GET` | `/documents/archived` | `page,limit,search,retentionStatus,dateFrom,dateTo,department,category` | Danh sách lưu trữ |
| `GET` | `/documents/archived/:id` | — | Chi tiết |
| `GET` | `/documents/archived/:id/audit-log` | `page?,limit?` | Lịch sử xem/tải/khôi phục |
| `POST` | `/documents/archived/:id/restore` | `{ signatureToken, reason }` | Khôi phục về Draft |
| `DELETE` | `/documents/archived/:id` | `{ signatureToken, confirmedReason }` | Xoá vĩnh viễn (sau khi retention expired) |

**retentionStatus filter**: `all | valid | expiring-soon | expired`

**Response: ArchivedDocument**
```json
{
  "id": "uuid",
  "code": "SOP-QC-2020-001",
  "documentName": "Old SOP for Batch Release",
  "version": "3.0",
  "effectiveDate": "01/01/2020",
  "archivedDate": "01/01/2026",
  "archivedBy": "john.doe",
  "lastApprover": "dr.alice",
  "retentionPeriod": 60,
  "retentionExpiry": "01/01/2031",
  "department": "Quality Control",
  "category": "SOP",
  "reason": "Superseded by SOP-QC-2026-001",
  "fileUrl": "/api/documents/archived/uuid/file",
  "replacedBy": "SOP-QC-2026-001",
  "retentionStatus": {
    "status": "valid",
    "daysRemaining": 1715,
    "message": "Retention valid until 01/01/2031"
  }
}
```

**Response: AuditLogEntry**
```json
{
  "id": "uuid",
  "documentId": "uuid",
  "documentCode": "SOP-QC-2020-001",
  "action": "downloaded",
  "performedBy": "jane.smith",
  "timestamp": "2026-04-21T10:00:00Z",
  "details": "Downloaded by QA department request"
}
```

> **action**: `viewed | downloaded | restored | deleted`

#### 7.6.1 Quy tắc retention

- `retentionExpiry = archivedDate + retentionPeriod(months)`.
- `DELETE /documents/archived/:id` chỉ cho phép khi `retentionStatus = expired`.
- Nếu chưa hết hạn retention, trả `409 RETENTION_NOT_EXPIRED`.
- `restore` chỉ cho phép với role được uỷ quyền và không restore nếu tài liệu bị legal hold.

#### 7.6.2 Response mở rộng cho legal/compliance

**GET `/documents/archived/:id` bổ sung fields:**
```json
{
  "isLegalHold": false,
  "legalHoldReason": null,
  "canRestore": true,
  "canDeletePermanently": false
}
```

#### 7.6.3 Action responses

**POST `/documents/archived/:id/restore` response `200`:**
```json
{
  "success": true,
  "documentId": "uuid",
  "previousStatus": "Archived",
  "currentStatus": "Draft",
  "restoredAt": "2026-04-21T10:30:00Z",
  "restoredBy": "qa.manager"
}
```

**DELETE `/documents/archived/:id` response `200`:**
```json
{
  "success": true,
  "documentId": "uuid",
  "deletedAt": "2026-04-21T10:35:00Z",
  "deletedBy": "sys.admin",
  "retentionVerified": true
}
```

#### 7.6.4 Error mapping tối thiểu

| Endpoint | Error codes bắt buộc |
|----------|----------------------|
| `POST /documents/archived/:id/restore` | `ENTITY_NOT_FOUND`, `ROLE_NOT_ALLOWED`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `LEGAL_HOLD_ACTIVE`, `INVALID_TRANSITION` |
| `DELETE /documents/archived/:id` | `ENTITY_NOT_FOUND`, `ROLE_NOT_ALLOWED`, `ESIGN_REQUIRED`, `ESIGN_INVALID`, `RETENTION_NOT_EXPIRED`, `LEGAL_HOLD_ACTIVE` |

> Mọi thao tác restore/delete phải tạo audit record severity `High`.

---

### 7.7 Knowledge Base (Folder View)

> Duyệt tài liệu theo phòng ban qua giao diện folder. Hiển thị số lượng tài liệu từng phòng ban.

| Method | Endpoint | Query | Mục đích |
|--------|----------|-------|----------|
| `GET` | `/knowledge/departments` | `search?` | Danh sách phòng ban + số tài liệu |
| `GET` | `/knowledge/departments/:departmentId/documents` | `page,limit,search,fileType,sort,order` | Tài liệu trong folder phòng ban |

**GET `/knowledge/departments` response:**
```json
[
  { "id": "qa", "name": "Quality Assurance (QA)", "code": "QA", "documentCount": 45, "color": "#059669" },
  { "id": "qc", "name": "Quality Control (QC)", "code": "QC", "documentCount": 38, "color": "#2563eb" }
]
```

**GET `/knowledge/departments/:departmentId/documents` response item:**
```json
{
  "id": "uuid",
  "name": "QA SOP for Internal Audits",
  "fileType": "PDF",
  "fileSize": "2.4 MB",
  "lastOpened": "28/03/2026",
  "documentId": "SOP-QA-2026-001",
  "version": "2.0"
}
```

#### 7.7.1 Query semantics

- `fileType`: `pdf | docx | xlsx | pptx | txt | all`.
- `sort`: `name | lastOpened | version | createdAt`.
- `order`: `asc | desc`.
- Nếu `departmentId` không tồn tại: `404 ENTITY_NOT_FOUND`.

#### 7.7.2 Pagination envelope

**GET `/knowledge/departments/:departmentId/documents` response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "QA SOP for Internal Audits",
      "fileType": "PDF",
      "fileSize": "2.4 MB",
      "lastOpened": "28/03/2026",
      "documentId": "SOP-QA-2026-001",
      "version": "2.0"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### 7.7.3 Access control

- User chỉ xem được documents thuộc departments họ có quyền truy cập.
- Nếu không có quyền department: `403 ROLE_NOT_ALLOWED`.
- Các lần mở file từ knowledge view phải ghi audit: `module=Document`, `action=Download`, `metadata.source=knowledge_base`.

#### 7.7.4 Error mapping tối thiểu

| Endpoint | Error codes bắt buộc |
|----------|----------------------|
| `GET /knowledge/departments` | `ROLE_NOT_ALLOWED` |
| `GET /knowledge/departments/:departmentId/documents` | `ENTITY_NOT_FOUND`, `ROLE_NOT_ALLOWED`, `VALIDATION_ERROR` |

---

## 8. Training — Course

> **Course** là thực thể quản lý nội dung khoá học, cấu trúc và workflow phê duyệt. **Tách biệt hoàn toàn** với Material. Tuân thủ EU GMP Chapter 2 (Personnel) và ICH Q10 §3.2.
>
> **Workflow:** `Draft → Pending Review → Pending Approval → Effective → Obsoleted` (hoặc `Rejected` ở bất kỳ bước review/approval).

### 8.1 Endpoint Table

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/courses` | Danh sách khoá học |
| `GET` | `/training/courses/:id` | Chi tiết khoá học |
| `POST` | `/training/courses` | Tạo khoá học mới (status = Draft) |
| `PUT` | `/training/courses/:id` | Cập nhật khoá học (chỉ khi Draft/Rejected) |
| `DELETE` | `/training/courses/:id` | Xoá khoá học (chỉ khi Draft) |
| `POST` | `/training/courses/:id/submit` | Gửi phê duyệt → Pending Review |
| `POST` | `/training/courses/:id/review` | Hoàn thành review → Pending Approval (e-sig, reviewer) |
| `POST` | `/training/courses/:id/approve` | Phê duyệt → Effective (e-sig, approver) |
| `POST` | `/training/courses/:id/reject` | Từ chối → Rejected (e-sig, reviewer hoặc approver) |
| `POST` | `/training/courses/:id/obsolete` | Lưu trữ → Obsoleted |
| `GET` | `/training/courses/pending-review` | Queue chờ review |
| `GET` | `/training/courses/pending-approval` | Queue chờ phê duyệt |
| `GET` | `/training/courses/:id/materials` | Danh sách materials gắn với course |
| `GET` | `/training/stats` | Thống kê tổng quan |
| `GET` | `/training/filters` | Dữ liệu dropdown (courseTypes, statuses, departments) |

### 8.2 Enums

| Enum | Values |
|------|--------|
| `TrainingType` | `GMP \| Safety \| Technical \| Compliance \| SOP \| Software` |
| `TrainingMethod` | `Read & Understood \| Quiz (Paper-based/Manual) \| Hands-on/OJT` |
| `CourseStatus` | `Draft \| Pending Review \| Pending Approval \| Effective \| Rejected \| Obsoleted` |
| `InstructorType` | `internal \| external` |

### 8.3 Filter Params — `GET /training/courses`

```
page=1&limit=10
search=GMP
status=Effective
type=GMP
category=Mandatory
departmentRequired=true
sort=createdAt&order=desc
```

### 8.4 Request: POST `/training/courses`

```json
{
  "title": "GMP Fundamentals for Manufacturing Staff",
  "description": "Covers EU GMP Annex 1 requirements and ICH Q10",
  "trainingType": "GMP",
  "trainingMethod": "Quiz (Paper-based/Manual)",
  "instructorType": "internal",
  "instructor": "uuid-instructor",
  "scheduledDate": "2026-06-01",
  "duration": 8,
  "location": "Training Room A",
  "capacity": 30,
  "validityPeriodMonths": 12,
  "targetDepartments": ["Manufacturing", "Quality Control"],
  "linkedDocumentId": "uuid-doc",
  "linkedDocumentTitle": "SOP-MFG-001 Cleanroom Gowning Procedure",
  "recurrence": {
    "enabled": true,
    "intervalMonths": 12,
    "warningPeriodDays": 30
  },
  "trainingFiles": [
    { "materialId": "uuid-material-1", "name": "GMP_Module1.pdf", "size": 2048000, "type": "PDF" }
  ],
  "hasQuiz": true,
  "config": {
    "trainingType": "test_certification",
    "passingScore": 80,
    "maxAttempts": 3,
    "trainingPeriodDays": 7,
    "distributionList": ["uuid-user-1"],
    "questions": [
      {
        "id": "q1",
        "text": "What does GMP stand for?",
        "type": "multiple_choice",
        "points": 2,
        "options": [
          { "id": "a", "text": "Good Manufacturing Practice", "isCorrect": true },
          { "id": "b", "text": "General Medicine Protocol", "isCorrect": false }
        ]
      }
    ]
  }
}
```

> **Note:** `linkedDocumentId` là liên kết chính với module Documents. Khi khoá học được tạo từ một bản sửa đổi tài liệu mới (`trigger: "doc_revision"`), trường này tự động được điền bởi hệ thống. Xem §10.5 (Auto-Assignment Rules) và §10.6 (Document Revision Trigger).

### 8.5 Response: Course Object

```json
{
  "id": "uuid",
  "courseCode": "TRN-2026-042",
  "title": "GMP Fundamentals for Manufacturing Staff",
  "description": "Covers EU GMP Annex 1 requirements and ICH Q10",
  "status": "Draft",
  "trainingType": "GMP",
  "trainingMethod": "Quiz (Paper-based/Manual)",
  "instructorType": "internal",
  "instructor": "Dr. Nguyen Van A",
  "instructorId": "uuid-instructor",
  "scheduledDate": "2026-06-01",
  "duration": 8,
  "location": "Training Room A",
  "capacity": 30,
  "validityPeriodMonths": 12,
  "targetDepartments": ["Manufacturing", "Quality Control"],
  "linkedDocumentId": "uuid-doc",
  "linkedDocumentTitle": "SOP-MFG-001 Cleanroom Gowning Procedure",
  "recurrence": { "enabled": true, "intervalMonths": 12, "warningPeriodDays": 30 },
  "hasQuiz": true,
  "config": { "trainingType": "test_certification", "passingScore": 80, "maxAttempts": 3, "trainingPeriodDays": 7, "distributionList": [], "questions": [] },
  "trainingFiles": [],
  "materialsCount": 0,
  "enrolledCount": 0,
  "completedCount": 0,
  "createdBy": "uuid-user",
  "createdByName": "Jane Smith",
  "createdAt": "2026-04-21T10:00:00Z",
  "updatedAt": "2026-04-21T10:00:00Z"
}
```

### 8.6 Workflow Actions

**POST `/training/courses/:id/submit`** — Draft → Pending Review
```json
{ "comment": "Ready for review" }
```

**POST `/training/courses/:id/review`** — Pending Review → Pending Approval (e-signature required)
```json
{
  "action": "complete-review",
  "eSignature": { "userId": "uuid-reviewer", "password": "****", "reason": "Content verified against SOP-QA-001" }
}
```

**POST `/training/courses/:id/approve`** — Pending Approval → Effective (e-signature required)
```json
{
  "action": "approve",
  "eSignature": { "userId": "uuid-approver", "password": "****", "reason": "Approved for issuance" }
}
```

**POST `/training/courses/:id/reject`** — → Rejected (e-signature required)
```json
{
  "action": "reject",
  "rejectionReason": "Quiz questions do not align with SOP revision 3",
  "eSignature": { "userId": "uuid-reviewer", "password": "****", "reason": "Rejected — content gap identified" }
}
```

**POST `/training/courses/:id/obsolete`** — Effective → Obsoleted
```json
{ "reason": "Replaced by TRN-2026-055" }
```

### 8.7 Pending Queues

**GET `/training/courses/pending-review`**
Returns list of courses in status `Pending Review`. Same shape as course list response, filtered.

**GET `/training/courses/pending-approval`**
Returns list of courses in status `Pending Approval`. Same shape as course list response, filtered.

### 8.8 Stats — `GET /training/stats`

```json
{
  "totalCourses": 124,
  "activeCourses": 87,
  "pendingReview": 5,
  "pendingApproval": 3,
  "totalAssignments": 342,
  "completed": 298,
  "overdue": 12,
  "complianceRate": 94.5,
  "upcomingDue": 18
}
```

---

## 9. Training — Material

> **Material** là file học liệu độc lập (Video, PDF, Image, Document hoặc External Link) trong thư viện dùng chung. Material có workflow phê duyệt riêng và versioning. Được gắn với các Course qua `linkedCourses[]`.
>
> **Workflow:** `Draft → Pending Review → Pending Approval → Effective → Obsoleted` (hoặc `Rejected`).
>
> **Accepted formats:** PDF (`.pdf`), Video (`.mp4`), Image (`.jpg`, `.jpeg`, `.png`). Max file size: **500 MB**.

### 9.1 Endpoint Table

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/materials` | Danh sách materials |
| `GET` | `/training/materials/:id` | Chi tiết material |
| `POST` | `/training/materials/upload` | Upload material mới (multipart/form-data) |
| `PUT` | `/training/materials/:id` | Cập nhật metadata (chỉ khi Draft/Rejected) |
| `DELETE` | `/training/materials/:id` | Xoá material (chỉ khi Draft) |
| `GET` | `/training/materials/:id/download` | Tải file gốc |
| `POST` | `/training/materials/:id/submit` | Gửi phê duyệt → Pending Review |
| `POST` | `/training/materials/:id/review` | Hoàn thành review → Pending Approval (e-sig) |
| `POST` | `/training/materials/:id/approve` | Phê duyệt → Effective (e-sig) |
| `POST` | `/training/materials/:id/reject` | Từ chối → Rejected (e-sig) |
| `POST` | `/training/materials/:id/obsolete` | Lưu trữ → Obsoleted |
| `POST` | `/training/materials/:id/revision` | Tạo phiên bản mới (minor/major) |
| `GET` | `/training/materials/:id/versions` | Lịch sử versions |
| `GET` | `/training/materials/pending-review` | Queue chờ review |
| `GET` | `/training/materials/pending-approval` | Queue chờ phê duyệt |

### 9.2 Material Code Format

| File Type | Code Prefix | Example |
|-----------|-------------|---------|
| PDF | `TM-PDF` | `TM-PDF-001` |
| Video | `TM-VID` | `TM-VID-042` |
| Image | `TM-IMG` | `TM-IMG-007` |
| Document | `TM-DOC` | `TM-DOC-018` |

### 9.3 Filter Params — `GET /training/materials`

```
page=1&limit=10
search=GMP Introduction
status=Effective
type=Video
department=Quality Assurance
businessUnit=Quality
sort=uploadedAt&order=desc
```

### 9.4 Request: POST `/training/materials/upload` (multipart/form-data)

**Upload mode — file:**
```
file:           <binary — .pdf / .mp4 / .jpg / .jpeg / .png, max 500 MB>
uploadMode:     file
materialName:   GMP Introduction Video
materialCode:   TM-VID-001
version:        1.0
author:         uuid-user
businessUnit:   Quality
department:     Quality Assurance
reviewer:       uuid-reviewer
approver:       uuid-approver
description:    Comprehensive overview of Good Manufacturing Practices
linkedCourses:  ["uuid-course-1","uuid-course-2"]   (JSON array as string)
```

**Upload mode — link (external URL):**
```
uploadMode:     link
externalUrl:    https://intranet.company.com/training/gmp-video.mp4
materialName:   GMP Awareness Video (External)
materialCode:   TM-VID-042
version:        1.0
author:         uuid-user
businessUnit:   Quality
department:     Quality Assurance
reviewer:       uuid-reviewer
approver:       uuid-approver
description:    Hosted on corporate LMS
```

### 9.5 Response: Material Object

```json
{
  "id": "uuid",
  "materialId": "TM-VID-001",
  "title": "GMP Introduction Video",
  "description": "Comprehensive overview of Good Manufacturing Practices",
  "type": "Video",
  "version": "1.0",
  "status": "Effective",
  "uploadMode": "file",
  "fileUrl": "/files/training/materials/uuid-file.mp4",
  "fileName": "GMP_Introduction_2026.mp4",
  "fileSize": "125.0 MB",
  "fileSizeBytes": 131072000,
  "mimeType": "video/mp4",
  "externalUrl": null,
  "businessUnit": "Quality",
  "department": "Quality Assurance",
  "linkedCourses": ["uuid-course-1"],
  "reviewer": "uuid-reviewer",
  "reviewerName": "John Doe",
  "approver": "uuid-approver",
  "approverName": "Dr. A. Smith",
  "reviewedAt": "2026-04-15T09:00:00Z",
  "approvedAt": "2026-04-16T14:00:00Z",
  "reviewComment": "Content verified",
  "approvalComment": "Approved for distribution",
  "usageCount": 3,
  "uploadedBy": "uuid-user",
  "uploadedByName": "Jane Smith",
  "uploadedAt": "2026-04-14T08:00:00Z",
  "createdAt": "2026-04-14T08:00:00Z",
  "updatedAt": "2026-04-16T14:00:00Z"
}
```

### 9.6 Workflow Actions

**POST `/training/materials/:id/review`** — Pending Review → Pending Approval
```json
{
  "comment": "Content verified against current SOP version",
  "eSignature": { "userId": "uuid-reviewer", "password": "****", "reason": "Review completed" }
}
```

**POST `/training/materials/:id/approve`** — Pending Approval → Effective
```json
{
  "comment": "Approved for distribution",
  "eSignature": { "userId": "uuid-approver", "password": "****", "reason": "Approved" }
}
```

**POST `/training/materials/:id/reject`** — → Rejected
```json
{
  "rejectionReason": "Video quality insufficient for GMP compliance training",
  "eSignature": { "userId": "uuid-reviewer", "password": "****", "reason": "Rejected" }
}
```

### 9.7 Revision — POST `/training/materials/:id/revision` (multipart/form-data)

Tạo phiên bản mới của material đã `Effective`. Phiên bản cũ tự động chuyển sang `Obsoleted`.

```
revisionType:   minor               # minor (1.0 → 1.1) | major (1.0 → 2.0)
revisionNotes:  Updated with Q2 2026 regulatory changes
file:           <optional — omit if only metadata changed, uploadMode=link>
externalUrl:    <optional — nếu uploadMode=link>
reviewer:       uuid-reviewer
approver:       uuid-approver
```

**Response:** New Material object with bumped `version`, status `Draft`, and `previousVersionId`.

### 9.8 Version History — `GET /training/materials/:id/versions`

```json
[
  {
    "version": "2.0",
    "revisionType": "major",
    "revisionNotes": "Full rewrite per ICH Q2(R2)",
    "fileUrl": "/files/training/materials/uuid-v2.mp4",
    "uploadedBy": "Jane Smith",
    "approvedAt": "2026-04-16T14:00:00Z",
    "current": true
  },
  {
    "version": "1.0",
    "revisionType": null,
    "revisionNotes": "Initial version",
    "fileUrl": "/files/training/materials/uuid-v1.mp4",
    "uploadedBy": "Jane Smith",
    "approvedAt": "2026-01-15T08:00:00Z",
    "current": false
  }
]
```

---

## 10. Training — Assignments & Records

> Tuân thủ EU GMP Chapter 2.8/2.9/2.12 (personnel training, competency verification, e-signature for OJT sign-off), ICH Q10 §3.2 (retraining on revised procedures), Annex 11/21 CFR Part 11 (electronic records).

### 10.1 Assignments

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/assignments` | Danh sách phân công |
| `GET` | `/training/assignments/:id` | Chi tiết assignment |
| `GET` | `/training/assignments/:id/progress` | Tiến độ theo từng nhân viên |
| `POST` | `/training/assignments` | Phân công cá nhân hoặc theo nhóm |
| `POST` | `/training/assignments/bulk` | Phân công theo phòng ban / business unit |
| `DELETE` | `/training/assignments/:id` | Huỷ assignment |
| `PATCH` | `/training/assignments/:id/complete` | Ghi nhận hoàn thành (offline training) |
| `PATCH` | `/training/assignments/:id/extend-due` | Gia hạn deadline |
| `PATCH` | `/training/assignments/:id/cancel` | Huỷ với lý do |
| `PATCH` | `/training/assignments/:id/waive` | Miễn trừ (waiver) cho một nhân viên |

#### Filter Params — `GET /training/assignments`

```
page=1&limit=10
userId=uuid-user
courseId=uuid-course
status=Active
scope=department
department=Manufacturing
trigger=doc_revision
linkedDocumentId=uuid-doc
priority=Critical
dateFrom=2026-01-01&dateTo=2026-06-30
```

#### AssignmentStatus values

`Draft | Active | Completed | PartiallyCompleted | Cancelled | Expired`

#### AssignmentTrigger values (10)

| Trigger | Khi nào |
|---------|---------|
| `manual` | Người dùng tạo thủ công |
| `new_employee` | Nhân viên mới onboard |
| `role_change` | Thay đổi chức danh / phòng ban |
| `doc_revision` | Tài liệu phát hành phiên bản mới (xem §10.6) |
| `expiry_retraining` | Hiệu lực khoá học hết hạn |
| `recurrence` | Chu kỳ đào tạo định kỳ (recurrence rule) |
| `capa_linked` | CAPA yêu cầu đào tạo khắc phục |
| `audit_finding` | Phát hiện audit |
| `process_change` | Thay đổi quy trình |
| `regulatory_update` | Cập nhật quy định pháp lý |

#### Priority deadline defaults

| Priority | Deadline (ngày) |
|----------|-----------------|
| `Critical` | 7 |
| `High` | 14 |
| `Medium` | 30 |
| `Low` | 60 |

#### Request: POST `/training/assignments`

```json
{
  "courseId": "uuid-course",
  "targetScope": "individual",
  "targetIds": ["uuid-user-1", "uuid-user-2"],
  "deadline": "2026-05-31",
  "priority": "High",
  "trigger": "doc_revision",
  "reasonForAssignment": "SOP-MFG-001 revised to v3.0 — all Manufacturing staff must complete retraining per ICH Q10 §3.2",
  "linkedDocumentId": "uuid-doc",
  "linkedDocumentTitle": "SOP-MFG-001 Cleanroom Gowning Procedure v3.0",
  "linkedCapaId": null,
  "linkedDeviationId": null,
  "requiresESign": true,
  "trainingBeforeAuthorized": true,
  "isCrossTraining": false,
  "reminders": [3, 7, 14]
}
```

> **`reasonForAssignment`** — bắt buộc, được lưu vào audit trail.
> **`trainingBeforeAuthorized`** — khi `true`, nhân viên bị khoá thực hiện tác vụ cho đến khi hoàn thành training (EU GMP 2.8 gate).
> **`requiresESign`** — khi `true`, hoàn thành yêu cầu e-signature của cả trainee lẫn trainer (Annex 11).

#### Request: POST `/training/assignments/bulk`

```json
{
  "courseId": "uuid-course",
  "targetScope": "department",
  "targetIds": ["Manufacturing", "Quality Control"],
  "deadline": "2026-05-31",
  "priority": "High",
  "trigger": "doc_revision",
  "reasonForAssignment": "SOP-MFG-001 v3.0 released",
  "linkedDocumentId": "uuid-doc",
  "requiresESign": true,
  "trainingBeforeAuthorized": false,
  "reminders": [7, 14]
}
```

#### Request: PATCH `/training/assignments/:id/complete`

```json
{
  "userId": "uuid-user",
  "completionDate": "2026-04-20",
  "score": 85,
  "examinationMethod": "Written exam",
  "notes": "Passed with distinction",
  "conductedBy": "uuid-instructor",
  "traineeESign": {
    "userId": "uuid-user",
    "password": "****",
    "reason": "I confirm I have completed this training"
  },
  "trainerESign": {
    "userId": "uuid-instructor",
    "password": "****",
    "reason": "Confirmed trainee competency assessed"
  }
}
```

#### Request: PATCH `/training/assignments/:id/extend-due`

```json
{
  "newDueDate": "2026-06-30",
  "reason": "Employee on medical leave until June 15"
}
```

#### Request: PATCH `/training/assignments/:id/waive`

```json
{
  "userId": "uuid-user",
  "waiverReason": "Employee holds equivalent external certification (ISO 9001 Lead Auditor)",
  "waivedBy": "uuid-manager",
  "eSignature": { "userId": "uuid-manager", "password": "****", "reason": "Waiver approved" }
}
```

#### Response: AssignmentProgress item (`GET /training/assignments/:id/progress`)

```json
[
  {
    "assignmentId": "ASN-2026-042",
    "employeeId": "uuid-user",
    "employeeName": "John Doe",
    "employeeDepartment": "Manufacturing",
    "employeeJobTitle": "Production Operator",
    "status": "Completed",
    "assignedAt": "2026-04-01T08:00:00Z",
    "startedAt": "2026-04-10T09:00:00Z",
    "completedAt": "2026-04-15T11:00:00Z",
    "deadline": "2026-05-31",
    "score": 85,
    "attempts": 1,
    "isPassed": true,
    "traineeESign": {
      "userId": "uuid-user",
      "signedAt": "2026-04-15T11:00:00Z",
      "reason": "I confirm I have completed this training"
    },
    "trainerESign": {
      "userId": "uuid-instructor",
      "signedAt": "2026-04-15T11:05:00Z",
      "reason": "Confirmed trainee competency assessed"
    },
    "isWaived": false,
    "waiverReason": null
  }
]
```

---

### 10.2 My Training (Personal View)

> Giao diện cá nhân — nhân viên xem các khoá học được giao và lịch sử hoàn thành.

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/my` | Danh sách assignment cá nhân (to-do) |
| `GET` | `/training/my/overdue` | Assignments quá hạn của tôi |
| `GET` | `/training/my/transcript` | Lịch sử hoàn thành (transcript) |
| `GET` | `/training/my/stats` | Thống kê cá nhân |
| `POST` | `/training/my/:assignmentId/start` | Bắt đầu khoá học |
| `POST` | `/training/my/:assignmentId/complete` | Xác nhận hoàn thành + e-sign |

**Filter Params — `GET /training/my`:**
```
status=Assigned           # Assigned | Pending | Expiring Soon | InProgress
type=SOP
page=1&limit=10
```

**Response item — My Training task:**
```json
{
  "id": "TRN-001",
  "assignmentId": "ASN-2026-042",
  "title": "Bio-decontamination Standard Operating Procedure",
  "deadline": "2026-03-20",
  "trainingType": "SOP",
  "testType": "Quiz Offline",
  "status": "Expiring Soon",
  "materialType": "PDF",
  "materialUrl": "/files/training/materials/uuid-mat.pdf",
  "courseId": "uuid-course",
  "linkedDocumentId": "uuid-doc",
  "linkedDocumentTitle": "SOP-QC-2026-003"
}
```

**POST `/training/my/:assignmentId/complete`:**
```json
{
  "completionDate": "2026-04-20",
  "score": 90,
  "eSignature": { "userId": "uuid-user", "password": "****", "reason": "I confirm completion of this training" }
}
```

**Response — My Transcript item:**
```json
{
  "id": "TRN-PY-001",
  "title": "Introduction to GxP Documentation",
  "completedDate": "2026-01-15",
  "score": 95,
  "type": "GMP",
  "certUrl": "/training/records/uuid-record/certificate",
  "courseCode": "TRN-2026-001",
  "version": "2.0",
  "expiryDate": "2027-01-15"
}
```

---

### 10.3 Records Archive

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/employees` | Danh sách Employee Training Files |
| `GET` | `/training/employees/:id` | Hồ sơ training đầy đủ (dossier) |
| `GET` | `/training/employees/:id/sops` | SOP training records của nhân viên |
| `GET` | `/training/employees/:id/ojt` | OJT records |
| `GET` | `/training/employees/:id/authorizations` | Task authorizations |
| `GET` | `/training/employees/:id/pending-signatures` | Pending signatures queue |
| `POST` | `/training/employees/:id/ojt/:ojtId/verify` | Xác nhận OJT (trainer e-sign) |
| `GET` | `/training/records` | Hồ sơ training đã hoàn thành |
| `GET` | `/training/records/:id` | Chi tiết record |
| `GET` | `/training/records/:id/certificate` | Tải chứng chỉ PDF |
| `POST` | `/training/records/:id/esign` | Ký e-signature (trainee hoặc trainer) |
| `POST` | `/training/records` | Ghi nhận thủ công (offline training) |

**Filter Params — `GET /training/employees`:**
```
page=1&limit=10
search=John Doe
department=Manufacturing
businessUnit=Quality
employeeType=Internal
qualificationStatus=At Risk
```

**Response: EmployeeTrainingFile:**
```json
{
  "id": "uuid-emp",
  "employeeId": "EMP-001",
  "employeeName": "John Doe",
  "jobPosition": "Production Operator",
  "department": "Manufacturing",
  "businessUnit": "Operations",
  "email": "john.doe@company.com",
  "employeeType": "Internal",
  "isNewHire": false,
  "qualificationStatus": "Qualified",
  "totalCoursesRequired": 12,
  "coursesCompleted": 11,
  "coursesInProgress": 1,
  "coursesOverdue": 0,
  "coursesObsolete": 2,
  "lastTrainingDate": "2026-03-20",
  "nextDeadline": "2026-06-01",
  "averageScore": 87.5
}
```

**Response: Employee Dossier (`GET /training/employees/:id`) — additional fields:**
```json
{
  "ojtRecords": [
    {
      "id": "ojt-1",
      "taskName": "Aseptic Filling Line Operation",
      "trainerName": "Dr. Jane Smith",
      "dateCompleted": "2026-02-10",
      "status": "Verified",
      "assessmentScore": 92,
      "esignReason": "Observed and confirmed competency"
    }
  ],
  "authorizations": [
    {
      "id": "auth-1",
      "taskTitle": "Clean Room Class C Operation",
      "authorizedDate": "2026-02-15",
      "expiryDate": "2027-02-15",
      "status": "Active",
      "signedBy": "Dr. Jane Smith"
    }
  ],
  "completedCourses": [
    {
      "courseCode": "TRN-2026-001",
      "courseTitle": "GMP Fundamentals",
      "version": "2.0",
      "completionDate": "2026-01-15",
      "expiryDate": "2027-01-15",
      "score": 90,
      "passingScore": 80,
      "traineeEsignDate": "2026-01-15T10:00:00Z",
      "trainerName": "Dr. Jane Smith",
      "trainerEsignDate": "2026-01-15T10:05:00Z",
      "status": "Pass",
      "pendingSignaturesCount": 0
    }
  ]
}
```

**Response: Pending Signatures item (`GET /training/employees/:id/pending-signatures`):**
```json
[
  {
    "id": "pend-1",
    "courseCode": "TRN-2026-015",
    "courseTitle": "Aseptic Technique Refresher",
    "version": "1.0",
    "missingRoles": ["Trainer"],
    "completionDate": "2026-04-10",
    "daysPending": 12,
    "isObsolete": false
  }
]
```

**POST `/training/records/:id/esign`:**
```json
{
  "role": "Trainer",
  "eSignature": { "userId": "uuid-trainer", "password": "****", "reason": "Confirmed trainee has demonstrated competency" }
}
```

**POST `/training/employees/:id/ojt/:ojtId/verify`:**
```json
{
  "eSignature": { "userId": "uuid-trainer", "password": "****", "reason": "Observed and confirmed task competency" }
}
```

**Request: POST `/training/records` (manual offline training):**
```json
{
  "userId": "uuid-user",
  "courseId": "uuid-course",
  "completionDate": "2026-04-20",
  "score": 85,
  "trainingMethod": "Hands-on/OJT",
  "conductedBy": "uuid-instructor",
  "notes": "On-site OJT session completed"
}
```

---

### 10.4 Compliance Tracking

| Method | Endpoint | Query | Mục đích |
|--------|----------|-------|---------|
| `GET` | `/training/compliance` | `department,role,dateFrom,dateTo` | Báo cáo tuân thủ |
| `GET` | `/training/compliance/overdue` | `department?` | Nhân viên quá hạn |
| `GET` | `/training/compliance/expiring` | `daysAhead=30` | Sắp hết hiệu lực |
| `GET` | `/training/matrix` | `department,businessUnit,jobTitle,status,gapAnalysis` | Training Matrix (Employee × SOP) |
| `GET` | `/training/matrix/kpi` | `department?` | KPI tổng hợp |
| `GET` | `/training/matrix/gap-analysis` | `department,jobTitle` | Gap Analysis |
| `PUT` | `/training/matrix/:employeeId/:sopId` | — | Cập nhật cell (ví dụ: đánh dấu NotRequired) |

**`GET /training/compliance` response item:**
```json
{
  "userId": "uuid-user",
  "name": "John Doe",
  "department": "Manufacturing",
  "required": 12,
  "completed": 11,
  "overdue": 0,
  "inProgress": 1,
  "complianceRate": 91.7
}
```

**`GET /training/matrix` response:**
```json
{
  "employees": [
    { "id": "uuid-emp", "name": "John Doe", "employeeCode": "EMP-001", "department": "QA", "jobTitle": "QA Analyst", "hireDate": "2022-03-15" }
  ],
  "sops": [
    { "id": "uuid-sop", "code": "SOP-QC-001", "title": "GMP Basic Training", "category": "GMP", "version": "v2.1", "effectiveDate": "2025-01-01" }
  ],
  "cells": [
    { "employeeId": "uuid-emp", "sopId": "uuid-sop", "status": "Qualified", "lastTrainedDate": "2025-02-10", "expiryDate": "2026-02-10", "score": 88, "attempts": 1 }
  ],
  "kpi": { "complianceRate": 94.5, "totalOverdue": 3, "expiringSoon": 7, "daysUntilNextAudit": 45 }
}
```

> **CellStatus** values: `NotRequired | Required | InProgress | Qualified`

---

### 10.5 Auto-Assignment Rules

> Rules định nghĩa điều kiện tự động phân công khoá học. Mỗi rule phải được QA phê duyệt trước khi active.

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/training/rules` | Danh sách auto-assignment rules |
| `GET` | `/training/rules/:id` | Chi tiết rule |
| `POST` | `/training/rules` | Tạo rule mới |
| `PUT` | `/training/rules/:id` | Cập nhật rule |
| `DELETE` | `/training/rules/:id` | Xoá rule |
| `POST` | `/training/rules/:id/approve` | QA phê duyệt rule (e-sig) |
| `PATCH` | `/training/rules/:id/activate` | Kích hoạt / vô hiệu |

**Request: POST `/training/rules`:**
```json
{
  "name": "GMP Retraining on SOP Revision",
  "description": "Auto-assign GMP refresher whenever a GMP SOP is published",
  "trigger": "doc_revision",
  "triggerConditions": {
    "departments": ["Manufacturing", "Quality Control"],
    "jobTitles": [],
    "courseCategories": ["GMP", "SOP"],
    "minPriorityLevel": "High"
  },
  "courseFilter": {
    "categories": ["GMP"],
    "mandatory": true,
    "specificCourseIds": []
  },
  "targetScope": "department",
  "priority": "High",
  "deadlineDays": 14,
  "requiresESign": true,
  "trainingBeforeAuthorized": false,
  "notifyManager": true,
  "reminderDays": [3, 7],
  "notes": "Per ICH Q10 §3.2 — retraining required on revised procedures"
}
```

**Response: AutoAssignmentRule:**
```json
{
  "ruleId": "ARU-001",
  "name": "GMP Retraining on SOP Revision",
  "trigger": "doc_revision",
  "isActive": false,
  "approvedBy": null,
  "approvedAt": null,
  "lastTriggeredAt": null,
  "triggerCount": 0,
  "createdBy": "uuid-user",
  "createdAt": "2026-04-01T08:00:00Z"
}
```

**POST `/training/rules/:id/approve`** — QA phê duyệt, rule → active
```json
{
  "eSignature": { "userId": "uuid-qa", "password": "****", "reason": "Rule reviewed and approved for activation" }
}
```

---

### 10.6 Document Revision → Training Integration

> Khi tài liệu phát hành phiên bản mới (`POST /documents/:id/publish` hoặc `POST /documents/:id/approve`), server kiểm tra tất cả Auto-Assignment Rules có `trigger = "doc_revision"`. Nếu document khớp với `triggerConditions`, server tự động tạo `TrainingAssignment` mới.

**Luồng tích hợp:**

```
1. Documents: POST /documents/:id/approve   →  document.status = "Effective", document.version = "3.0"
2. Server fires: checkDocRevisionRules(documentId, documentCategory, documentDepartments)
3. Matching rules → POST /training/assignments (trigger: "doc_revision", linkedDocumentId: ":id")
4. reasonForAssignment = "Auto-assigned: [documentTitle] v[version] published"
5. Notifications sent to affected employees
```

**Fields auto-populated on auto-created assignment:**

| Field | Value |
|-------|-------|
| `trigger` | `"doc_revision"` |
| `linkedDocumentId` | ID của tài liệu vừa phát hành |
| `linkedDocumentTitle` | Title + version của tài liệu |
| `reasonForAssignment` | `"Auto-assigned: [title] [version] published on [date]"` |
| `priority` | Từ rule |
| `deadline` | `publishedAt + rule.deadlineDays` |
| `requiresESign` | Từ rule |

---

### 10.7 Export

| Method | Endpoint | Query | Mục đích |
|--------|----------|-------|---------|
| `GET` | `/training/export/records` | `reportType,department,dateFrom,dateTo,includeScores,includeAttendance,includeCertificates,format` | Xuất báo cáo training |
| `GET` | `/training/export/compliance` | `department,dateFrom,dateTo,format` | Xuất compliance XLSX |

**`reportType` values:**

| Value | Mô tả |
|-------|-------|
| `individual` | Individual Training Record (per employee) |
| `department` | Department Summary |
| `course` | Course Completion Report |
| `matrix` | Compliance Matrix |
| `audit` | Audit Trail |

**Query Params:**
```
reportType=individual
department=Quality Assurance
dateFrom=2026-01-01&dateTo=2026-06-30
includeScores=true
includeAttendance=true
includeCertificates=false
format=pdf                 # pdf | excel | csv
```

**Response:** Binary blob with `Content-Disposition: attachment; filename="training_records_2026.pdf"`.

---

## 11. Deviations

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/deviations` | Danh sách |
| `GET` | `/deviations/:id` | Chi tiết |
| `POST` | `/deviations` | Tạo mới |
| `PUT` | `/deviations/:id` | Cập nhật |
| `DELETE` | `/deviations/:id` | Xoá |
| `GET` | `/deviations/stats` | Thống kê |
| `GET` | `/deviations/export` | Xuất XLSX |
| `POST` | `/deviations/:id/investigate` | Mở điều tra |
| `POST` | `/deviations/:id/submit-review` | Gửi review |
| `POST` | `/deviations/:id/submit-approval` | Gửi phê duyệt |
| `POST` | `/deviations/:id/approve` | Phê duyệt (e-sig) |
| `POST` | `/deviations/:id/reject` | Từ chối |
| `POST` | `/deviations/:id/close` | Đóng |
| `POST` | `/deviations/:id/cancel` | Huỷ |
| `POST` | `/deviations/:id/reopen` | Mở lại |
| `POST` | `/deviations/:id/link-capa` | Liên kết CAPA |
| `GET` | `/deviations/:id/linked-capas` | CAPA liên quan |

**Filter Params:**
```
page=1&limit=10
search=batch XYZ007
categoryFilter=Product Quality
severityFilter=Major
statusFilter=Open
department=Quality Control
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
sort=reportedDate&order=desc
```

**Request: POST `/deviations`**
```json
{
  "title": "Batch XYZ007 out-of-spec dissolution result",
  "description": "Dissolution test at T=30min showed 52% vs specification ≥70%",
  "category": "Product Quality",
  "severity": "Major",
  "department": "Quality Control",
  "affectedProduct": "Amoxicillin 500mg Tab",
  "affectedBatch": "XYZ007",
  "immediateAction": "Batch quarantined pending investigation",
  "assignedTo": "uuid-investigator",
  "investigationDeadline": "2026-05-05"
}
```

**Response: Deviation**
```json
{
  "id": "uuid",
  "deviationId": "DEV-2026-042",
  "title": "Batch XYZ007 out-of-spec dissolution result",
  "description": "Dissolution test at T=30min showed 52% vs specification ≥70%",
  "category": "Product Quality",
  "severity": "Major",
  "status": "Open",
  "reportedBy": "uuid-reporter",
  "reportedByName": "Lab Analyst A",
  "reportedDate": "2026-04-21T10:00:00Z",
  "department": "Quality Control",
  "affectedProduct": "Amoxicillin 500mg Tab",
  "affectedBatch": "XYZ007",
  "immediateAction": "Batch quarantined pending investigation",
  "rootCause": null,
  "correctiveAction": null,
  "preventiveAction": null,
  "investigationDeadline": "2026-05-05",
  "assignedTo": "uuid-investigator",
  "assignedToName": "QA Investigator B",
  "linkedCapas": [],
  "createdAt": "2026-04-21T10:00:00Z",
  "updatedAt": "2026-04-21T10:00:00Z"
}
```

---

## 12. CAPA

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/capa` | Danh sách |
| `GET` | `/capa/:id` | Chi tiết |
| `POST` | `/capa` | Tạo mới |
| `PUT` | `/capa/:id` | Cập nhật |
| `DELETE` | `/capa/:id` | Xoá |
| `GET` | `/capa/stats` | Thống kê |
| `GET` | `/capa/export` | Xuất XLSX |
| `POST` | `/capa/:id/submit-investigation` | Bắt đầu điều tra |
| `POST` | `/capa/:id/submit-action-plan` | Gửi kế hoạch hành động |
| `POST` | `/capa/:id/start-implementation` | Bắt đầu triển khai |
| `POST` | `/capa/:id/submit-verification` | Gửi xác minh |
| `POST` | `/capa/:id/effectiveness-check` | Kiểm tra hiệu quả |
| `POST` | `/capa/:id/approve` | Phê duyệt (e-sig) |
| `POST` | `/capa/:id/reject` | Từ chối |
| `POST` | `/capa/:id/cancel` | Huỷ |
| `PATCH` | `/capa/:id/status` | Cập nhật trạng thái |
| `POST` | `/capa/:id/link-deviation` | Liên kết Deviation |
| `POST` | `/capa/:id/link-complaint` | Liên kết Complaint |

**Filter Params:**
```
page=1&limit=10
search=amoxicillin
typeFilter=Corrective
sourceFilter=Deviation
statusFilter=Implementation
department=Quality Assurance
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
```

**Request: POST `/capa`**
```json
{
  "title": "CAPA for OOS Dissolution - Batch XYZ007",
  "description": "Corrective action following OOS dissolution investigation",
  "type": "Corrective",
  "source": "Deviation",
  "department": "Quality Assurance",
  "problemStatement": "Dissolution failure attributed to equipment calibration drift",
  "rootCause": "Dissolution apparatus paddle speed deviation +5 RPM",
  "correctiveAction": "Recalibrate dissolution apparatus; re-test batch",
  "preventiveAction": "Increase calibration frequency from quarterly to monthly",
  "targetCompletionDate": "2026-06-01",
  "assignedTo": "uuid-qa-lead",
  "relatedDeviationId": "uuid-deviation"
}
```

**GET `/capa/stats`**
```json
{
  "total": 32,
  "inProgress": 10,
  "dueThisMonth": 5,
  "closed": 20,
  "corrective": 22,
  "preventive": 10,
  "effectiveRate": 87.5
}
```

---

## 13. Complaints

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/complaints` | Danh sách |
| `GET` | `/complaints/:id` | Chi tiết |
| `POST` | `/complaints` | Tạo mới |
| `PUT` | `/complaints/:id` | Cập nhật |
| `DELETE` | `/complaints/:id` | Xoá |
| `GET` | `/complaints/stats` | Thống kê |
| `GET` | `/complaints/export` | Xuất XLSX |
| `POST` | `/complaints/:id/investigate` | Mở điều tra |
| `POST` | `/complaints/:id/identify-root-cause` | Xác định nguyên nhân gốc |
| `POST` | `/complaints/:id/initiate-capa` | Khởi tạo CAPA |
| `POST` | `/complaints/:id/close` | Đóng |
| `POST` | `/complaints/:id/reject` | Từ chối |
| `POST` | `/complaints/:id/escalate` | Leo thang |
| `POST` | `/complaints/:id/notify-authority` | Thông báo cơ quan quản lý |

**Filter Params:**
```
page=1&limit=10
search=packaging defect
typeFilter=Product Quality
priorityFilter=High
statusFilter=Under Investigation
sourceFilter=Customer
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
```

---

## 14. Change Control

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/change-control` | Danh sách |
| `GET` | `/change-control/:id` | Chi tiết |
| `POST` | `/change-control` | Tạo mới |
| `PUT` | `/change-control/:id` | Cập nhật |
| `DELETE` | `/change-control/:id` | Xoá |
| `GET` | `/change-control/stats` | Thống kê |
| `GET` | `/change-control/export` | Xuất XLSX |
| `POST` | `/change-control/:id/submit` | Gửi phê duyệt |
| `POST` | `/change-control/:id/impact-assess` | Đánh giá tác động |
| `POST` | `/change-control/:id/approve` | Phê duyệt (e-sig) |
| `POST` | `/change-control/:id/reject` | Từ chối |
| `POST` | `/change-control/:id/implement` | Bắt đầu triển khai |
| `POST` | `/change-control/:id/verify` | Xác minh kết quả |
| `POST` | `/change-control/:id/close` | Đóng |
| `POST` | `/change-control/:id/cancel` | Huỷ |

**Filter Params:**
```
page=1&limit=10
search=cleaning procedure
typeFilter=Process Change
impactFilter=High
statusFilter=Pending Approval
department=Manufacturing
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
```

---

## 15. Equipment

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/equipment` | Danh sách |
| `GET` | `/equipment/:id` | Chi tiết |
| `POST` | `/equipment` | Đăng ký thiết bị mới |
| `PUT` | `/equipment/:id` | Cập nhật |
| `DELETE` | `/equipment/:id` | Xoá |
| `GET` | `/equipment/stats` | Thống kê |
| `GET` | `/equipment/export` | Xuất XLSX |
| `PATCH` | `/equipment/:id/status` | Cập nhật trạng thái |
| `POST` | `/equipment/:id/retire` | Cho nghỉ hưu |
| `GET` | `/equipment/:id/calibrations` | Lịch sử hiệu chỉnh |
| `POST` | `/equipment/:id/calibrations` | Thêm bản ghi hiệu chỉnh |
| `GET` | `/equipment/calibration-due` | Thiết bị sắp đến hạn hiệu chỉnh |
| `GET` | `/equipment/:id/maintenances` | Lịch sử bảo trì |
| `POST` | `/equipment/:id/maintenances` | Thêm bản ghi bảo trì |
| `GET` | `/equipment/maintenance-due` | Sắp đến hạn bảo trì |
| `GET` | `/equipment/:id/qualifications` | Lịch sử qualification |
| `POST` | `/equipment/:id/qualify` | Ghi nhận qualification |
| `GET` | `/equipment/qualification-due` | Sắp đến hạn re-qualification |

**Filter Params:**
```
page=1&limit=10
search=dissolution apparatus
typeFilter=Laboratory
statusFilter=Active
locationFilter=QC Lab A
department=Quality Control
dateFrom=2026-01-01&dateTo=2026-04-21
```

**Request: POST `/equipment/:id/calibrations`**
```json
{
  "calibrationDate": "2026-04-20",
  "nextCalibrationDate": "2026-07-20",
  "result": "Pass",
  "performedBy": "uuid-technician",
  "certificateNumber": "CAL-2026-042",
  "notes": "All parameters within specification"
}
```

---

## 16. Supplier

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/suppliers` | Danh sách |
| `GET` | `/suppliers/:id` | Chi tiết |
| `POST` | `/suppliers` | Thêm nhà cung cấp |
| `PUT` | `/suppliers/:id` | Cập nhật |
| `DELETE` | `/suppliers/:id` | Xoá |
| `GET` | `/suppliers/stats` | Thống kê |
| `GET` | `/suppliers/export` | Xuất XLSX |
| `POST` | `/suppliers/:id/qualify` | Đánh giá đủ điều kiện |
| `POST` | `/suppliers/:id/suspend` | Tạm đình chỉ |
| `POST` | `/suppliers/:id/disqualify` | Loại khỏi danh sách |
| `PATCH` | `/suppliers/:id/risk-rating` | Cập nhật mức rủi ro |
| `GET` | `/suppliers/:id/audits` | Lịch sử audit |
| `POST` | `/suppliers/:id/audits/schedule` | Lên lịch audit |
| `POST` | `/suppliers/:id/audits/:auditId/record` | Ghi kết quả audit |
| `GET` | `/suppliers/audit-due` | Sắp đến hạn audit |
| `POST` | `/suppliers/:id/certificates/gmp` | Upload GMP certificate |
| `POST` | `/suppliers/:id/certificates/gdp` | Upload GDP certificate |
| `POST` | `/suppliers/:id/certificates/iso` | Upload ISO certificate |
| `GET` | `/suppliers/:id/certificates` | Danh sách certificates |
| `DELETE` | `/suppliers/:id/certificates/:certId` | Xoá certificate |
| `GET` | `/suppliers/certificates-expiring` | Certificates sắp hết hạn |
| `POST` | `/suppliers/:id/quality-agreement` | Upload Quality Agreement |
| `GET` | `/suppliers/:id/quality-agreement` | Lấy QA document |

**Filter Params:**
```
page=1&limit=10
search=Pfizer
categoryFilter=API Manufacturer
statusFilter=Qualified
riskFilter=Low
countryFilter=Germany
dateFrom=2026-01-01&dateTo=2026-04-21
```

---

## 17. Product

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/products` | Danh sách |
| `GET` | `/products/:id` | Chi tiết |
| `POST` | `/products` | Tạo sản phẩm mới |
| `PUT` | `/products/:id` | Cập nhật |
| `DELETE` | `/products/:id` | Xoá |
| `GET` | `/products/stats` | Thống kê |
| `GET` | `/products/export` | Xuất XLSX |
| `POST` | `/products/:id/approve` | Phê duyệt (e-sig) |
| `POST` | `/products/:id/market` | Đưa ra thị trường |
| `POST` | `/products/:id/discontinue` | Ngừng sản xuất |
| `GET` | `/products/:id/batches` | Danh sách lô |
| `POST` | `/products/:id/batches` | Tạo lô mới |
| `GET` | `/products/:id/batches/:batchId` | Chi tiết lô |
| `POST` | `/products/:id/batches/:batchId/release` | Phóng thích lô (e-sig QP) |
| `POST` | `/products/:id/batches/:batchId/reject` | Từ chối lô |
| `GET` | `/products/:id/specifications` | Thông số kỹ thuật |
| `POST` | `/products/:id/specifications` | Thêm thông số |
| `PUT` | `/products/:id/specifications/:specId` | Cập nhật thông số |
| `GET` | `/products/:id/deviations` | Deviations liên quan |
| `GET` | `/products/:id/complaints` | Complaints liên quan |
| `GET` | `/products/:id/capas` | CAPAs liên quan |

**Filter Params:**
```
page=1&limit=10
search=amoxicillin
typeFilter=Drug Product
statusFilter=Commercially Available
dosageFormFilter=Tablet
therapeuticArea=Anti-infective
dateFrom=2026-01-01&dateTo=2026-04-21
```

---

## 18. Regulatory

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/regulatory` | Danh sách hồ sơ |
| `GET` | `/regulatory/:id` | Chi tiết |
| `POST` | `/regulatory` | Tạo hồ sơ mới |
| `PUT` | `/regulatory/:id` | Cập nhật |
| `DELETE` | `/regulatory/:id` | Xoá |
| `GET` | `/regulatory/stats` | Thống kê |
| `GET` | `/regulatory/export` | Xuất XLSX |
| `POST` | `/regulatory/:id/submit` | Nộp hồ sơ |
| `POST` | `/regulatory/:id/start-review` | Bắt đầu xem xét |
| `POST` | `/regulatory/:id/receive-questions` | Nhận câu hỏi từ cơ quan |
| `POST` | `/regulatory/:id/submit-response` | Nộp phản hồi |
| `POST` | `/regulatory/:id/approve` | Được phê duyệt |
| `POST` | `/regulatory/:id/refuse` | Bị từ chối |
| `POST` | `/regulatory/:id/withdraw` | Rút hồ sơ |
| `POST` | `/regulatory/:id/initiate-renewal` | Bắt đầu gia hạn |
| `POST` | `/regulatory/:id/dossier/upload` | Upload tài liệu hồ sơ |
| `GET` | `/regulatory/:id/dossier` | Danh sách file hồ sơ |
| `DELETE` | `/regulatory/:id/dossier/:fileId` | Xoá file hồ sơ |

**Filter Params:**
```
page=1&limit=10
search=MAA amoxicillin
typeFilter=Marketing Authorization Application
authorityFilter=EMA
statusFilter=Under Review
product=uuid-product
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
```

---

## 19. Risk Management

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/risks` | Danh sách |
| `GET` | `/risks/:id` | Chi tiết |
| `POST` | `/risks` | Tạo rủi ro mới |
| `PUT` | `/risks/:id` | Cập nhật |
| `DELETE` | `/risks/:id` | Xoá |
| `GET` | `/risks/stats` | Thống kê |
| `GET` | `/risks/export` | Xuất XLSX |
| `GET` | `/risks/matrix-data` | Dữ liệu ma trận rủi ro |
| `GET` | `/risks/export/risk-matrix` | Xuất ma trận PNG/PDF |
| `PATCH` | `/risks/:id/rpn` | Cập nhật P/S/D (RPN = P×S×D tự động) |
| `POST` | `/risks/:id/assess` | Bắt đầu đánh giá |
| `POST` | `/risks/:id/plan-mitigation` | Lập kế hoạch giảm thiểu |
| `POST` | `/risks/:id/mitigate` | Ghi nhận giảm thiểu |
| `POST` | `/risks/:id/accept` | Chấp nhận rủi ro |
| `POST` | `/risks/:id/escalate` | Leo thang |
| `POST` | `/risks/:id/close` | Đóng |
| `POST` | `/risks/:id/review` | Xem xét định kỳ |
| `POST` | `/risks/:id/link-deviation` | Liên kết Deviation |
| `POST` | `/risks/:id/link-capa` | Liên kết CAPA |

**Filter Params:**
```
page=1&limit=10
search=cross contamination
categoryFilter=Quality
levelFilter=High
statusFilter=Mitigation In Progress
assessmentMethod=FMEA
department=Manufacturing
assignedTo=uuid-user
dateFrom=2026-01-01&dateTo=2026-04-21
```

**Request: POST `/risks`**
```json
{
  "title": "Cross-contamination risk in shared production area",
  "description": "Shared production line between penicillin and non-penicillin products",
  "category": "Quality",
  "assessmentMethod": "FMEA",
  "probability": 3,
  "severity": 5,
  "detectability": 2,
  "identifiedBy": "uuid-user",
  "department": "Manufacturing",
  "assignedTo": "uuid-risk-owner",
  "reviewDate": "2026-07-01"
}
```
> `rpn` = 3 × 5 × 2 = **30** — server tự tính, không cần gửi lên.

---

## 20. Audit Trail

> **Immutable, append-only** — server tự ghi nhận mọi thao tác, không có endpoint `POST/PUT/DELETE` cho audit records. Tuân thủ 21 CFR Part 11, EU-GMP Annex 11, ALCOA+ (Attributable, Legible, Contemporaneous, Original, Accurate).
>
> Xuất bản ghi đơn lẻ yêu cầu **e-signature** (xác nhận danh tính người xuất cho mục đích pháp lý).

### 20.1 Endpoint Table

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/audit-trail` | Danh sách bản ghi (filter + phân trang) |
| `GET` | `/audit-trail/:id` | Chi tiết bản ghi (bao gồm `changes[]`, `metadata`) |
| `GET` | `/audit-trail/entity/:module/:entityId` | Lịch sử của 1 thực thể cụ thể |
| `GET` | `/audit-trail/user/:userId` | Lịch sử hành động của 1 user |
| `GET` | `/audit-trail/session/:sessionId` | Toàn bộ phiên làm việc |
| `GET` | `/audit-trail/stats` | Thống kê tổng hợp |
| `GET` | `/audit-trail/export` | Xuất danh sách — XLSX hoặc PDF |
| `GET` | `/audit-trail/:id/export/json` | Xuất bản ghi đơn dạng JSON (yêu cầu e-sig) |
| `GET` | `/audit-trail/:id/export/pdf` | Xuất bản ghi đơn dạng PDF (yêu cầu e-sig) |
| `GET` | `/audit-trail/:id/export/txt` | Xuất bản ghi đơn dạng TXT (yêu cầu e-sig) |
| `GET` | `/audit-trail/integrity-check` | Kiểm tra tính toàn vẹn (hash chain) |

### 20.2 Enums

**AuditAction (18 values):**

| Action | Severity mặc định | Mô tả |
|--------|-------------------|-------|
| `Create` | Medium | Tạo thực thể mới |
| `Update` | Medium | Cập nhật trường dữ liệu |
| `Delete` | High | Xoá thực thể |
| `Approve` | High | Phê duyệt với e-signature |
| `Reject` | High | Từ chối với lý do |
| `Review` | Medium | Hoàn thành bước review |
| `Publish` | High | Phát hành (document/course) |
| `Archive` | Medium | Lưu trữ / Obsolete |
| `Restore` | High | Khôi phục bản đã xoá |
| `Login` | Low | Đăng nhập thành công |
| `Logout` | Low | Đăng xuất |
| `Export` | Medium | Xuất dữ liệu ra file |
| `Download` | Low | Tải file |
| `Upload` | Medium | Upload file mới |
| `Assign` | Medium | Phân công (training, task) |
| `Unassign` | Medium | Huỷ phân công |
| `Enable` | Medium | Kích hoạt tài khoản/tính năng |
| `Disable` | High | Vô hiệu hoá tài khoản/tính năng |

**AuditModule (13 values):**

`Document | Revision | User | Role | CAPA | Deviation | Training | Controlled Copy | System | Settings | Report | Task | Notification`

**AuditSeverity:** `Low | Medium | High | Critical`

> **Severity override rules:**
> - `Critical` — hành động ảnh hưởng toàn hệ thống hoặc tạo Deviation mức Critical
> - `High` — bất kỳ hành động nào kèm e-signature (Approve, Reject, Publish, Delete)
> - `Medium` — thay đổi dữ liệu nghiệp vụ (Create, Update, Upload, Assign)
> - `Low` — đọc/tải xuống, đăng nhập/xuất

### 20.3 Filter Params — `GET /audit-trail`

```
page=1&limit=50
search=john.doe           # khớp với user, entityName, description
module=Document
action=Approve
userId=uuid-user
severity=High
dateFrom=2026-04-01T00:00:00Z&dateTo=2026-04-21T23:59:59Z
sort=timestamp&order=desc
```

### 20.4 Response: AuditRecord

```json
{
  "id": "AUD-2026-00142",
  "timestamp": "2026-04-21T10:32:18Z",
  "user": "Dr. Sarah Johnson",
  "userId": "USR001",
  "module": "Document",
  "action": "Approve",
  "entityId": "SOP.0001.03",
  "entityName": "Quality Control Testing SOP",
  "description": "Approved document for publication",
  "changes": [
    { "field": "status", "oldValue": "Pending Approval", "newValue": "Approved" },
    { "field": "approvedBy", "oldValue": "", "newValue": "Dr. Sarah Johnson" }
  ],
  "ipAddress": "192.168.1.45",
  "device": "Windows 11 - Chrome 120.0",
  "severity": "High",
  "metadata": {
    "signatureId": "SIG-2026-00089",
    "signatureReason": "Approved for issuance per QA review",
    "sessionId": "SESSION-2026-0421-001"
  }
}
```

> `changes[]` chỉ có khi action là `Update`, `Approve`, `Reject`, `Publish`, `Archive`, `Enable`, `Disable`.
> `metadata` chứa thông tin bổ sung tuỳ theo module (xem §20.5).

### 20.5 Sự kiện được ghi nhận theo Module

Mọi thao tác trên hệ thống phải tạo một `AuditRecord`. Dưới đây là danh sách đầy đủ theo module:

#### Module: Document

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Tạo tài liệu mới | `Create` | Medium | `{ documentCode, version }` |
| Cập nhật metadata | `Update` | Medium | `changes[]` |
| Xoá tài liệu | `Delete` | High | `{ reason }` |
| Gửi phê duyệt | `Update` | Medium | `{ fromStatus, toStatus: "Pending Review" }` |
| Hoàn thành review | `Review` | Medium | `{ signatureId, comment }` |
| Phê duyệt | `Approve` | High | `{ signatureId, signatureReason, version }` |
| Từ chối | `Reject` | High | `{ signatureId, rejectionReason }` |
| Phát hành (Effective) | `Publish` | High | `{ signatureId, version, effectiveDate }` |
| Lưu trữ / Obsolete | `Archive` | Medium | `{ reason, replacedBy? }` |
| Tải file | `Download` | Low | `{ fileType, fileSize }` |
| Xem trước | `Download` | Low | `{ action: "preview" }` |
| Xuất tài liệu | `Export` | Medium | `{ format }` |
| Upload file đính kèm | `Upload` | Medium | `{ fileName, fileSize }` |

#### Module: Revision (Controlled Copy)

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Tạo yêu cầu controlled copy | `Create` | Low | `{ documentId, documentCode }` |
| Phê duyệt phát hành controlled copy | `Approve` | High | `{ signatureId, copyNumber }` |
| Huỷ/Thu hồi controlled copy | `Delete` | High | `{ reason, signatureId }` |

#### Module: Training

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Tạo khoá học | `Create` | Medium | `{ courseCode }` |
| Phê duyệt khoá học | `Approve` | High | `{ signatureId, courseCode }` |
| Upload training material | `Upload` | Medium | `{ materialCode, fileType, fileSize }` |
| Phân công training | `Assign` | Medium | `{ courseId, targetScope, targetCount, trigger }` |
| Ghi nhận hoàn thành training | `Update` | Medium | `{ traineeId, score, isPassed, signatureId }` |
| OJT verification (trainer sign-off) | `Approve` | High | `{ traineeId, taskName, signatureId }` |
| Waiver assignment | `Update` | High | `{ traineeId, waiverReason, signatureId }` |
| Tạo auto-assignment rule | `Create` | Medium | `{ ruleId, trigger }` |
| QA phê duyệt rule | `Approve` | High | `{ ruleId, signatureId }` |

#### Module: CAPA / Deviation

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Tạo CAPA/Deviation | `Create` | Medium | `{ code, severity }` |
| Cập nhật điều tra | `Update` | Medium | `changes[]` |
| Phê duyệt đóng | `Approve` | High | `{ signatureId }` |
| Liên kết CAPA ↔ Deviation | `Update` | Medium | `{ linkedId, linkedType }` |

#### Module: User / Role

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Tạo user | `Create` | Medium | `{ email, role, department }` |
| Cập nhật thông tin user | `Update` | Medium | `changes[]` |
| Vô hiệu hoá user | `Disable` | High | `{ reason }` |
| Kích hoạt lại user | `Enable` | Medium | — |
| Đổi role | `Update` | High | `{ oldRole, newRole }` |
| Đặt lại mật khẩu | `Update` | High | `{ resetBy }` |
| Tạo/Sửa/Xoá Role | `Create/Update/Delete` | High | `{ roleName, permissionsChanged? }` |

#### Module: System / Settings

| Hành động | Action | Severity | metadata |
|-----------|--------|----------|----------|
| Đăng nhập thành công | `Login` | Low | `{ sessionId }` |
| Đăng nhập thất bại | `Login` | High | `{ reason: "invalid_credentials" \| "mfa_failed" \| "account_locked" }` |
| Đăng xuất | `Logout` | Low | `{ sessionId, sessionDuration }` |
| Đổi mật khẩu | `Update` | High | — |
| Cập nhật cài đặt hệ thống | `Update` | High | `{ settingKey, oldValue, newValue }` |
| Xuất báo cáo | `Export` | Medium | `{ reportType, format, filters }` |

### 20.6 Entity History — `GET /audit-trail/entity/:module/:entityId`

Trả về toàn bộ lịch sử hành động trên một thực thể cụ thể, ví dụ toàn bộ audit trail của document `SOP-QC-2026-001`.

```
GET /audit-trail/entity/Document/SOP.0001.03
```

Response: paginated list of `AuditRecord` với `entityId = SOP.0001.03`, sắp xếp `timestamp DESC`.

### 20.7 Stats — `GET /audit-trail/stats`

```json
{
  "totalRecords": 48530,
  "todayRecords": 142,
  "byModule": {
    "Document": 12400,
    "Training": 8900,
    "User": 3200,
    "CAPA": 5600,
    "Deviation": 4800,
    "System": 9100,
    "Settings": 530,
    "Report": 1200,
    "Task": 2100,
    "Notification": 700
  },
  "bySeverity": {
    "Low": 18200,
    "Medium": 21400,
    "High": 7900,
    "Critical": 1030
  },
  "recentHighSeverity": [
    {
      "id": "AUD-2026-00142",
      "timestamp": "2026-04-21T10:32:18Z",
      "user": "Dr. Sarah Johnson",
      "module": "Document",
      "action": "Approve",
      "entityName": "Quality Control Testing SOP",
      "severity": "High"
    }
  ]
}
```

### 20.8 Export

**`GET /audit-trail/export`** — xuất danh sách (áp dụng cùng filter params như `GET /audit-trail`):
```
format=xlsx         # xlsx | pdf
module=Document
severity=High
dateFrom=2026-04-01&dateTo=2026-04-21
```
Response: Binary blob với `Content-Disposition: attachment; filename="audit_trail_2026-04-21.xlsx"`.

**`GET /audit-trail/:id/export/json|pdf|txt`** — xuất bản ghi đơn lẻ — **yêu cầu e-signature** (Annex 11 §11.70):

Request phải kèm header:
```
X-ESign-UserId:   uuid-user
X-ESign-Password: <bcrypt hash>
X-ESign-Reason:   Exporting for regulatory submission
```

Hoặc body (nếu dùng POST variant):
```json
{
  "eSignature": {
    "userId": "uuid-user",
    "password": "****",
    "reason": "Exporting for regulatory submission"
  }
}
```

Export formats:
- **JSON**: Toàn bộ `AuditRecord` object
- **PDF**: Formatted document với header tổ chức, bản ghi đầy đủ, chữ ký điện tử
- **TXT**: Plain text — ID, timestamp, user, IP, module, action, entity, description, changes

### 20.9 Integrity Check — `GET /audit-trail/integrity-check`

Server kiểm tra hash chain của toàn bộ audit log. Mỗi record chứa `hash = SHA-256(previousHash + recordData)`.

```json
{
  "status": "OK",
  "checkedRecords": 48530,
  "failedRecords": 0,
  "firstRecord": "AUD-2026-00001",
  "lastRecord": "AUD-2026-48530",
  "checkedAt": "2026-04-21T10:00:00Z"
}
```

Nếu `failedRecords > 0`, response thêm:
```json
{
  "status": "TAMPERED",
  "failedAt": ["AUD-2026-00891", "AUD-2026-00892"],
  "alertSentTo": ["admin@company.com"]
}
```

> Endpoint này chỉ dành cho `System Administrator`. Kết quả kiểm tra bản thân cũng được ghi vào audit trail với `module: "System"`, `action: "Update"`, `entityName: "Audit Integrity Check"`.

---

## 21. Notifications

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/notifications` | Danh sách thông báo |
| `GET` | `/notifications/unread-count` | Số chưa đọc (badge) |
| `GET` | `/notifications/:id` | Chi tiết (auto-mark read) |
| `PUT` | `/notifications/:id/read` | Đánh dấu đã đọc |
| `PUT` | `/notifications/read-all` | Đánh dấu tất cả đã đọc |
| `PUT` | `/notifications/read` | Đánh dấu nhiều đã đọc |
| `DELETE` | `/notifications/:id` | Xoá thông báo |
| `DELETE` | `/notifications` | Xoá nhiều thông báo |
| `DELETE` | `/notifications/clear-all` | Xoá tất cả |
| `GET` | `/notifications/preferences` | Cài đặt thông báo |
| `PUT` | `/notifications/preferences` | Cập nhật cài đặt |
| `POST` | `/notifications/push/register` | Đăng ký push notification |
| `DELETE` | `/notifications/push/unregister` | Huỷ đăng ký push |
| `GET` | `/notifications/ws-token` | Lấy token WebSocket |

**Filter Params:**
```
page=1&limit=20
tab=all          # all | for-me | system
status=unread    # unread | read
type=review-request
priority=high
dateFrom=2026-04-01&dateTo=2026-04-21
search=SOP-QC
```

**Response: Notification**
```json
{
  "id": "uuid",
  "type": "review-request",
  "title": "Document requires your review",
  "message": "SOP-QC-2026-001 has been submitted for review",
  "status": "unread",
  "priority": "high",
  "sender": { "id": "uuid-sender", "name": "Jane Smith", "avatar": "/avatars/uuid.jpg" },
  "relatedItem": { "id": "uuid-doc", "type": "Document", "code": "SOP-QC-2026-001", "title": "Batch Release SOP" },
  "relatedModule": "documents",
  "relatedEntityUrl": "/documents/uuid-doc",
  "createdAt": "2026-04-21T09:30:00Z",
  "readAt": null
}
```

**GET `/notifications/ws-token`**
```json
{
  "token": "ws-auth-token",
  "wsUrl": "wss://api.eqms.local/ws/notifications"
}
```

---

## 22. My Tasks

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/tasks/my-tasks` | Danh sách task của user hiện tại |
| `GET` | `/tasks/:id` | Chi tiết task |
| `PATCH` | `/tasks/:id/status` | Cập nhật trạng thái |
| `POST` | `/tasks/:id/complete` | Hoàn thành (optional e-sig) |
| `POST` | `/tasks/:id/reassign` | Chuyển giao |
| `POST` | `/tasks/:id/delegate` | Uỷ quyền |
| `GET` | `/tasks/overdue` | Task quá hạn |
| `GET` | `/tasks/stats` | Thống kê |

**Filter Params cho `GET /tasks/my-tasks`:**
```
page=1&limit=10
search=batch release
module=Document       # Document | Deviation | CAPA | Training
priority=High
status=Pending
assignee=uuid-user
reporter=uuid-manager
dueDateFrom=2026-04-01
dueDateTo=2026-04-30
sort=dueDate&order=asc
```

**Response: Task**
```json
{
  "id": "uuid",
  "taskId": "TASK-2026-088",
  "title": "Review SOP-QC-2026-001",
  "description": "Review and provide feedback on batch release SOP",
  "module": "Document",
  "relatedEntityId": "uuid-doc",
  "relatedEntityUrl": "/documents/uuid-doc",
  "priority": "High",
  "status": "Pending",
  "assignee": { "id": "uuid", "fullName": "John Doe", "avatarUrl": "/avatars/uuid.jpg" },
  "reporter": { "id": "uuid", "fullName": "Jane Smith" },
  "dueDate": "25/04/2026",
  "progress": 0,
  "timeline": [
    { "status": "Created", "timestamp": "2026-04-21T08:00:00Z", "by": "System" }
  ],
  "createdAt": "2026-04-21T08:00:00Z",
  "updatedAt": "2026-04-21T08:00:00Z"
}
```

> **module** values: `Document | Deviation | CAPA | Training` (4 values only)  
> **dueDate** format: `dd/MM/yyyy`

---

## 23. My Team

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/team/members` | Danh sách thành viên trong team |
| `GET` | `/team/stats` | Thống kê team (compliance, response time) |
| `GET` | `/team/org-chart` | Cấu trúc tổ chức phân cấp |
| `GET` | `/team/members/:userId/tasks` | Task của 1 thành viên |
| `GET` | `/team/members/:userId/training` | Hồ sơ training của thành viên |

**Response: GET `/team/members`**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "role": "QA Analyst",
    "department": "Quality Assurance",
    "status": "active",
    "employeeId": "EMP-001",
    "email": "john@pharma.com",
    "phone": "+84-901-234-567",
    "location": "Ho Chi Minh City",
    "avatarUrl": "/avatars/uuid.jpg",
    "joinDate": "2022-03-15T00:00:00Z",
    "isHead": false,
    "parentId": "uuid-manager"
  }
]
```

> **status** values: `active | on-leave | remote`  
> **tenure** is computed client-side from `joinDate`

**Response: GET `/team/stats`**
```json
{
  "teamSize": 12,
  "trainingCompliance": 94,
  "averageResponseTimeDays": 2.4,
  "openTasks": 18,
  "overdueTasks": 2
}
```

---

## 24. Dashboard

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/dashboard/stats` | KPI tổng quan |
| `GET` | `/dashboard/recent-activity` | Hoạt động gần đây |
| `GET` | `/dashboard/my-tasks` | Task của tôi |
| `GET` | `/dashboard/my-pending-approvals` | Chờ phê duyệt của tôi |
| `GET` | `/dashboard/deadlines` | Sắp đến hạn |
| `GET` | `/dashboard/quality-index` | Chỉ số chất lượng |
| `GET` | `/dashboard/trends` | Xu hướng theo thời gian |
| `GET` | `/dashboard/alerts` | Cảnh báo hệ thống |
| `GET` | `/dashboard/module-summary` | Tóm tắt từng module |

**Response: GET `/dashboard/stats`**
```json
{
  "openDeviations": 15,
  "openCAPAs": 10,
  "pendingDocuments": 8,
  "openComplaints": 6,
  "trainingCompliancePercent": 91.5,
  "calibrationDue": 4,
  "supplierIssues": 2,
  "openRisks": 12
}
```

**Query Params:** `dateFrom?`, `dateTo?`, `limit?`, `days?` (cho deadlines)

---

## 25. Reports

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/reports/summary` | Tóm tắt tổng hợp |
| `GET` | `/reports/kpi-dashboard` | KPI data |
| `GET` | `/reports/:reportType` | Dữ liệu báo cáo theo module |
| `GET` | `/reports/:reportType/export` | Xuất XLSX |
| `GET` | `/reports/:reportType/export/pdf` | Xuất PDF |
| `GET` | `/reports/trends` | Xu hướng đa module |
| `POST` | `/reports/custom` | Báo cáo tuỳ chỉnh → xuất XLSX |

**reportType values:** `deviations`, `capa`, `complaints`, `change-control`, `equipment`, `supplier`, `training`, `risk`, `regulatory`, `documents`

**Common Filter Params:** `dateFrom`, `dateTo`, `department`, `status`, module-specific filters

**Request: POST `/reports/custom`**
```json
{
  "modules": ["deviations", "capa"],
  "fields": ["id", "title", "status", "severity", "department", "assignedTo"],
  "filters": { "department": "Quality Control", "statusFilter": "Open" },
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-21"
}
```

---

## 26. Settings — Users & Roles

### 26.1 User Management

| Method | Endpoint | Yêu cầu quyền | Mục đích |
|--------|----------|----------------|---------|
| `GET` | `/settings/users` | `user_view` | Danh sách users |
| `GET` | `/settings/users/:id` | `user_view` | Chi tiết user |
| `POST` | `/settings/users` | `user_create` | Tạo user mới (gửi email mời) |
| `PUT` | `/settings/users/:id` | `user_edit` | Cập nhật thông tin |
| `DELETE` | `/settings/users/:id` | `SuperAdmin` | Xoá user |
| `GET` | `/settings/users/export` | `user_view` | Xuất XLSX |
| `POST` | `/settings/users/:id/suspend` | `user_edit` | Tạm đình chỉ |
| `POST` | `/settings/users/:id/terminate` | `user_edit` | Chấm dứt |
| `POST` | `/settings/users/:id/reinstate` | `user_edit` | Khôi phục |
| `POST` | `/settings/users/:id/reset-password` | `user_reset` | Reset mật khẩu |
| `POST` | `/settings/users/:id/force-logout` | `user_edit` | Đăng xuất bắt buộc |
| `POST` | `/settings/users/:id/unlock` | `user_edit` | Mở khoá tài khoản |
| `GET` | `/settings/users/:id/permissions` | `user_view` | Permissions hiệu lực của user |
| `PUT` | `/settings/users/:id/role` | `user_edit` + `role_manage` | Đổi vai trò |

### 26.2 Role Management

| Method | Endpoint | Yêu cầu quyền | Mục đích |
|--------|----------|----------------|---------|
| `GET` | `/settings/roles` | `settings_view` | Danh sách vai trò |
| `GET` | `/settings/roles/:id` | `settings_view` | Chi tiết role |
| `POST` | `/settings/roles` | `role_manage` | Tạo custom role |
| `PUT` | `/settings/roles/:id` | `role_manage` | Cập nhật tên/mô tả |
| `DELETE` | `/settings/roles/:id` | `role_manage` | Xoá custom role (không xoá system role) |
| `GET` | `/settings/roles/:id/permissions` | `settings_view` | Permissions của role |
| `PUT` | `/settings/roles/:id/permissions` | `role_manage` | Thay thế toàn bộ permission set |
| `GET` | `/settings/permissions` | `settings_view` | Tất cả permission definitions (dùng cho UI) |

**Filter Params cho `GET /settings/users`:**
```
page=1&limit=10
search=john
role=QA Manager
status=Active
businessUnit=Quality Unit
department=Quality Assurance
dateFrom=2026-01-01&dateTo=2026-04-21
```

**Request: POST `/settings/users`**
```json
{
  "username": "jane.nguyen",
  "email": "jane.nguyen@pharma.com",
  "fullName": "Nguyen Thi Jane",
  "role": "QA",
  "department": "Quality Assurance",
  "businessUnit": "Quality Unit",
  "jobTitle": "QA Analyst II",
  "phone": "+84-912-345-678",
  "employeeId": "EMP-2026-015",
  "startDate": "2026-05-01",
  "gender": "Female",
  "employmentType": "Full-time"
}
```

**Extended Profile Fields (PUT `/settings/users/:id`):**  
Additional fields beyond core: `dateOfBirth, nationality, address, idNumber, managerName, language, degree, fieldOfStudy, institution, graduationYear, gpa, professionalLevel, areaOfExpertise, yearsOfExperience, previousEmployer, certifications[], educationList[]`

**POST `/settings/users/:id/suspend`:**
```json
{ "reason": "Policy violation", "suspendedUntil": "2026-06-01" }
```

**POST `/settings/users/:id/terminate`:**
```json
{ "reason": "Resignation", "terminationDate": "2026-05-31" }
```

{ "reason": "Resignation", "terminationDate": "2026-05-31" }
```

**Response (GET `/settings/roles`):**
```json
[
  {
    "id": "uuid",
    "name": "QA Manager",
    "description": "Quality Assurance Manager",
    "type": "system",
    "isActive": true,
    "userCount": 3,
    "permissions": ["doc_view", "doc_approve", "doc_review", "train_assign"],
    "color": "#3b82f6",
    "createdDate": "2024-01-01T00:00:00Z",
    "modifiedDate": "2026-04-01T08:00:00Z"
  }
]
```

**Request/Response (POST `/settings/roles`):**
```json
// Request
{
  "name": "Content Reviewer",
  "description": "Review documents and training materials",
  "color": "#8b5cf6",
  "permissions": ["doc_view", "doc_review", "train_mat_view", "train_mat_review"]
}

// Response 201
{
  "id": "role-uuid",
  "name": "Content Reviewer",
  "description": "Review documents and training materials",
  "type": "custom",
  "isActive": true,
  "userCount": 0,
  "permissions": ["doc_view", "doc_review", "train_mat_view", "train_mat_review"],
  "color": "#8b5cf6",
  "createdDate": "2026-05-20T10:30:00Z",
  "modifiedDate": "2026-05-20T10:30:00Z"
}
```

**Request (PUT `/settings/roles/:id/permissions`):**
```json
{ "permissions": ["doc_view", "doc_review", "doc_create"] }
```

**Error — xoá system role (`DELETE /settings/roles/:id`):**
```json
// 403 Forbidden
{
  "error": "SYSTEM_ROLE_PROTECTED",
  "message": "System roles cannot be deleted."
}
```

**Error — xoá role đang được gán (`DELETE /settings/roles/:id`):**
```json
// 409 Conflict
{
  "error": "ROLE_IN_USE",
  "message": "Cannot delete role with 5 active users. Reassign users first.",
  "userCount": 5
}
```

**Response (GET `/settings/users/:id/permissions`)** — trả về tập hợp permission IDs hiệu lực (union của tất cả roles user được gán):
```json
{
  "userId": "user-uuid",
  "roles": ["QA Manager", "Auditor"],
  "effectivePermissions": [
    "doc_view", "doc_review", "doc_approve", "doc_archive", "doc_print",
    "audit_view", "audit_export",
    "train_view", "train_manage_view", "train_assign", "train_records_export"
  ]
}
```

**Response:**
```json
{
  "user": { "id": "uuid", "username": "jane.nguyen", "status": "Pending", "..." : "..." },
  "temporaryPassword": "Temp@2026!",
  "invitationEmailSent": true
}
```

---

### 26.3 Authorization Model (RBAC)

Hệ thống sử dụng **Role-Based Access Control (RBAC)** với các Permission ID dạng chuỗi ngắn (ví dụ: `doc_approve`). Mỗi user được gán một hoặc nhiều roles; quyền hiệu lực là **union** của tất cả permissions trong các roles đó.

#### 26.3.1 Permission ID Convention

| Pattern | Ví dụ | Ý nghĩa |
|---------|-------|---------|
| `{module_prefix}_{action}` | `doc_approve` | Approve document |
| — | `capa_close` | Close a CAPA record |
| — | `train_records_export` | Export training records |

Khi một permission có `requiresAudit: true`, **server phải ghi audit trail entry** cho hành động đó (ALCOA+ compliance).

#### 26.3.2 403 Forbidden Response

Tất cả endpoints bảo vệ bằng permission trả về cấu trúc sau khi thiếu quyền:
```json
{
  "error": "PERMISSION_DENIED",
  "required": "doc_approve",
  "message": "You do not have permission to perform this action."
}
```

**SuperAdmin** (System Administrator role) bỏ qua mọi permission check.

#### 26.3.3 All Permission Groups

**GET `/settings/permissions`** trả về toàn bộ permission definitions nhóm theo module:

```json
[
  {
    "id": "documents",
    "name": "Document Management",
    "order": 1,
    "permissions": [
      { "id": "doc_view",    "action": "view",    "label": "View Documents",        "requiresAudit": false },
      { "id": "doc_create",  "action": "create",  "label": "Create Documents",      "requiresAudit": true  },
      { "id": "doc_edit",    "action": "edit",    "label": "Edit Documents",        "requiresAudit": true  },
      { "id": "doc_review",  "action": "review",  "label": "Review Documents",      "requiresAudit": true  },
      { "id": "doc_approve", "action": "approve", "label": "Approve Documents",     "requiresAudit": true  },
      { "id": "doc_print",   "action": "export",  "label": "Print/Export Docs",     "requiresAudit": true  },
      { "id": "doc_archive", "action": "archive", "label": "Archive/Obsolete Docs", "requiresAudit": true  },
      { "id": "doc_delete",  "action": "delete",  "label": "Delete Documents",      "requiresAudit": true  }
    ]
  },
  {
    "id": "change_control",
    "name": "Change Controls",
    "order": 2,
    "permissions": [
      { "id": "cc_view",    "action": "view",    "label": "View Change Controls",  "requiresAudit": false },
      { "id": "cc_create",  "action": "create",  "label": "Initiate Change",       "requiresAudit": true  },
      { "id": "cc_edit",    "action": "edit",    "label": "Edit Change",           "requiresAudit": true  },
      { "id": "cc_review",  "action": "review",  "label": "Review Change",         "requiresAudit": true  },
      { "id": "cc_approve", "action": "approve", "label": "Approve Change",        "requiresAudit": true  },
      { "id": "cc_close",   "action": "close",   "label": "Close Change",          "requiresAudit": true  }
    ]
  },
  {
    "id": "capa",
    "name": "CAPA",
    "order": 3,
    "permissions": [
      { "id": "capa_view",    "action": "view",    "label": "View CAPAs",          "requiresAudit": false },
      { "id": "capa_create",  "action": "create",  "label": "Create CAPA",         "requiresAudit": true  },
      { "id": "capa_edit",    "action": "edit",    "label": "Edit CAPA",           "requiresAudit": true  },
      { "id": "capa_review",  "action": "review",  "label": "Review CAPA",         "requiresAudit": true  },
      { "id": "capa_approve", "action": "approve", "label": "Approve CAPA",        "requiresAudit": true  },
      { "id": "capa_close",   "action": "close",   "label": "Close CAPA",          "requiresAudit": true  }
    ]
  },
  {
    "id": "deviations",
    "name": "Deviations & Non-Conformances",
    "order": 4,
    "permissions": [
      { "id": "dev_view",    "action": "view",    "label": "View Deviations", "requiresAudit": false },
      { "id": "dev_create",  "action": "create",  "label": "Report Deviation","requiresAudit": true  },
      { "id": "dev_edit",    "action": "edit",    "label": "Edit Deviation",  "requiresAudit": true  },
      { "id": "dev_approve", "action": "approve", "label": "Approve/Close",   "requiresAudit": true  }
    ]
  },
  {
    "id": "complaints",
    "name": "Complaints",
    "order": 5,
    "permissions": [
      { "id": "complaint_view",    "action": "view",    "label": "View Complaints",  "requiresAudit": false },
      { "id": "complaint_create",  "action": "create",  "label": "Log Complaint",    "requiresAudit": true  },
      { "id": "complaint_edit",    "action": "edit",    "label": "Edit Complaint",   "requiresAudit": true  },
      { "id": "complaint_approve", "action": "approve", "label": "Approve Complaint","requiresAudit": true  },
      { "id": "complaint_close",   "action": "close",   "label": "Close Complaint",  "requiresAudit": true  }
    ]
  },
  {
    "id": "training",
    "name": "Training Management",
    "order": 6,
    "permissions": [
      { "id": "train_view",            "action": "view",   "label": "View My Training",          "requiresAudit": false },
      { "id": "train_manage_view",     "action": "view",   "label": "View All Training",         "requiresAudit": false },
      { "id": "train_assign",          "action": "assign", "label": "Assign Training",           "requiresAudit": true  },
      { "id": "train_course_create",   "action": "create", "label": "Create Courses",            "requiresAudit": true  },
      { "id": "train_course_edit",     "action": "edit",   "label": "Edit Courses",              "requiresAudit": true  },
      { "id": "train_course_delete",   "action": "delete", "label": "Delete Courses",            "requiresAudit": true  },
      { "id": "train_course_review",   "action": "review", "label": "Review Courses",            "requiresAudit": true  },
      { "id": "train_course_approve",  "action": "approve","label": "Approve Courses",           "requiresAudit": true  },
      { "id": "train_result_entry",    "action": "create", "label": "Enter Training Results",    "requiresAudit": true  },
      { "id": "train_mat_view",        "action": "view",   "label": "View Training Materials",   "requiresAudit": false },
      { "id": "train_mat_upload",      "action": "create", "label": "Upload Training Materials", "requiresAudit": true  },
      { "id": "train_mat_edit",        "action": "edit",   "label": "Edit Training Materials",   "requiresAudit": true  },
      { "id": "train_mat_delete",      "action": "delete", "label": "Delete Training Materials", "requiresAudit": true  },
      { "id": "train_mat_review",      "action": "review", "label": "Review & Approve Materials","requiresAudit": true  },
      { "id": "train_mat_obsolete",    "action": "archive","label": "Mark Materials Obsolete",   "requiresAudit": true  },
      { "id": "train_matrix_view",     "action": "view",   "label": "View Training Matrix",      "requiresAudit": false },
      { "id": "train_compliance_view", "action": "view",   "label": "View Course Status",        "requiresAudit": false },
      { "id": "train_records_export",  "action": "export", "label": "Export Training Records",   "requiresAudit": true  }
    ]
  },
  {
    "id": "risk_management",
    "name": "Risk Management",
    "order": 7,
    "permissions": [
      { "id": "risk_view",    "action": "view",    "label": "View Risk Registry",     "requiresAudit": false },
      { "id": "risk_create",  "action": "create",  "label": "Create Risk Assessment", "requiresAudit": true  },
      { "id": "risk_edit",    "action": "edit",    "label": "Update Risk",            "requiresAudit": true  },
      { "id": "risk_approve", "action": "approve", "label": "Approve Risk Assessment","requiresAudit": true  }
    ]
  },
  {
    "id": "equipment",
    "name": "Equipment Management",
    "order": 8,
    "permissions": [
      { "id": "equip_view",      "action": "view",    "label": "View Equipment",         "requiresAudit": false },
      { "id": "equip_create",    "action": "create",  "label": "Register Equipment",     "requiresAudit": true  },
      { "id": "equip_edit",      "action": "edit",    "label": "Update Equipment",       "requiresAudit": true  },
      { "id": "equip_calibrate", "action": "review",  "label": "Calibration Records",    "requiresAudit": true  },
      { "id": "equip_approve",   "action": "approve", "label": "Approve Equipment",      "requiresAudit": true  }
    ]
  },
  {
    "id": "supplier_quality",
    "name": "Supplier Management",
    "order": 9,
    "permissions": [
      { "id": "supp_view",    "action": "view",    "label": "View Suppliers",  "requiresAudit": false },
      { "id": "supp_create",  "action": "create",  "label": "Onboard Supplier","requiresAudit": true  },
      { "id": "supp_audit",   "action": "review",  "label": "Perform Audit",   "requiresAudit": true  },
      { "id": "supp_approve", "action": "approve", "label": "Approve Supplier","requiresAudit": true  }
    ]
  },
  {
    "id": "product",
    "name": "Product Management",
    "order": 10,
    "permissions": [
      { "id": "prod_view",    "action": "view",    "label": "View Products",   "requiresAudit": false },
      { "id": "prod_create",  "action": "create",  "label": "Create Product",  "requiresAudit": true  },
      { "id": "prod_edit",    "action": "edit",    "label": "Update Product",  "requiresAudit": true  },
      { "id": "prod_approve", "action": "approve", "label": "Approve Product", "requiresAudit": true  }
    ]
  },
  {
    "id": "regulatory",
    "name": "Regulatory Management",
    "order": 11,
    "permissions": [
      { "id": "reg_view",    "action": "view",    "label": "View Submissions",   "requiresAudit": false },
      { "id": "reg_create",  "action": "create",  "label": "Create Submission",  "requiresAudit": true  },
      { "id": "reg_edit",    "action": "edit",    "label": "Update Submission",  "requiresAudit": true  },
      { "id": "reg_approve", "action": "approve", "label": "Approve Submission", "requiresAudit": true  },
      { "id": "reg_export",  "action": "export",  "label": "Export Reports",     "requiresAudit": true  }
    ]
  },
  {
    "id": "reports",
    "name": "Reports & Analytics",
    "order": 12,
    "permissions": [
      { "id": "report_view",   "action": "view",   "label": "View Reports",   "requiresAudit": false },
      { "id": "report_create", "action": "create", "label": "Create Reports", "requiresAudit": false },
      { "id": "report_export", "action": "export", "label": "Export Reports", "requiresAudit": true  }
    ]
  },
  {
    "id": "audit_trail",
    "name": "Audit Trail System",
    "order": 13,
    "permissions": [
      { "id": "audit_view",   "action": "view",   "label": "View Audit Logs",   "requiresAudit": false },
      { "id": "audit_export", "action": "export", "label": "Export Audit Logs", "requiresAudit": true  }
    ]
  },
  {
    "id": "settings",
    "name": "System Settings",
    "order": 14,
    "permissions": [
      { "id": "settings_view", "action": "view",   "label": "View Configuration", "requiresAudit": false },
      { "id": "settings_edit", "action": "edit",   "label": "Edit Configuration", "requiresAudit": true  },
      { "id": "user_view",     "action": "view",   "label": "View Users",         "requiresAudit": false },
      { "id": "user_create",   "action": "create", "label": "Create Users",       "requiresAudit": true  },
      { "id": "user_edit",     "action": "edit",   "label": "Edit Users",         "requiresAudit": true  },
      { "id": "user_reset",    "action": "edit",   "label": "Reset Password",     "requiresAudit": true  },
      { "id": "role_manage",   "action": "edit",   "label": "Manage Roles",       "requiresAudit": true  }
    ]
  }
]
```

#### 26.3.4 System Roles (Predefined — không xoá được)

| Role | `type` | `userCount` (default) | Mô tả |
|------|--------|-----------------------|-------|
| **System Administrator** | `system` | 2 | Toàn quyền, bỏ qua permission check |
| **QA Manager** | `system` | 5 | Quản lý QA — approve documents, training, CAPA, change control |
| **Department Head** | `system` | 8 | Trưởng bộ phận — tạo và review, không approve |
| **Auditor** | `system` | 3 | Chỉ xem và export — không ghi dữ liệu |

**Custom roles** có `type: "custom"` và có thể bị xoá khi `userCount = 0`.

#### 26.3.5 Permission Matrix (System Roles)

| Permission ID | Sys Admin | QA Manager | Dept Head | Auditor |
|---------------|:---------:|:----------:|:---------:|:-------:|
| `doc_view` | ✓ | ✓ | ✓ | ✓ |
| `doc_create` | ✓ | — | ✓ | — |
| `doc_edit` | ✓ | — | ✓ | — |
| `doc_review` | ✓ | ✓ | ✓ | — |
| `doc_approve` | ✓ | ✓ | — | — |
| `doc_print` | ✓ | ✓ | ✓ | — |
| `doc_archive` | ✓ | ✓ | — | — |
| `doc_delete` | ✓ | — | — | — |
| `cc_view` | ✓ | ✓ | ✓ | ✓ |
| `cc_create` | ✓ | — | ✓ | — |
| `cc_edit` | ✓ | — | ✓ | — |
| `cc_review` | ✓ | ✓ | ✓ | — |
| `cc_approve` | ✓ | ✓ | — | — |
| `cc_close` | ✓ | ✓ | — | — |
| `capa_view` | ✓ | ✓ | ✓ | ✓ |
| `capa_create` | ✓ | — | ✓ | — |
| `capa_edit` | ✓ | — | ✓ | — |
| `capa_review` | ✓ | ✓ | ✓ | — |
| `capa_approve` | ✓ | ✓ | — | — |
| `capa_close` | ✓ | ✓ | — | — |
| `dev_view` | ✓ | ✓ | ✓ | ✓ |
| `dev_create` | ✓ | — | ✓ | — |
| `dev_edit` | ✓ | — | ✓ | — |
| `dev_approve` | ✓ | ✓ | — | — |
| `complaint_view` | ✓ | ✓ | ✓ | ✓ |
| `complaint_create` | ✓ | — | ✓ | — |
| `complaint_edit` | ✓ | — | ✓ | — |
| `complaint_approve` | ✓ | ✓ | — | — |
| `complaint_close` | ✓ | ✓ | — | — |
| `train_view` | ✓ | ✓ | ✓ | ✓ |
| `train_manage_view` | ✓ | ✓ | — | ✓ |
| `train_assign` | ✓ | ✓ | ✓ | — |
| `train_course_create` | ✓ | — | — | — |
| `train_course_edit` | ✓ | — | — | — |
| `train_course_review` | ✓ | ✓ | — | — |
| `train_course_approve` | ✓ | ✓ | — | — |
| `train_result_entry` | ✓ | ✓ | ✓ | — |
| `train_mat_view` | ✓ | ✓ | ✓ | ✓ |
| `train_mat_upload` | ✓ | — | — | — |
| `train_mat_edit` | ✓ | — | — | — |
| `train_mat_review` | ✓ | ✓ | — | — |
| `train_mat_obsolete` | ✓ | ✓ | — | — |
| `train_matrix_view` | ✓ | ✓ | ✓ | ✓ |
| `train_compliance_view` | ✓ | ✓ | ✓ | ✓ |
| `train_records_export` | ✓ | ✓ | — | ✓ |
| `risk_view` | ✓ | ✓ | ✓ | ✓ |
| `risk_create` | ✓ | — | ✓ | — |
| `risk_edit` | ✓ | — | ✓ | — |
| `risk_approve` | ✓ | ✓ | — | — |
| `equip_view` | ✓ | ✓ | ✓ | ✓ |
| `equip_create` | ✓ | — | ✓ | — |
| `equip_edit` | ✓ | — | ✓ | — |
| `equip_calibrate` | ✓ | — | ✓ | — |
| `equip_approve` | ✓ | ✓ | — | — |
| `supp_view` | ✓ | ✓ | ✓ | ✓ |
| `supp_create` | ✓ | — | ✓ | — |
| `supp_audit` | ✓ | ✓ | ✓ | — |
| `supp_approve` | ✓ | ✓ | — | — |
| `prod_view` | ✓ | ✓ | ✓ | ✓ |
| `prod_create` | ✓ | — | ✓ | — |
| `prod_edit` | ✓ | — | ✓ | — |
| `prod_approve` | ✓ | ✓ | — | — |
| `reg_view` | ✓ | ✓ | ✓ | ✓ |
| `reg_create` | ✓ | — | ✓ | — |
| `reg_edit` | ✓ | — | ✓ | — |
| `reg_approve` | ✓ | ✓ | — | — |
| `reg_export` | ✓ | ✓ | — | ✓ |
| `report_view` | ✓ | ✓ | ✓ | ✓ |
| `report_create` | ✓ | ✓ | — | — |
| `report_export` | ✓ | ✓ | — | ✓ |
| `audit_view` | ✓ | — | — | ✓ |
| `audit_export` | ✓ | — | — | ✓ |
| `settings_view` | ✓ | — | — | — |
| `settings_edit` | ✓ | — | — | — |
| `user_view` | ✓ | ✓ | — | — |
| `user_create` | ✓ | — | — | — |
| `user_edit` | ✓ | ✓ | — | — |
| `user_reset` | ✓ | ✓ | — | — |
| `role_manage` | ✓ | — | — | — |

#### 26.3.6 Per-Endpoint Permission Requirements

| Endpoint | Method | Required Permission |
|----------|--------|-------------------|
| `/documents` | GET | `doc_view` |
| `/documents` | POST | `doc_create` |
| `/documents/:id` | PUT | `doc_edit` |
| `/documents/:id` | DELETE | `doc_delete` |
| `/documents/:id/submit` | POST | `doc_edit` |
| `/documents/:id/review` | POST | `doc_review` |
| `/documents/:id/approve` | POST | `doc_approve` |
| `/documents/:id/reject` | POST | `doc_review` hoặc `doc_approve` |
| `/documents/:id/archive` | POST | `doc_archive` |
| `/documents/:id/revisions` | GET | `doc_view` |
| `/documents/revisions/batch` | POST | `doc_create` |
| `/change-controls` | GET | `cc_view` |
| `/change-controls` | POST | `cc_create` |
| `/change-controls/:id` | PUT | `cc_edit` |
| `/change-controls/:id/review` | POST | `cc_review` |
| `/change-controls/:id/approve` | POST | `cc_approve` |
| `/change-controls/:id/close` | POST | `cc_close` |
| `/capas` | GET | `capa_view` |
| `/capas` | POST | `capa_create` |
| `/capas/:id` | PUT | `capa_edit` |
| `/capas/:id/review` | POST | `capa_review` |
| `/capas/:id/approve` | POST | `capa_approve` |
| `/capas/:id/close` | POST | `capa_close` |
| `/deviations` | GET | `dev_view` |
| `/deviations` | POST | `dev_create` |
| `/deviations/:id` | PUT | `dev_edit` |
| `/deviations/:id/approve` | POST | `dev_approve` |
| `/complaints` | GET | `complaint_view` |
| `/complaints` | POST | `complaint_create` |
| `/complaints/:id` | PUT | `complaint_edit` |
| `/complaints/:id/approve` | POST | `complaint_approve` |
| `/complaints/:id/close` | POST | `complaint_close` |
| `/training/courses` | GET | `train_view` |
| `/training/courses` | POST | `train_course_create` |
| `/training/courses/:id` | PUT | `train_course_edit` |
| `/training/courses/:id` | DELETE | `train_course_delete` |
| `/training/courses/:id/review` | POST | `train_course_review` |
| `/training/courses/:id/approve` | POST | `train_course_approve` |
| `/training/assignments` | POST | `train_assign` |
| `/training/results` | POST | `train_result_entry` |
| `/training/materials` | GET | `train_mat_view` |
| `/training/materials` | POST | `train_mat_upload` |
| `/training/materials/:id` | PUT | `train_mat_edit` |
| `/training/materials/:id` | DELETE | `train_mat_delete` |
| `/training/materials/:id/review` | POST | `train_mat_review` |
| `/training/materials/:id/obsolete` | POST | `train_mat_obsolete` |
| `/training/matrix` | GET | `train_matrix_view` |
| `/training/compliance` | GET | `train_compliance_view` |
| `/training/records/export` | GET | `train_records_export` |
| `/risks` | GET | `risk_view` |
| `/risks` | POST | `risk_create` |
| `/risks/:id` | PUT | `risk_edit` |
| `/risks/:id/approve` | POST | `risk_approve` |
| `/equipment` | GET | `equip_view` |
| `/equipment` | POST | `equip_create` |
| `/equipment/:id` | PUT | `equip_edit` |
| `/equipment/:id/calibration` | POST | `equip_calibrate` |
| `/equipment/:id/approve` | POST | `equip_approve` |
| `/suppliers` | GET | `supp_view` |
| `/suppliers` | POST | `supp_create` |
| `/suppliers/:id/audit` | POST | `supp_audit` |
| `/suppliers/:id/approve` | POST | `supp_approve` |
| `/products` | GET | `prod_view` |
| `/products` | POST | `prod_create` |
| `/products/:id` | PUT | `prod_edit` |
| `/products/:id/approve` | POST | `prod_approve` |
| `/regulatory` | GET | `reg_view` |
| `/regulatory` | POST | `reg_create` |
| `/regulatory/:id` | PUT | `reg_edit` |
| `/regulatory/:id/approve` | POST | `reg_approve` |
| `/regulatory/export` | GET | `reg_export` |
| `/reports` | GET | `report_view` |
| `/reports` | POST | `report_create` |
| `/reports/export` | GET | `report_export` |
| `/audit-trail` | GET | `audit_view` |
| `/audit-trail/export` | GET | `audit_export` |
| `/settings/configuration` | GET | `settings_view` |
| `/settings/configuration` | PUT | `settings_edit` |
| `/settings/users` | GET | `user_view` |
| `/settings/users` | POST | `user_create` |
| `/settings/users/:id` | PUT | `user_edit` |
| `/settings/users/:id/reset-password` | POST | `user_reset` |
| `/settings/roles` | GET | `settings_view` |
| `/settings/roles` | POST | `role_manage` |
| `/settings/roles/:id` | PUT | `role_manage` |
| `/settings/roles/:id` | DELETE | `role_manage` |
| `/settings/permissions` | GET | `settings_view` |

---

## 27. Settings — Departments, Dictionaries & System

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/settings/departments` | Danh sách phòng ban |
| `POST` | `/settings/departments` | Tạo phòng ban |
| `PUT` | `/settings/departments/:id` | Cập nhật |
| `DELETE` | `/settings/departments/:id` | Xoá |
| `GET` | `/settings/dictionaries` | Danh mục hệ thống |
| `GET` | `/settings/dictionaries/:type` | Chi tiết danh mục (document-types / departments / storage-locations / retention-policies) |
| `POST` | `/settings/dictionaries/:type` | Thêm mục |
| `PUT` | `/settings/dictionaries/:type/:id` | Sửa mục |
| `DELETE` | `/settings/dictionaries/:type/:id` | Xoá mục |
| `GET` | `/settings/email-templates` | Danh sách email templates |
| `GET` | `/settings/email-templates/:id` | Chi tiết template |
| `POST` | `/settings/email-templates` | Tạo template mới |
| `PUT` | `/settings/email-templates/:id` | Cập nhật template |
| `DELETE` | `/settings/email-templates/:id` | Xoá template |
| `POST` | `/settings/email-templates/:id/test` | Gửi email test |
| `GET` | `/settings/email-templates/variables` | Danh sách biến khả dụng |
| `GET` | `/settings/configuration/general` | Cấu hình chung (company info, backup, locale, appearance) |
| `PUT` | `/settings/configuration/general` | Cập nhật |
| `GET` | `/settings/configuration/security` | Cấu hình bảo mật (password policy, session, 2FA, IP whitelist, audit) |
| `PUT` | `/settings/configuration/security` | Cập nhật |
| `GET` | `/settings/configuration/documents` | Cấu hình quản lý tài liệu (retention, watermark, e-sign, version control) |
| `PUT` | `/settings/configuration/documents` | Cập nhật |
| `GET` | `/settings/configuration/email` | Cấu hình SMTP |
| `PUT` | `/settings/configuration/email` | Cập nhật SMTP |
| `POST` | `/settings/configuration/email/test` | Kiểm tra SMTP |
| `POST` | `/settings/system/logo/upload` | Upload logo |
| `POST` | `/settings/system/backup` | Sao lưu ngay |
| `GET` | `/settings/system/backups` | Danh sách backup |
| `POST` | `/settings/system/backup/:id/restore` | Khôi phục backup |
| `GET` | `/settings/system/info` | Thông tin hệ thống (server, DB, storage, changelog) |

**Response: GET `/settings/configuration/general`**
```json
{
  "systemName": "EQMS",
  "systemDisplayName": "eQMS Platform",
  "adminEmail": "admin@pharma.com",
  "maintenanceMode": false,
  "companyInfo": {
    "companyName": "PharmaCo Ltd",
    "companyAddress": "123 Industrial Zone",
    "taxId": "0123456789",
    "industry": "Pharmaceutical",
    "regulatoryBody": "DAV (Drug Administration of Vietnam)"
  },
  "backupSettings": {
    "enableAutoBackup": true,
    "backupFrequency": "daily",
    "backupTime": "02:00",
    "retentionDays": 30,
    "backupLocation": "s3",
    "notifyOnBackupFailure": true
  },
  "locale": {
    "language": "vi",
    "numberFormat": "1.000,00",
    "currencyCode": "VND",
    "firstDayOfWeek": "monday"
  },
  "appearance": {
    "theme": "light",
    "primaryColor": "#10b981",
    "compactMode": false,
    "showBreadcrumbs": true,
    "sidebarDefaultCollapsed": false,
    "animationsEnabled": true
  }
}
```

**Response: GET `/settings/configuration/security`**
```json
{
  "passwordMinLength": 12,
  "requireSpecialChars": true,
  "requireNumbers": true,
  "requireUppercase": true,
  "passwordExpiryDays": 90,
  "sessionTimeoutMinutes": 60,
  "enable2FA": false,
  "enableAutoLogout": true,
  "autoLogoutMinutes": 30,
  "enableAccountLockout": true,
  "maxLoginAttempts": 5,
  "ipSecurity": {
    "enableIpWhitelisting": false,
    "whitelistedIps": [],
    "enableGeoBlocking": false,
    "blockedCountries": [],
    "allowVpnConnections": true
  },
  "auditSettings": {
    "enableDetailedAuditLog": true,
    "logLevel": "standard",
    "retainLogsForDays": 365,
    "enableRealTimeAlerts": true,
    "alertOnSuspiciousActivity": true
  }
}
```

**Response: GET `/settings/configuration/documents`**
```json
{
  "defaultRetentionPeriodDays": 2555,
  "enableWatermark": true,
  "allowDownload": true,
  "maxFileSizeMB": 50,
  "versionControl": {
    "enableAutoVersioning": true,
    "maxVersionsToKeep": 20,
    "requireVersionNotes": true,
    "majorMinorVersioning": true
  },
  "eSignature": {
    "enableESignature": true,
    "requirePasswordForSigning": true,
    "signingMethods": ["password", "otp"],
    "enforceSigningOrder": true,
    "signatureValidityDays": 365
  }
}
```

**EmailTemplate Response:**
```json
{
  "id": "uuid",
  "name": "Document Review Notification",
  "type": "document-review",
  "subject": "[EQMS] Document {{documentTitle}} requires your review",
  "content": "<p>Dear {{recipientName}},</p>...",
  "status": "Active",
  "variables": ["recipientName", "documentTitle", "documentId", "reviewDeadline", "reviewUrl"],
  "usageCount": 142,
  "createdBy": "admin",
  "createdDate": "2024-01-01T00:00:00Z"
}
```

---

## 28. Preferences (User)

> Lưu tùy chọn cá nhân của user đang đăng nhập. Tabs thực tế: `appearance`, `localization`, `notifications`, `security`.

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/preferences` | Toàn bộ preferences |
| `PUT` | `/preferences` | Lưu toàn bộ preferences |
| `GET` | `/preferences/appearance` | Cài đặt giao diện |
| `PUT` | `/preferences/appearance` | Cập nhật giao diện |
| `GET` | `/preferences/localization` | Ngôn ngữ & múi giờ |
| `PUT` | `/preferences/localization` | Cập nhật |
| `GET` | `/preferences/notifications` | Cài đặt thông báo |
| `PUT` | `/preferences/notifications` | Cập nhật cài đặt thông báo |
| `GET` | `/preferences/security` | Cài đặt bảo mật cá nhân |
| `PUT` | `/preferences/security` | Cập nhật |
| `POST` | `/preferences/security/mfa/enroll` | Khởi động đăng ký MFA (TOTP hoặc Email OTP) |
| `POST` | `/preferences/security/mfa/verify` | Xác nhận OTP để hoàn tất kích hoạt MFA |
| `DELETE` | `/preferences/security/mfa` | Xoá MFA (yêu cầu e-signature) |

**Response: GET `/preferences`**
```json
{
  "appearance": {
    "theme": "light"
  },
  "localization": {
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "dateFormat": "DD/MM/YYYY_HH:MM:SS",
    "timeFormat": "24h"
  },
  "notifications": {
    "channelEmail": true,
    "secondaryEmail": "",
    "channelInApp": true,
    "channelPush": false,
    "trainingReminderDays": 7,
    "signatureMode": "immediate",
    "sopDepartments": ["QA", "Production"]
  },
  "security": {
    "appMfaEnabled": false,
    "mfaMethod": null,
    "emailFallbackEnabled": false,
    "rememberDeviceEnabled": true
  }
}
```

> **appearance.theme** values: `light | dark | auto`  
> **localization.language** values: `vi | en`  
> **localization.dateFormat** values: `DD/MM/YYYY_HH:MM:SS | DD/MM/YYYY_HH:MM:SS_relative | DD/MM/YYYY_HH:MM_relative | DD/MM/YYYY_HH:MM | DD/MM/YYYY | relative_only`  
> **localization.timeFormat** values: `12h | 24h`  
> **notifications.trainingReminderDays** values: `3 | 7 | 15`  
> **notifications.signatureMode** values: `immediate | digest`  
> **notifications.sopDepartments** options: `QA | Production | R&D | Regulatory | Warehouse | Engineering | HR`

**POST `/preferences/security/mfa/enroll` — Request:**
```json
{
  "method": "totp"
}
```

**Response (TOTP):**
```json
{
  "method": "totp",
  "otpauthUrl": "otpauth://totp/EQMS:john.doe?secret=BASE32SECRET&issuer=EQMS",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "backupCodes": ["XXXXX-XXXXX", "YYYYY-YYYYY"]
}
```

**Request (Email OTP — gửi OTP xác nhận về email ngay):**
```json
{
  "method": "email_otp"
}
```

**Response (Email OTP):**
```json
{
  "method": "email_otp",
  "maskedEmail": "j***@pharma.com",
  "expiresInSeconds": 300
}
```

**POST `/preferences/security/mfa/verify` — Request:**
```json
{
  "method": "totp",
  "otp": "123456"
}
```

> Sau khi verify thành công, `security.appMfaEnabled = true` và `security.mfaMethod = "totp" | "email_otp"` được lưu.

---

## 29. Help & Support

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `POST` | `/support/tickets` | Gửi yêu cầu hỗ trợ |
| `GET` | `/support/tickets` | Danh sách tickets của user |
| `GET` | `/support/tickets/:id` | Chi tiết ticket |
| `GET` | `/support/faq` | Câu hỏi thường gặp |
| `GET` | `/support/user-manual` | Link/file hướng dẫn sử dụng |

**Request: POST `/support/tickets`**
```json
{
  "subject": "Unable to approve document - e-signature error",
  "priority": "High",
  "message": "When clicking Approve on SOP-QC-2026-001, I get error: 'Signature verification failed'",
  "attachments": ["base64-image-1", "base64-image-2"]
}
```

**Response:**
```json
{
  "ticketId": "SUP-2026-042",
  "status": "Received",
  "estimatedResponseTime": "4 hours",
  "message": "Your request has been received. Our support team will contact you shortly."
}
```

---

## 30. Shared APIs (Cross-module)

> Dùng chung cho **tất cả** modules. Module values: `deviations | capa | complaints | change-control | risks | equipment | supplier | regulatory | products | documents | revisions | training | tasks`

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/shared/:module/:entityId/comments` | Danh sách comments |
| `POST` | `/shared/:module/:entityId/comments` | Thêm comment (hỗ trợ @mention) |
| `PUT` | `/shared/:module/:entityId/comments/:commentId` | Sửa comment |
| `DELETE` | `/shared/:module/:entityId/comments/:commentId` | Xoá comment |
| `POST` | `/shared/:module/:entityId/comments/:commentId/react` | React (like/resolve) |
| `GET` | `/shared/:module/:entityId/attachments` | Danh sách file đính kèm |
| `POST` | `/shared/:module/:entityId/attachments` | Upload file |
| `POST` | `/shared/:module/:entityId/attachments/bulk-upload` | Upload nhiều file |
| `GET` | `/shared/:module/:entityId/attachments/:fileId/download` | Tải file |
| `DELETE` | `/shared/:module/:entityId/attachments/:fileId` | Xoá file |
| `POST` | `/shared/:module/:entityId/sign` | Ký điện tử (21 CFR Part 11) |
| `GET` | `/shared/:module/:entityId/signatures` | Danh sách chữ ký |
| `POST` | `/shared/verify-signature` | Xác minh tính toàn vẹn chữ ký |
| `GET` | `/shared/:module/:entityId/history` | Lịch sử thay đổi |
| `GET` | `/shared/:module/:entityId/status-history` | Lịch sử trạng thái |
| `GET` | `/shared/:module/:entityId/watchers` | Người theo dõi |
| `POST` | `/shared/:module/:entityId/watch` | Theo dõi |
| `DELETE` | `/shared/:module/:entityId/unwatch` | Bỏ theo dõi |
| `GET` | `/shared/:module/:entityId/links` | Liên kết với thực thể khác |
| `POST` | `/shared/:module/:entityId/links` | Thêm liên kết |
| `DELETE` | `/shared/:module/:entityId/links/:linkId` | Xoá liên kết |
| `POST/DELETE` | `/shared/:module/:entityId/tags` | Quản lý tags |
| `GET` | `/shared/mentionable-users` | Users có thể mention |

**Request: POST `.../sign`**
```json
{
  "username": "john.doe",
  "password": "MyP@ssword123!",
  "action": "Approve",
  "comment": "Reviewed and approved — compliant with EU GMP Annex 1",
  "meaning": "I hereby approve this document in accordance with company SOPs"
}
```

**Response E-Signature:**
```json
{
  "signatureId": "uuid",
  "signedAt": "2026-04-21T10:00:00Z",
  "signedBy": "John Doe",
  "signedByUserId": "uuid",
  "action": "Approve",
  "comment": "Reviewed and approved",
  "token": "short-lived-jwt-expires-5min",
  "hash": "sha256:abc123..."
}
```

**Request: POST `.../comments`**
```json
{
  "comment": "Please revise section 4.2 regarding temperature monitoring. CC: @jane.smith",
  "mentions": ["uuid-jane"],
  "isInternal": false
}
```

**Request: POST `.../links`**
```json
{
  "targetModule": "capa",
  "targetEntityId": "uuid-capa",
  "linkType": "related",
  "note": "CAPA initiated as result of this deviation"
}
```

---

## 31. File Upload / Download / Export

### 31.1 Upload Endpoints

| Method | Endpoint | Max Size | Accepted Formats | Mục đích |
|--------|----------|----------|-----------------|---------|
| `POST` | `/documents/:id/upload` | 50 MB | PDF, DOCX, XLSX, ODT | Upload nội dung tài liệu |
| `POST` | `/revisions/:id/upload` | 50 MB | PDF, DOCX, XLSX, ODT | Upload/thay file revision |
| `POST` | `/shared/:module/:entityId/attachments` | 50 MB | PDF, DOCX, XLSX, PNG, JPG | Upload file đính kèm chung |
| `POST` | `/shared/:module/:entityId/attachments/bulk-upload` | 50 MB/file | PDF, DOCX, XLSX, PNG, JPG | Upload nhiều file cùng lúc |
| `POST` | `/training/materials/upload` | 500 MB | MP4, PDF, PNG, JPG, DOCX | Upload file training material |
| `POST` | `/equipment/:id/attachments` | 50 MB | PDF, DOCX, XLSX, PNG, JPG | Tài liệu thiết bị |
| `POST` | `/suppliers/:id/certificates/gmp` | 50 MB | PDF | GMP Certificate |
| `POST` | `/suppliers/:id/certificates/gdp` | 50 MB | PDF | GDP Certificate |
| `POST` | `/suppliers/:id/quality-agreement` | 50 MB | PDF, DOCX | Quality Agreement |
| `POST` | `/regulatory/:id/dossier/upload` | 500 MB | PDF, ZIP | Hồ sơ dossier |
| `POST` | `/settings/users/:id/avatar` | 5 MB | PNG, JPG, WEBP | Avatar user |
| `POST` | `/settings/system/logo/upload` | 5 MB | PNG, SVG | Logo công ty |
| `POST` | `/files/temp` | 50 MB | — | Upload tạm cho batch revision (xem 31.5) |

### 31.2 Upload Request / Response

**Request (`multipart/form-data`):**
```
POST /documents/:id/upload
Content-Type: multipart/form-data

file:        <binary>
description: "Version with revised section 4.2"   (optional)
```

**Response `201 Created`:**
```json
{
  "fileId": "uuid",
  "filename": "SOP-QC-2026-001-v1.0.pdf",
  "fileSize": 1245184,
  "mimeType": "application/pdf",
  "hash": "sha256:abc123...",
  "uploadedBy": "uuid-user",
  "uploadedAt": "2026-04-21T10:30:00Z",
  "url": "/api/documents/uuid/download"
}
```

**Upload Progress** — client nhận qua `onUploadProgress` callback (Axios):
```
Content-Type: multipart/form-data
X-Upload-ID: temp-uuid   ← dùng để track progress polling nếu cần
```

**Lỗi upload:**
```json
// 413 Payload Too Large
{ "error": "FILE_TOO_LARGE", "maxSizeMB": 50, "message": "File exceeds 50 MB limit." }

// 415 Unsupported Media Type
{ "error": "INVALID_FILE_TYPE", "allowed": ["pdf","docx","xlsx"], "received": "exe" }

// 422 Unprocessable Entity (file corrupt / password-protected)
{ "error": "FILE_UNREADABLE", "message": "File is password-protected or corrupt." }
```

### 31.3 Download & Preview

| Method | Endpoint | Mục đích |
|--------|----------|---------|
| `GET` | `/documents/:id/download` | Tải file tài liệu (blob) |
| `GET` | `/documents/:id/preview` | Signed URL để inline viewer |
| `GET` | `/revisions/:id/download` | Tải file revision |
| `GET` | `/shared/:module/:entityId/attachments/:fileId/download` | Tải file đính kèm |
| `GET` | `/training/materials/:id/download` | Tải training material |
| `GET` | `/training/materials/:id/stream` | Stream video (range requests) |
| `GET` | `/training/records/:id/certificate` | Chứng chỉ hoàn thành (PDF) |

**Download Response Headers:**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="SOP-QC-2026-001-v1.0.pdf"
Content-Length: 1245184
X-File-Hash: sha256:abc123...
Cache-Control: no-store
```

**Preview Response** (`GET /documents/:id/preview`):
```json
{
  "previewUrl": "https://storage.example.com/preview/uuid?token=xxx&expires=1745241600",
  "expiresAt": "2026-04-21T11:00:00Z",
  "mimeType": "application/pdf",
  "pageCount": 12
}
```
> Preview URL là **signed URL** có hạn 30 phút, chỉ dùng để inline render (không download). Viewer nhúng trực tiếp URL này vào `<iframe>` hoặc PDF.js.

**Video Streaming** (`GET /training/materials/:id/stream`) — hỗ trợ HTTP Range:
```
Request:  Range: bytes=0-1048575
Response: 206 Partial Content
          Content-Range: bytes 0-1048575/52428800
          Content-Type: video/mp4
```

### 31.4 Export — Xuất Báo Cáo

Tất cả endpoint export trả về **blob trực tiếp** (synchronous) cho dataset nhỏ-vừa. Với dataset lớn (>10 000 dòng), dùng async job (xem 31.4.2).

#### 31.4.1 Export Endpoints

| Method | Endpoint | Format | Mục đích |
|--------|----------|--------|---------|
| `GET` | `/documents/export` | XLSX | Danh sách tài liệu |
| `GET` | `/documents/archived/export` | XLSX | Tài liệu lưu trữ |
| `GET` | `/deviations/export` | XLSX | Deviations |
| `GET` | `/capa/export` | XLSX | CAPAs |
| `GET` | `/complaints/export` | XLSX | Complaints |
| `GET` | `/change-control/export` | XLSX | Change controls |
| `GET` | `/equipment/export` | XLSX | Equipment |
| `GET` | `/risks/export` | XLSX | Risk registry |
| `GET` | `/risks/export/risk-matrix` | PNG/PDF | Ma trận rủi ro (hình ảnh) |
| `GET` | `/suppliers/export` | XLSX | Suppliers |
| `GET` | `/products/export` | XLSX | Products |
| `GET` | `/regulatory/export` | XLSX | Regulatory submissions |
| `GET` | `/training/export/records` | XLSX | Training records |
| `GET` | `/training/export/compliance` | XLSX | Compliance summary |
| `GET` | `/reports/:reportType/export` | XLSX | Report theo module |
| `GET` | `/reports/:reportType/export/pdf` | PDF | Report dạng PDF |
| `POST` | `/reports/custom` | XLSX | Custom report (stream) |
| `GET` | `/audit-trail/export` | XLSX | Audit trail |
| `GET` | `/audit-trail/export/pdf` | PDF | Audit trail dạng PDF |
| `GET` | `/audit-trail/:id/export/json` | JSON | Bản ghi đơn |
| `GET` | `/audit-trail/:id/export/pdf` | PDF | Bản ghi đơn dạng PDF |
| `GET` | `/settings/users/export` | XLSX | Danh sách users |

**Export Query Params chung:**
```
format=xlsx|pdf          (nếu endpoint hỗ trợ cả hai, mặc định xlsx)
dateFrom=2026-01-01
dateTo=2026-04-21
+ filter params đặc trưng của module
```

**Export Response Headers:**
```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="deviations-export-2026-04-21.xlsx"
Content-Length: 98304
X-Record-Count: 247
```

#### 31.4.2 Async Export (Dataset lớn)

Khi server nhận export request với ước tính >10 000 records:

```
// Bước 1 — Khởi tạo job
POST /exports
Body: { module: "audit-trail", format: "xlsx", filters: { dateFrom: "2025-01-01" } }

// Response 202 Accepted
{ "jobId": "export-uuid", "estimatedSeconds": 45, "statusUrl": "/exports/export-uuid" }

// Bước 2 — Poll trạng thái
GET /exports/:jobId
{ "jobId": "export-uuid", "status": "processing", "progress": 68, "totalRecords": 15420 }

// Bước 3 — Khi status = "completed"
{ "jobId": "export-uuid", "status": "completed", "downloadUrl": "/exports/export-uuid/download", "expiresAt": "2026-04-21T11:30:00Z" }

// Bước 4 — Tải file
GET /exports/:jobId/download → blob
```

**Job status values:** `queued | processing | completed | failed`

#### 31.4.3 Custom Report (POST /reports/custom)

```json
// Request
{
  "modules": ["deviations", "capa"],
  "fields": ["id", "title", "status", "severity", "department", "createdAt"],
  "filters": { "status": "Open", "department": "Quality Assurance" },
  "dateFrom": "2026-01-01",
  "dateTo": "2026-04-21"
}

// Response — stream XLSX blob trực tiếp
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="custom-report-2026-04-21.xlsx"
```

### 31.5 Temporary File Storage (Batch Revision Upload)

Dùng cho luồng **batch revision** — upload nhiều file trước, sau đó commit metadata:

```
// Bước 1 — Upload từng file lên temp storage
POST /files/temp
Body: FormData { file, documentId }

// Response 201
{ "tempFileId": "tmp-uuid", "documentId": "doc-uuid", "expiresAt": "2026-04-21T12:00:00Z" }

// Bước 2 — Commit batch (sau khi upload xong tất cả)
POST /revisions/batch
Body: {
  "revisions": [
    { "documentId": "doc-uuid-1", "tempFileId": "tmp-uuid-1", "changeDescription": "...", "revisionType": "Minor" },
    { "documentId": "doc-uuid-2", "tempFileId": "tmp-uuid-2", "changeDescription": "...", "revisionType": "Major" }
  ]
}
```

Temp files tự động xoá sau **2 giờ** nếu không được commit.

---

## 32. Chuẩn Pagination & Filters

### Query Params chuẩn (áp dụng cho TẤT CẢ endpoint GET danh sách)

| Param | Type | Default | Mô tả |
|-------|------|---------|------|
| `page` | integer | `1` | Trang hiện tại |
| `limit` | integer | `10` | Số bản ghi/trang (max: 100) |
| `sort` | string | `createdAt` | Trường để sort |
| `order` | `asc\|desc` | `desc` | Chiều sort |
| `search` | string | — | Tìm kiếm full-text |

### Filter params đặc trưng theo module

| Module | Filter Params đặc trưng |
|--------|------------------------|
| Documents | `status, type, owner, department, dateFrom, dateTo` |
| Deviations | `categoryFilter, severityFilter, statusFilter, department, assignedTo, dateFrom, dateTo` |
| CAPA | `typeFilter, sourceFilter, statusFilter, department, assignedTo, dateFrom, dateTo` |
| Complaints | `typeFilter, priorityFilter, statusFilter, sourceFilter, assignedTo, dateFrom, dateTo` |
| Change Control | `typeFilter, impactFilter, statusFilter, department, assignedTo, dateFrom, dateTo` |
| Equipment | `typeFilter, statusFilter, locationFilter, department, dateFrom, dateTo` |
| Supplier | `categoryFilter, statusFilter, riskFilter, countryFilter, dateFrom, dateTo` |
| Product | `typeFilter, statusFilter, dosageFormFilter, therapeuticArea, dateFrom, dateTo` |
| Training Courses | `status, type, category, departmentRequired` |
| Training Materials | `courseId, status, type` |
| Training Assignments | `userId, courseId, status, department, dateFrom, dateTo` |
| Regulatory | `typeFilter, authorityFilter, statusFilter, product, assignedTo, dateFrom, dateTo` |
| Risk | `categoryFilter, levelFilter, statusFilter, assessmentMethod, department, assignedTo, dateFrom, dateTo` |
| Audit Trail | `module, action, userId, severity, dateFrom, dateTo` |
| Notifications | `tab(all\|for-me\|system), status(unread\|read), type, priority, dateFrom, dateTo, search` |
| Users (Settings) | `role, status, businessUnit, department, dateFrom, dateTo` |
| My Tasks | `module, priority, status, assignee, reporter, dueDateFrom, dueDateTo` |

---

## 33. Common Response Shapes

```json
// ✅ Paginated List
{
  "data": [ ... ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "optional-cursor-token"
  }
}

// ✅ Single Resource
{
  "data": { ... },
  "message": "Success",
  "timestamp": "2026-04-21T10:00:00Z"
}

// ❌ Error
{
  "error": "Validation failed",
  "status": 422,
  "details": [
    { "field": "severity", "message": "Must be one of: Critical, Major, Minor" }
  ],
  "timestamp": "2026-04-21T10:00:00Z",
  "traceId": "uuid"
}

// 🖊️ E-Signature
{
  "signatureId": "uuid",
  "signedAt": "2026-04-21T10:00:00Z",
  "signedBy": "John Doe",
  "signedByUserId": "uuid",
  "token": "jwt-expires-5min",
  "hash": "sha256:abc123..."
}

// 📄 Stats/Count
{
  "total": 48,
  "breakdown": { "Open": 15, "Closed": 30, "Cancelled": 3 }
}
```

---

## 34. Enum Reference

### Document
| Enum | Values |
|------|--------|
| `DocumentStatus` | `Draft \| Active \| Pending Review \| Pending Approval \| Approved \| Pending Training \| Ready for Publishing \| Published \| Effective \| Archive \| Obsoleted \| Closed - Cancelled` |
| `DocumentType` | `SOP \| Policy \| Form \| Report \| Work Instruction \| Specification \| Protocol \| Validation Report \| Risk Assessment \| Training Material \| Batch Record \| Certificate \| Other` |
| `ReviewFlowType` | `sequential \| parallel` |
| `RevisionType` | `Major \| Minor` |
| `RetentionStatus` | `Active \| Expiring Soon \| Expired` |

### Training
| Enum | Values |
|------|--------|
| `CourseStatus` | `Draft \| Pending Review \| Pending Approval \| Effective \| Rejected \| Obsoleted` |
| `TrainingType` | `GMP \| Safety \| Technical \| Compliance \| SOP \| Software` |
| `TrainingMethod` | `Read & Understood \| Quiz (Paper-based/Manual) \| Hands-on/OJT` |
| `MaterialFileType` | `Video \| PDF \| Image \| Document` |
| `MaterialStatus` | `Draft \| Pending Review \| Pending Approval \| Effective \| Obsoleted` |
| `AssignmentStatus` | `Draft \| Active \| Completed \| PartiallyCompleted \| Cancelled \| Expired` |
| `AssigneeStatus` | `Assigned \| InProgress \| Completed \| Failed \| Overdue \| Waived` |
| `AssignmentScope` | `individual \| department \| business_unit` |
| `AssignmentTrigger` | `manual \| new_employee \| role_change \| doc_revision \| expiry_retraining \| recurrence \| capa_linked \| audit_finding \| process_change \| regulatory_update` |
| `AssignmentPriority` | `Critical \| High \| Medium \| Low` |

### Quality Events
| Enum | Values |
|------|--------|
| `DeviationSeverity` | `Critical \| Major \| Minor` |
| `DeviationCategory` | `Product Quality \| Process \| Equipment \| Material \| Documentation \| Personnel \| Environmental` |
| `DeviationStatus` | `Open \| Under Investigation \| Pending Review \| Pending Approval \| Closed \| Cancelled` |
| `CAPAType` | `Corrective \| Preventive \| Both` |
| `CAPASource` | `Deviation \| Audit Finding \| Customer Complaint \| Internal Review \| Risk Assessment \| Regulatory Inspection \| Self-Identified` |
| `CAPAStatus` | `Open \| Under Investigation \| Action Plan Pending \| Implementation \| Verification \| Effectiveness Check \| Closed \| Cancelled` |
| `ComplaintType` | `Product Quality \| Adverse Event \| Packaging \| Labeling \| Delivery \| Counterfeit Suspicion \| Stability` |
| `ComplaintPriority` | `Low \| Medium \| High \| Critical` |
| `ComplaintStatus` | `Received \| Under Investigation \| Pending Review \| Root Cause Identified \| CAPA Initiated \| Closed \| Rejected` |
| `ComplaintSource` | `Customer \| Healthcare Professional \| Patient \| Regulatory Authority \| Distributor \| Internal` |

### Operations
| Enum | Values |
|------|--------|
| `ChangeType` | `Process Change \| Equipment Change \| Material Change \| Specification Change \| Facility Change \| Cleaning Procedure \| Analytical Method` |
| `ChangeImpact` | `Low \| Medium \| High` |
| `ChangeStatus` | `Draft \| Submitted \| Impact Assessment \| Pending Approval \| Approved \| Implementation \| Verification \| Closed \| Rejected` |
| `EquipmentType` | `Manufacturing \| Laboratory \| Packaging \| Storage \| Utility \| HVAC \| Water System` |
| `EquipmentStatus` | `Active \| Under Maintenance \| Calibration Due \| Qualification Due \| Out of Service \| Retired \| Pending Installation` |
| `QualificationStatus` | `IQ Completed \| OQ Completed \| PQ Completed \| Fully Qualified \| Re-qualification Required \| Not Qualified` |
| `SupplierCategory` | `API Manufacturer \| Excipient Supplier \| Packaging Material \| Contract Manufacturer \| Laboratory Service \| Equipment Vendor \| Logistics Provider` |
| `SupplierStatus` | `Qualified \| Conditionally Approved \| Under Evaluation \| Audit Scheduled \| Suspended \| Disqualified \| New` |
| `SupplierRiskRating` | `Low \| Medium \| High \| Critical` |
| `ProductType` | `Drug Substance \| Drug Product \| Intermediate \| Finished Product \| Biological Product \| Medical Device` |
| `ProductStatus` | `Development \| Registered \| Commercially Available \| Under Variation \| Withdrawn \| Discontinued \| Recall` |
| `DosageForm` | `Tablet \| Capsule \| Injection \| Syrup \| Cream \| Ointment \| Suspension \| Powder \| Other` |

### Regulatory & Risk
| Enum | Values |
|------|--------|
| `SubmissionType` | `Marketing Authorization Application \| Type IA Variation \| Type IB Variation \| Type II Variation \| Renewal \| PSUR/PBRER \| GMP Certificate \| Annual Report` |
| `SubmissionStatus` | `Draft \| Submitted \| Under Review \| Questions Received \| Response Submitted \| Approved \| Refused \| Withdrawn` |
| `RegulatoryAuthority` | `EMA \| FDA \| MHRA \| BfArM \| ANSM \| AIFA \| AEMPS \| National Authority` |
| `RiskCategory` | `Quality \| Safety \| Regulatory \| Environmental \| Operational \| Supply Chain \| Data Integrity` |
| `RiskLevel` | `Very Low \| Low \| Medium \| High \| Very High` |
| `RiskStatus` | `Identified \| Under Assessment \| Mitigation Planned \| Mitigation In Progress \| Mitigated \| Accepted \| Closed \| Escalated` |
| `AssessmentMethod` | `FMEA \| HACCP \| FTA \| PHA \| Risk Matrix \| Other` |

### System
| Enum | Values |
|------|--------|
| `UserRole` | `SuperAdmin \| Admin \| QA \| QA Manager \| Manager \| Document Owner \| Reviewer \| Approver \| Viewer` |
| `UserStatus` | `Active \| Inactive \| Pending \| Suspended \| Terminated` |
| `EmploymentType` | `Full-time \| Part-time \| Contract \| Intern` |
| `RoleType` | `system \| custom` |
| `PermissionAction` | `view \| create \| edit \| delete \| approve \| archive \| export \| assign \| close \| review` |
| `AuditModule` | `Document \| Revision \| User \| Role \| CAPA \| Deviation \| Training \| Controlled Copy \| System \| Settings \| Report \| Task \| Notification` |
| `AuditAction` | `Create \| Update \| Delete \| Approve \| Reject \| Review \| Publish \| Archive \| Restore \| Login \| Logout \| Export \| Download \| Upload \| Assign \| Unassign \| Enable \| Disable` |
| `AuditSeverity` | `Low \| Medium \| High \| Critical` |
| `NotificationType` | `review-request \| approval \| capa-assignment \| training-completion \| document-update \| comment-reply \| deviation-assignment \| change-control \| system` |
| `NotificationStatus` | `unread \| read` |
| `NotificationPriority` | `low \| medium \| high \| critical` |
| `TaskModuleType` | `Document \| Deviation \| CAPA \| Training` |
| `TaskStatus` | `Pending \| In-Progress \| Reviewing \| Completed` |
| `TaskPriority` | `Critical \| High \| Medium \| Low` |
| `EmployeeStatus` | `active \| on-leave \| remote` |
| `DictionaryType` | `document-types \| departments \| storage-locations \| retention-policies` |
| `EmailTemplateType` | `password-reset \| user-welcome \| account-activation \| document-review \| document-approval \| training-notification \| audit-notification \| complaint-notification \| deviation-notification \| change-control-notification \| supplier-notification \| equipment-maintenance \| report-generation \| system-maintenance \| custom` |
| `EmailTemplateStatus` | `Active \| Inactive \| Draft` |
| `CellStatus` | `NotRequired \| Required \| InProgress \| Qualified` |
| `BusinessUnit` | `Operation Unit \| Quality Unit` |

---

## 35. Database Schema Hints

> Gợi ý các bảng chính cần tạo và quan hệ của chúng.

### Authentication & Users
```
users                → departments, roles
roles                ← (RBAC master)
permissions
role_permissions     → roles, permissions
user_sessions        → users
password_reset_tokens → users
mfa_configs          → users
```

### Document Control
```
documents            → users (author), departments
document_revisions   → documents
document_reviewers   → document_revisions, users
document_approvers   → document_revisions, users
controlled_copies    → documents, users, departments
archived_documents   → documents
```

### Training *(Course và Material TÁCH BIỆT)*
```
training_courses     → users (instructor), departments
                       status: Draft/Pending Review/Pending Approval/Effective/Obsoleted

training_materials   -> training_courses (FK: course_id)  ← QUAN HỆ CHÍNH
                       status: Draft/Pending Review/Pending Approval/Effective/Obsoleted
                       type: Video/PDF/Image/Document

training_material_versions -> training_materials

training_assignments  -> training_courses, users
                       status: Draft/Active/Completed/PartiallyCompleted/Cancelled/Expired
                       scope: individual/department/business_unit
                       trigger: manual/new_employee/role_change/doc_revision/...
training_assignees    -> training_assignments, users
                       status: Assigned/InProgress/Completed/Failed/Overdue/Waived
training_records      -> training_assignments, users, training_courses
ojt_records           -> users, training_courses
training_matrix       -> employees (rows), sop_columns (cols)
                       cell_status: NotRequired/Required/InProgress/Qualified
```

### Quality Events
```
deviations           → users, departments, products
capa                 → deviations, complaints, audit_findings
complaints           → users, products, capa
change_controls      → users, departments
```

### Operations
```
equipment            → departments, users
equipment_calibrations → equipment
equipment_maintenances → equipment
equipment_qualifications → equipment

suppliers            → users
supplier_audits      → suppliers
supplier_certificates → suppliers
supplier_materials   → suppliers

products             → users
product_batches      → products, users (QP)
product_specifications → products

regulatory_submissions → products, users
regulatory_dossier_files → regulatory_submissions
```

### Risk & Compliance
```
risks                → users, departments
risk_links           → risks (polymorphic)
```

### Cross-cutting
```
audit_trail          → users (append-only, indexed heavily)
notifications        → users
notification_preferences → users
attachments          → polymorphic (module + entity_id)
comments             → polymorphic (module + entity_id)
comment_mentions     → comments, users
e_signatures         → polymorphic (module + entity_id)
entity_links         → polymorphic (source/target module + entity_id)
entity_watchers      → polymorphic, users
entity_tags          → polymorphic
tasks                → users, polymorphic (related_module + related_entity_id)
```

### Settings & Preferences
```
departments          → departments (self-ref parent)
user_preferences     → users (1:1)
sidebar_favorites    → users (ordered list of nav_item_id)
saved_filters        → users
recent_searches      → users
email_templates
system_config        (single row)
password_policies    (single row)
dictionaries         → (type enum, items as rows)
backups
```

---

*Tổng cộng: **~150+ endpoints** | **19 modules** | Tuân thủ 21 CFR Part 11 / EU-GMP Annex 11 / ICH Q10*
