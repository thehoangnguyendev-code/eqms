# 💎 eQMS UI/UX Standardization

This document defines the interface standards to ensure a premium, consistent, and responsive user experience across the eQMS application.

## 📐 Responsive Filter Grid Patterns

Standardized grid layouts for filter sections (search/dropdowns) ensure predictable behavior across devices. Use `FilterCard` and `FilterCard.Row` whenever possible.

### 1. High-Density Filters (6+ elements)
*Example: Course Inventory, Pending Reviews*
- **Desktop (lg)**: `lg:grid-cols-3` (3 elements per row, 3x2 grid)
- **Tablet (sm/md)**: `sm:grid-cols-2` (2 elements per row, 2x3 grid)
- **Mobile (xs)**: `grid-cols-1` (Stacked, 1 element per row)

### 2. Dictionary/Setting Filters (3-4 elements)
*Example: Departments, Document Types*
- **Desktop (lg)**: `lg:grid-cols-12` with `col-span-3` or `col-span-4`.
- **Tablet (sm/md)**: `sm:grid-cols-2` with `col-span-1` (2x2 grid).
- **Mobile (xs)**: `grid-cols-1` (Stacked).

### 3. Dashboard/Simplified Filters (2 elements)
*Example: My Transcript*
- **Desktop/Tablet**: `md:grid-cols-2` (Single row, 2 columns).
- **Mobile**: `grid-cols-1` (Stacked).

## 🏢 Typography & Sizing

### Consistency is Key
- **Titles**: Use `<h1>` with `text-lg md:text-xl lg:text-2xl font-bold text-slate-900`.
- **Page Header**: Always use the `PageHeader` component with breadcrumbs.
- **Labels**: `text-xs sm:text-sm font-medium text-slate-700`.
- **Placeholder Text**: `placeholder:text-slate-400`.

## 🎨 Design Tokens

### 1. Colors
- **Primary (Accent)**: `emerald-600` (#10b981) for success, active states, and focus.
- **Surface**: `slate-50` for table headers, `white` for cards.
- **Borders**: `slate-200` for all cards, panels, and table lines.
- **Text**: `slate-900` for primary content, `slate-600` for secondary.

### 2. Border Radius (3-Tier)
- **Large Container**: `rounded-xl` (16px) - Cards, Panes, Modals, Tables.
- **Medium Element**: `rounded-lg` (12px) - Buttons, Inputs, Dropdowns.
- **Pills**: `rounded-full` (Badge/Avatar).

## 📊 Table Standards

### Interaction
- **Sticky Actions**: Action columns should be `sticky right-0` with a proper `z-index` (e.g., `z-30`).
- **Interactive Rows**: Use `cursor-pointer hover:bg-slate-50/80 transition-colors`.
- **External Menus**: Use `createPortal` for action dropdowns to prevent overflow parent clipping.
- **Pagination**: Use `TablePagination` component consistently at the bottom-right of tables.

---
*For general coding patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
