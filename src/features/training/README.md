# 🎓 Training Module

The Training module provides comprehensive management for educational courses, employee compliance tracking, and automated certifications.

## 📂 Key Subdirectories
- **`compliance-tracking/`**: Contains the Training Matrix and Course Status views.
- **`course-inventory/`**: Lifecycle management for courses (Draft, Pending Review, Effective).
- **`my-training/`**: Specialized dashboard for the logged-in user to track their own tasks and transcript.

## 💎 UI Standardization (Training)
### Filter Grid Patterns:
- **Course List/Approval**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (3x2 Desktop, 2x3 Tablet).
- **My Training (Todo)**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (4x1 Desktop, 2x2 Tablet).
- **My Training (Transcript)**: `grid-cols-1 md:grid-cols-2` (2x1 for Tablet/Desktop).

### High-Performance Matrix:
- **`MatrixTable.tsx`**: Uses `React.memo` and `useMemo` to handle large datasets.
- **Navigation**: Triggered by `useNavigateWithLoading` to ensure smooth UI transition.

## ⚙️ Logic Patterns
- **Memoization**: Heavy use of `useMemo` for derived statistics (KPIs, bar chart data) and `React.memo` for table rows to minimize re-renders.
- **Status Mapping**: Centralized mapping for colors and icons to ensure UI consistency.

---
*Refer to [UI_STANDARDS.md](../../../UI_STANDARDS.md) for grid and spacing specifications.*
