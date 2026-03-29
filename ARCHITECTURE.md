# 🏗️ eQMS Architecture & Coding Standards

This document outlines the architectural patterns and coding standards used in the Electronic Quality Management System (eQMS) to ensure consistency and facilitate efficient development (both by humans and AI).

## 📂 Project Structure

The project follows a **Feature-Based Architecture** to keep logic isolated and scalable.

```
src/
├── app/          # Global configuration (Routes, Constants, Navigation)
├── components/   # Shared UI components (Atomic design: Button, Select, etc.)
├── contexts/     # Global state management (Auth, Theme, Notifications)
├── features/     # Isolated functional modules (Training, Documents, etc.)
├── hooks/        # Shared custom React hooks
├── services/     # API integration layer
├── styles/       # Global CSS and Tailwind configurations
├── types/        # Common TypeScript interfaces
└── utils/        # Generic helper functions
```

## 🛠️ Coding Standards

### React & TypeScript
- **Functional Components**: Use `const Component: React.FC<Props> = ...`
- **Naming**: PascalCase for components/files, camelCase for variables/functions.
- **Type Safety**: Strictly define interfaces for Props and Data. Avoid `any`.
- **Imports**: Use absolute path aliases (e.g., `@/components/ui/Button`).

### State Management
- **Local State**: Use `useState` for UI-only state (toggles, inputs).
- **Derived State**: Use `useMemo` for expensive calculations (filtering, statistics).
- **Global State**: Use Context API for session-long data (User Profile, Permissions).

### API Integration
- Centralize API calls in `src/services/api/`.
- Use the `apiClient` (Axios) for all requests.
- Return `response.data` for cleaner consumption.

## ⚙️ Feature Module Pattern

Every feature in `src/features/[module]` should follow this internal structure:

1. `index.ts`: Public API export (barrel file).
2. `[Feature]View.tsx`: Main page/dashboard for the feature.
3. `components/`: Feature-specific UI components.
4. `hooks/`: Custom hooks for feature-specific logic.
5. `types.ts`: Interface definitions for the feature.
6. `utils.ts`: Helper functions relevant only to this feature.
7. `README.md`: Module status and internal documentation.

## 💎 Design Consistency
- **Buttons**: Use `@/components/ui/button/Button`. Avoid raw `<button>` for primary actions.
- **Icons**: Use `Lucide React` and `Tabler Icons`.
- **Loading**: Use `isNavigating` from `useNavigateWithLoading` combined with `FullPageLoading`.

---
*For UI layout and responsive grid standards, see [UI_STANDARDS.md](./UI_STANDARDS.md).*
