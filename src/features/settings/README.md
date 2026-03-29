# ⚙️ Settings Module

The Settings module handles system configuration, dictionaries, and user management.

## 📁 Key Subdirectories
- **`dictionaries/`**: Management of system-wide lookup tables (Departments, Document Types, etc.).
- **`user-management/`**: Administration of system users and roles.
- **`user-profile/`**: Personal user preferences and settings.

## 💎 UI Standardization (Dictionaries)
All dictionary tabs (e.g., `DepartmentsTab.tsx`, `DocumentTypesTab.tsx`) follow a consistent layout:
- **Filter Bar**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-12`.
- **Responsive behavior**: 2x2 grid on Tablet, 1xN on Mobile.
- **Actions**: Portal-based `MoreVertical` dropdown for Edit/Delete/Toggle.
- **Pagination**: Uses `TablePagination` with a standard `itemsPerPage` of 10.

## ⚙️ Logic Patterns
- **Mock Data**: Uses `MOCK_[DICTIONARY_NAME]` from `../mockData.ts`.
- **Filtering**: Uses `useTableFilter` hook with custom boolean logic for Status and Date ranges.

---
*Refer to [UI_STANDARDS.md](../../../UI_STANDARDS.md) for grid and spacing specifications.*
