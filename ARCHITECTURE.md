# ARCHITECTURE.md — eQMS System Architecture

> **Purpose:** This document is the authoritative reference for the eQMS codebase architecture. Read this before implementing any new feature, route, or service. It describes the project from macro structure down to conventions for every layer.

---

## 1. Project Overview

**eQMS** (Enterprise Quality Management System) is a Single-Page Application (SPA) built for pharmaceutical and GxP-regulated environments. It supports EU-GMP, FDA 21 CFR Part 11, and ISO 9001 compliance workflows.

**Core capabilities:**
- Controlled Document lifecycle (drafting, review, approval, archiving)
- Training management and compliance matrix
- Quality events: CAPA, Deviations, Complaints, Change Control
- Risk Management and Regulatory tracking
- Supplier and Equipment qualification
- Audit trail, e-signature, and RBAC enforcement
- Real-time notifications, dashboards, and task management

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Language | TypeScript | 5.8.x |
| Build Tool | Vite | 6.x |
| Routing | React Router DOM | 7.x |
| Styling | Tailwind CSS (CDN) + Custom CSS | 3.x |
| Animation | Framer Motion | 12.x |
| HTTP Client | Axios | 1.x |
| Charts | Recharts | 3.x |
| Rich Text Editor | Lexical | 0.42.x |
| PDF Viewer | @react-pdf-viewer | 3.12.x |
| DOCX Preview | docx-preview | 0.3.x |
| Icons — Line | Lucide React | 0.562.x |
| Icons — Filled | @tabler/icons-react | 3.36.x |
| Icons — Huge | @hugeicons/react | 1.1.x |
| QR Code | qrcode.react | 4.x |
| PDF Export | jspdf + html2canvas | 4.x / 1.x |
| XSS Sanitizer | DOMPurify | 3.x |
| Utility | clsx + tailwind-merge + class-variance-authority | latest |

**Tailwind note:** Tailwind is loaded at runtime via CDN in `index.html`. It is **not** processed by PostCSS at build time. All custom design tokens live in `globals.css` as CSS custom properties.

---

## 3. Directory Structure

```
d:\eqms\
├── index.html                 # Entry HTML; loads Tailwind CDN + importmap
├── index.tsx                  # React root mount
├── vite.config.ts             # Vite config; path alias @/ → src/
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json          # PWA manifest
│   └── assets/icons/
├── scripts/
│   └── zip-dist.js            # postbuild: zips dist/ → dist.zip
└── src/
    ├── app/                   # App shell: routing, navigation config, constants
    │   ├── App.tsx            # Root: StrictMode > ErrorBoundary > ToastProvider > AppRoutes
    │   ├── AppRoutes.tsx      # Route tree, auth flow, lazy imports
    │   ├── routes.constants.ts# ROUTES object — all paths as typed constants
    │   ├── navigation.ts      # NAV_CONFIG — sidebar navigation tree
    │   ├── constants.ts       # Re-exports navigation helpers
    │   └── routes/            # Route group files (DocumentRoutes, TrainingRoutes, etc.)
    ├── assets/images/         # Logo, slide images
    ├── components/
    │   ├── ErrorBoundary.tsx
    │   ├── LogoIcon.tsx
    │   ├── layout/            # App shell layout components
    │   │   ├── main-layout/   # MainLayout.tsx — the root layout wrapper
    │   │   ├── header/        # Header.tsx, NotificationsDropdown, SearchDropdown
    │   │   ├── sidebar/       # Sidebar.tsx (collapsible, hover menus, favorites)
    │   │   ├── footer/        # Footer.tsx
    │   │   └── NetworkStatusMonitor.tsx
    │   └── ui/                # Reusable design-system components
    │       ├── button/        # Button.tsx
    │       ├── badge/         # Badge.tsx
    │       ├── breadcrumb/    # Breadcrumb.tsx + breadcrumbs.config.ts
    │       ├── card/          # ResponsiveCard.tsx, FilterCard.tsx
    │       ├── checkbox/
    │       ├── datetime-picker/
    │       ├── dropdown/
    │       ├── esign-modal/   # ESignatureModal.tsx
    │       ├── form/          # FormField, FormSection, ResponsiveForm, ReadOnlyField
    │       ├── loading/       # FullPageLoading, SectionLoading, ButtonLoading
    │       ├── modal/         # FormModal.tsx, AlertModal.tsx
    │       ├── page/          # PageHeader.tsx
    │       ├── popover/
    │       ├── radio/
    │       ├── scroll-to-top/
    │       ├── select/
    │       ├── stepper/
    │       ├── table/         # ResponsiveTable, TablePagination, TableEmptyState
    │       ├── tabs/          # TabNav.tsx
    │       └── toast/         # Toast.tsx + ToastProvider + useToast
    ├── config/
    │   ├── index.ts           # config object: api, auth, features, upload, pagination
    │   ├── responsive.ts      # Breakpoint constants
    │   └── security.ts        # Security configuration
    ├── contexts/
    │   ├── AuthContext.tsx    # Auth state, login/logout, token validation
    │   ├── ThemeContext.tsx
    │   ├── NotificationContext.tsx
    │   └── index.tsx          # Combined provider export
    ├── features/              # Domain modules (see Section 5)
    ├── hooks/                 # Global custom hooks (see Section 8)
    ├── lib/
    │   ├── axios.ts           # Axios re-export shim
    │   └── utils.ts
    ├── middleware/
    │   └── ProtectedRoute.tsx # Auth + RBAC route guard
    ├── mocks/                 # Shared mock data
    ├── services/api/          # All API service modules + axios client
    ├── styles/
    │   ├── globals.css        # Base styles, CSS tokens, skip-link, reduced-motion
    │   └── utilities.css      # GMP badge utilities, using CSS variables
    ├── types/
    │   ├── app.ts             # NavItem, BreadcrumbItem, AppState
    │   ├── documentTypes.ts
    │   └── index.ts           # Shared types re-export hub
    └── utils/
        ├── auditHelper.ts
        ├── fileIcons.ts
        ├── format.ts          # formatDateUS, formatDateNumeric, etc.
        ├── gmp.ts             # GMP-specific helpers
        ├── helpers.ts
        ├── security.ts        # sanitizeHtml, encryptData, secureStorage, tokenUtils
        ├── status.ts          # getStatusColorClass
        ├── validation.ts
        └── viewport.ts        # resetViewportZoom, isIOSSafari
```

---

## 4. Application Entry Flow

```
index.html
  └── importmap (React, React-DOM, React-Router)
  └── <script type="module" src="/index.tsx">
        └── App.tsx
              ├── React.StrictMode
              ├── ErrorBoundary
              ├── ToastProvider        ← global toast state
              └── AppRoutes
                    ├── BrowserRouter (wraps in index.tsx via react-router-dom)
                    └── Routes
                          ├── /login           → LoginView (eager)
                          ├── /login/2fa       → TwoFactorView (eager)
                          ├── /forgot-password → ForgotPasswordView (eager)
                          ├── /contact-admin   → ContactAdminView (eager)
                          └── / (ProtectedRoute)
                                └── MainLayout (Outlet)
                                      ├── Sidebar
                                      ├── Header
                                      ├── <main scroll container>
                                      │     └── <Suspense> → lazy-loaded feature views
                                      └── Footer
```

---

## 5. Feature Modules

Located in `src/features/`. Each module is self-contained.

### 5.1 Module Index

| Module | Path | Description |
|--------|------|-------------|
| `auth` | `/login`, `/login/2fa`, etc. | Login, 2FA, forgot-password, contact-admin |
| `dashboard` | `/dashboard` | KPI stats, charts, activity feed, deadlines |
| `my-tasks` | `/my-tasks` | Personal task inbox across all modules |
| `my-team` | `/my-team` | Team member overview |
| `notifications` | `/notifications` | Notification center |
| `documents` | `/documents/*` | Full document lifecycle (see 5.2) |
| `training` | `/training-management/*` | Courses, compliance matrix, my-training |
| `capa` | `/capa/*` | Corrective & Preventive Actions |
| `deviations` | `/deviations/*` | Quality event investigation |
| `complaints` | `/complaints/*` | Customer complaint management |
| `change-control` | `/change-control/*` | Change request workflow |
| `risk-management` | `/risk-management/*` | Risk register and assessment |
| `equipment` | `/equipment/*` | Equipment qualification |
| `supplier` | `/supplier/*` | Supplier management |
| `regulatory` | `/regulatory/*` | Regulatory submission tracking |
| `product` | `/product/*` | Product master data |
| `report` | `/report/*` | Cross-module reporting |
| `audit-trail` | `/audit-trail` | System-wide immutable audit log |
| `settings` | `/settings/*` | System configuration (see 5.3) |
| `preferences` | `/preferences` | User preferences |
| `help-support` | `/help-support` | Help documentation |
| `user-manual` | `/user-manual` | User manual viewer |

### 5.2 Documents Sub-modules

```
documents/
├── document-list/      → DocumentsView (All Documents + Owned By Me)
├── document-detail/    → DetailDocumentView (tabbed detail)
├── document-revisions/ → RevisionListView, PendingDocumentsView, detail-revision/, review-revision/, approval-revision/
├── controlled-copies/  → ControlledCopiesView
├── archived-documents/ → ArchivedDocumentsView
├── knowledge/          → KnowledgeBaseView
└── shared/             → Shared tabs, components, hooks used across document sub-views
```

### 5.3 Settings Sub-modules

```
settings/
├── user-management/    → UserManagementView, AddUserView, UserProfileView
├── role-permission/    → Role and permission matrix
├── dictionaries/       → System dictionaries (departments, positions, etc.)
├── configuration/      → System config
├── email-templates/    → Email template editor
└── system-information/ → Build info, license
```

### 5.4 Standard Module Structure

Every feature module follows this pattern:

```
feature-name/
├── index.ts            ← Named exports (ViewName, types, hooks)
├── FeatureView.tsx     ← Main list/overview view
├── types.ts            ← Module-specific TypeScript types
├── mockData.ts         ← Mock data (replace with API calls)
├── components/         ← Sub-components private to this feature
├── hooks/              ← Custom hooks for this feature only
├── tabs/               ← Tab content components (for detail views)
├── views/              ← Sub-views (detail, create, edit)
└── shared/             ← Shared between sub-views within this feature
```

---

## 6. Routing Architecture

### 6.1 Route Split

- **Public routes** — accessible without auth: `/login`, `/login/2fa`, `/forgot-password`, `/contact-admin`
- **Protected routes** — wrapped in `<ProtectedRoute>` → renders `<MainLayout>` with `<Outlet>`

### 6.2 Lazy Loading

All feature views are lazy-loaded using `React.lazy()` + `<Suspense fallback={<LoadingFallback />}>`. Route groups are split into files:

- `routes/DocumentRoutes.tsx`
- `routes/TrainingRoutes.tsx`
- `routes/QualityRoutes.tsx`
- `routes/SettingsRoutes.tsx`

### 6.3 Route Constants

All routes are defined as typed constants in `src/app/routes.constants.ts`:

```ts
ROUTES.DOCUMENTS.ALL              // '/documents/all'
ROUTES.DOCUMENTS.DETAIL(id)       // '/documents/:id'
ROUTES.TRAINING.COURSE_DETAIL(id) // '/training-management/courses/:id'
ROUTES.SETTINGS.USERS             // '/settings/users'
```

Always import from `ROUTES`, never hardcode path strings.

### 6.4 Navigation Config

The sidebar navigation tree is defined in `src/app/navigation.ts` as `NAV_CONFIG` — an array of `NavItem` objects with optional `children` for nested menus and `allowedRoles` for RBAC filtering.

```ts
interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon | TablerIcon;
  path?: string;           // leaf nodes have a path
  children?: NavItem[];   // parent nodes have children
  showDividerAfter?: boolean;
  allowedRoles?: UserRole[];
}
```

### 6.5 Complete Route Table

All routes in the application:

| Route | Module |
|-------|--------|
| `/login` | Public |
| `/login/2fa` | Public |
| `/forgot-password` | Public |
| `/contact-admin` | Public |
| `/dashboard` | Core |
| `/my-tasks` | Core |
| `/my-team` | Core |
| `/notifications` | Core |
| `/preferences` | Settings |
| `/profile` | Settings |
| `/help-support/manual` | Settings |
| `/help-support/contact` | Settings |
| `/documents/all` | Documents |
| `/documents/all/new` | Documents |
| `/documents/owned` | Documents |
| `/documents/:id` | Documents |
| `/documents/archived` | Documents |
| `/documents/knowledge` | Documents |
| `/documents/revisions/all` | Documents |
| `/documents/revisions/owned` | Documents |
| `/documents/revisions/pending-review` | Documents |
| `/documents/revisions/pending-approval` | Documents |
| `/documents/revisions/new` | Documents |
| `/documents/revisions/workspace` | Documents |
| `/documents/revisions/standalone` | Documents |
| `/documents/revisions/:id` | Documents |
| `/documents/controlled-copies/all` | Documents |
| `/documents/controlled-copies/ready` | Documents |
| `/documents/controlled-copies/distributed` | Documents |
| `/documents/controlled-copies/:id` | Documents |
| `/documents/controlled-copies/:id/destroy` | Documents |
| `/documents/controlled-copy/request` | Documents |
| `/deviations-ncs` | Quality |
| `/capa-management` | Quality |
| `/change-management` | Quality |
| `/complaints-management` | Quality |
| `/risk-management` | Quality |
| `/equipment-management` | Quality |
| `/supplier-management` | Quality |
| `/product-management` | Quality |
| `/regulatory-management` | Quality |
| `/report` | Quality |
| `/audit-trail` | Quality |
| `/training-management/my-training` | Training |
| `/training-management/materials` | Training |
| `/training-management/materials/upload` | Training |
| `/training-management/materials/:materialId` | Training |
| `/training-management/materials/:materialId/edit` | Training |
| `/training-management/materials/review/:materialId` | Training |
| `/training-management/materials/approval/:materialId` | Training |
| `/training-management/materials/new-revision/:materialId` | Training |
| `/training-management/materials/usage-report/:materialId` | Training |
| `/training-management/courses-list` | Training |
| `/training-management/courses/create` | Training |
| `/training-management/pending-review` | Training |
| `/training-management/pending-review/:courseId` | Training |
| `/training-management/pending-approval` | Training |
| `/training-management/pending-approval/:courseId` | Training |
| `/training-management/courses/:courseId` | Training |
| `/training-management/courses/:courseId/edit` | Training |
| `/training-management/courses/:courseId/progress` | Training |
| `/training-management/courses/:courseId/result-entry` | Training |
| `/training-management/training-matrix` | Training |
| `/training-management/course-status` | Training |
| `/training-management/assignments` | Training |
| `/training-management/assignments/new` | Training |
| `/training-management/assignment-rules` | Training |
| `/training-management/employee-training-files` | Training |
| `/training-management/employee-training-files/:id` | Training |
| `/training-management/export-records` | Training |
| `/settings/users` | Settings |
| `/settings/users/add` | Settings |
| `/settings/users/profile/:userId` | Settings |
| `/settings/roles` | Settings |
| `/settings/roles/new` | Settings |
| `/settings/roles/:id` | Settings |
| `/settings/roles/:id/edit` | Settings |
| `/settings/dictionaries` | Settings |
| `/settings/configuration` | Settings |
| `/settings/system-info` | Settings |
| `/settings/email-templates` | Settings |
| `/settings/email-templates/new` | Settings |
| `/settings/email-templates/edit/:id` | Settings |
| `/settings/email-templates/preview` | Settings |

### 6.6 RouteWrapper Pattern (Detail Routes)

Detail routes that receive an `:id` or `:courseId` parameter use a `RouteWrapper` component defined locally inside each route group file. It reads the param from `useParams`, guards against missing values, and passes `id` as a typed prop directly to the view — the view itself never calls `useParams`.

```tsx
// Defined inside routes/DocumentRoutes.tsx (pattern repeated in TrainingRoutes etc.)
const RouteWrapper: React.FC<{
  render: (id: string, navigate: NavigateFunction) => ReactElement;
}> = ({ render }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return render(id, navigate);
};

// Route definition:
<Route
  path=":id"
  element={
    <RouteWrapper
      render={(id, navigate) => (
        <Suspense fallback={<LoadingFallback />}>
          <DetailDocumentView id={id} onBack={() => navigate(-1)} />
        </Suspense>
      )}
    />
  }
/>
```

**Benefits:**
- Views receive `id` as a typed prop — no `useParams()` call needed inside the view
- Missing `:id` redirects to `/dashboard` cleanly
- `navigate(-1)` is wired as `onBack` automatically at the route level

---

## 7. Authentication & Security

### 7.1 Auth Flow

```
LoginView → (stage 1) store credentials in component state → navigate to TwoFactorView
TwoFactorView → (stage 2) call AuthContext.login() → navigate to /dashboard
```

### 7.2 Token Storage

- Tokens stored via `secureStorage` (XOR-encrypted base64 in `localStorage`) — defined in `src/utils/security.ts`
- On each page load: `AuthContext` reads + decrypts token, validates expiry via `tokenUtils.isTokenExpired()`
- Expired tokens are cleared and user is redirected to login

### 7.3 Axios Request Interceptor

`src/services/api/client.ts` injects `Authorization: Bearer <token>` on every request. On 401 response, clears storage and redirects to `/login`.

### 7.4 ProtectedRoute

`src/middleware/ProtectedRoute.tsx` — checks `isAuthenticated` from AuthContext. If false → `<Navigate to="/login">`. If `requiredRole` is provided, checks `user.role`. Shows `<FullPageLoading>` while auth state is loading.

### 7.5 RBAC

`usePermissions()` hook exposes:
- `hasPermission(permissionKey: string)` — checks `user.permissions[]`
- `can(action, module)` — semantic check (`can('approve', 'deviations')`)
- `SuperAdmin` role bypasses all checks

---

## 8. State Management

No global state library (no Redux, no Zustand). State is managed via:

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| Auth state | `AuthContext` (React Context) | Global |
| Theme | `ThemeContext` (React Context) | Global |
| Notifications | `NotificationContext` (React Context) | Global |
| Toast alerts | `ToastProvider` + `useToast()` hook | Global |
| Page-level state | `useState` + `useMemo` in feature views | Local |
| Filter/pagination | `useTableFilter<T>()` hook | Per-table |
| Navigation loading | `useNavigateWithLoading()` hook | Per-navigation |

---

## 9. API Service Layer

Located in `src/services/api/`.

### 9.1 Client

`client.ts` exports a configured Axios instance with:
- Base URL from `VITE_API_BASE_URL` env var (default: `http://localhost:5000/api`)
- 30s timeout
- Request interceptor: auth token injection, X-Correlation-ID header
- Response interceptor: error handling (401 → logout, 403 → forbidden, 500 → server error)

### 9.2 Service Files

Each domain has its own service file:

```
services/api/
├── client.ts         ← Axios instance
├── index.ts          ← Re-exports all services
├── auth.ts
├── documents.ts
├── training.ts
├── capa.ts
├── deviations.ts
├── complaints.ts
├── changeControl.ts
├── equipment.ts
├── supplier.ts
├── riskManagement.ts
├── regulatory.ts
├── settings.ts
├── tasks.ts
├── notifications.ts
├── auditTrail.ts
├── dashboard.ts
├── report.ts
├── product.ts
├── search.ts
├── metadata.ts
└── shared.ts
```

> **Current state:** Most service files return mock data. Hook them to the real API by replacing mock returns with `apiClient.get/post/put/delete()` calls.

---

## 10. Hooks Catalog

Located in `src/hooks/`.

| Hook | Purpose |
|------|---------|
| `useTableFilter<T>(data, options)` | Search + pagination for any table. Returns `filteredItems`, `paginatedItems`, `searchQuery`, `currentPage`, `totalPages`, `itemsPerPage` and their setters. |
| `useNavigateWithLoading()` | Shows `FullPageLoading` overlay for 600ms then navigates. Returns `{ navigateTo, isNavigating }`. |
| `usePermissions()` | RBAC checks. Returns `{ can, hasPermission, role, user }`. |
| `usePortalDropdown()` | Manages portal-rendered dropdowns. Returns `{ openId, position, getRef, toggle, close }`. |
| `useTableDragScroll()` | Horizontal drag-to-scroll tables. Returns `{ scrollerRef, isDragging, dragEvents }`. |
| `useAuth()` | Auth context consumer. Returns `{ user, isAuthenticated, login, logout, loading }`. |
| `useToast()` | Toast context consumer. Returns `{ showToast }`. |
| `useDebounce(value, delay)` | Debounce a value. |
| `usePagination(total, pageSize)` | Standalone pagination state. |
| `useLocalStorage(key, initial)` | Typed localStorage binding. |
| `useControlledState()` | Controlled/uncontrolled state bridge. |
| `useDataState()` | Async data loading state machine. |
| `useDropdownPosition()` | Calculate portal dropdown position from trigger rect. |
| `useIsInView()` | IntersectionObserver-based visibility check. |
| `useResponsiveSidebar()` | Sidebar collapse/mobile-open state. |

---

## 11. CSS Architecture

### 11.1 File Roles

| File | Role |
|------|------|
| `src/styles/globals.css` | Reset, base styles, CSS custom properties (tokens), iOS fixes, skip-link, reduced-motion |
| `src/styles/utilities.css` | GMP badge utilities, form input, validation status classes — all using CSS variables |
| Component classes | Tailwind utility classes inline in JSX |

### 11.2 CSS Custom Properties (Design Tokens)

Defined in `:root` in `globals.css`:

```css
--color-primary: #059669;         /* Emerald-600 */
--color-primary-dark: #047857;
--color-primary-light: #10b981;
--color-primary-rgb: 5, 150, 105;

--color-success: #10b981;
--color-warning: #f59e0b;
--color-error:   #ef4444;
--color-info:    #3b82f6;
--color-success-rgb: 16, 185, 129;
--color-warning-rgb: 245, 158, 11;
--color-error-rgb:   239, 68, 68;
--color-info-rgb:    59, 130, 246;

--z-sidebar: 40;
--z-header: 50;
--z-dropdown: 100;
--z-modal: 200;
--z-toast: 300;

--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 11.3 Accessibility CSS

- `@media (prefers-reduced-motion: reduce)` — collapses all animation/transition durations to `0.01ms !important`
- `.skip-link` — visually hidden skip navigation, revealed on `:focus`
- All interactive elements meet minimum `44px` touch targets on mobile

---

## 12. Build & Deployment

### 12.1 Scripts

```bash
npm run dev      # Vite dev server on localhost:3000
npm run build    # TypeScript check + Vite build → dist/
npm run preview  # Preview production build
# postbuild runs automatically: node scripts/zip-dist.js → dist.zip
```

### 12.2 Code Splitting

`vite.config.ts` defines `manualChunks`:

| Chunk | Contents |
|-------|---------|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-recharts` | recharts |
| `vendor-framer` | framer-motion |
| `vendor-pdf` | @react-pdf-viewer, pdfjs-dist |
| `vendor-docx` | docx-preview |
| `vendor-icons` | lucide-react, @tabler/icons-react |

Feature routes are further split via `React.lazy()`.

### 12.3 Environment Variables

```
VITE_API_BASE_URL       # API server URL
VITE_API_TIMEOUT        # Request timeout (ms)
VITE_AUTH_TOKEN_KEY     # localStorage key for token
VITE_SESSION_TIMEOUT    # Session duration (ms)
VITE_ENABLE_AUDIT_TRAIL # Feature flag
VITE_ENABLE_E_SIGNATURE # Feature flag
VITE_ENABLE_NOTIFICATIONS # Feature flag
VITE_MAX_FILE_SIZE      # Max upload size (bytes)
VITE_ALLOWED_FILE_TYPES # Comma-separated extensions
VITE_APP_NAME
VITE_APP_VERSION
VITE_ENCRYPTION_KEY     # Key for secureStorage XOR cipher
```

---

## 13. Layout System

### 13.1 App Shell

The app renders as a fixed-inset container (`fixed inset-0`) that never scrolls. Scrolling happens only in the main content container.

```
<div fixed inset-0 flex>            ← MainLayout root
  <NetworkStatusMonitor />          ← global banner
  <Sidebar />                       ← fixed width, collapsible
  <div flex flex-col flex-1>
    <Header />                      ← fixed top, 64px
    <div id="main-scroll-container" ← THE only scrollable element
         overflow-y-auto>
      <main>                        ← feature view renders here via <Outlet>
        ...
      </main>
      <Footer />
    </div>
  </div>
</div>
```

### 13.2 Sidebar States

- **Expanded** (desktop): 256px wide, shows label + icon
- **Collapsed** (desktop): 64px wide, icon only; hover triggers portal flyout menu
- **Mobile**: Off-canvas drawer via `AnimatePresence` slide-in; closes on navigation

### 13.3 Header Features

- Sidebar toggle button (left)
- Logo (mobile only)
- Sticky page title (h1 intersection observed; fades in when h1 scrolls out of view)
- Search dropdown (navigation search)
- Notifications bell dropdown
- User menu dropdown (Profile, Sign Out)

---

## 14. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `DocumentsView`, `TabNav` |
| Hooks | camelCase with `use` prefix | `useTableFilter` |
| Types/interfaces | PascalCase | `DocumentStatus`, `NavItem` |
| CSS classes | kebab-case | `.skip-link`, `.badge-primary` |
| Route constants | UPPER_SNAKE in `ROUTES.*` | `ROUTES.DOCUMENTS.ALL` |
| API service fns | camelCase | `documentsApi.getAll()` |
| Feature view files | PascalCase + `View` suffix | `UserManagementView.tsx` |
| Mock data files | camelCase | `mockData.ts` |
| Breadcrumb configs | camelCase factory fns | `breadcrumbs.coursesList(navigate)` |

---

## 15. Feature Flags

Controlled via environment variables in `src/config/index.ts`:

```ts
config.features.auditTrail       // VITE_ENABLE_AUDIT_TRAIL
config.features.eSignature       // VITE_ENABLE_E_SIGNATURE
config.features.notifications    // VITE_ENABLE_NOTIFICATIONS
```

---

## 16. Key Patterns to Follow

1. **Never hardcode route strings** — always use `ROUTES.*` constants.
2. **Never hardcode colors** — use CSS variables (`var(--color-primary)`) or Tailwind classes (`emerald-600`).
3. **Always lazy-load feature views** — wrap in `React.lazy()` + `<Suspense>`.
4. **Use `useNavigateWithLoading()`** instead of bare `useNavigate()` for page transitions.
5. **Use `useTableFilter<T>()`** for any searchable + paginated table.
6. **Use `usePortalDropdown()`** for any dropdown/context menu rendered via `createPortal`.
7. **Use `useTableDragScroll()`** for horizontally scrollable tables.
8. **All buttons** must have `type="button"` (or `type="submit"` only inside forms). The `Button` component defaults to `type="button"` automatically.
9. **API calls** go in `src/services/api/`. Views call service functions, not `apiClient` directly.
10. **Module types** defined in feature's own `types.ts`. Shared/cross-module types go in `src/types/`.
