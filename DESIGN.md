# 🎨 eQMS Design System: Pharmaceutical Excellence

## 1. Visual Theme & Atmosphere

The eQMS interface is a high-precision, data-dense platform designed for the rigorous environment of pharmaceutical quality management. Unlike consumer apps, it prioritizes **analytical clarity** and **audit-readiness** over emotional browsing. The design operates on a clean `slate-50` (#f8fafc) foundation with **Emerald Green** (`#10b981`) serving as the primary indicator of compliance and success — a color synonymous with "Effective" and "Compliant" in GxP environments.

The typography uses **Inter** — a typeface designed for user interfaces at small sizes and high pixel density. The font logic is built on contrast: light weights are avoided in favor of 500 (Medium) for body text and 700 (Bold) to 800 (Extrabold) for data titles. This "heavy-header" approach ensures that even in complex forms, the structural hierarchy is immediately visible to an auditor's eye.

What distinguishes eQMS is its **State-Based Design**. Every record, badge, and card is visually tied to its regulatory status. We use a three-tier elevation system and high-density spacing (base 4px) to pack mission-critical information into a single viewport while maintaining a "Glassmorphism-lite" feel through subtle `border-slate-200` lines and soft `shadow-sm` elevations.

**Key Characteristics:**
- **Clean Slate Foundation**: `slate-50` (#f8fafc) background with white card surfaces.
- **Emerald Primary**: `#10b981` (Emerald-600) as the "Compliant" beacon.
- **High-Density Typography**: Inter font with bold weights (500–800) for structural clarity.
- **Regulatory Semantic System**: Color-coded status tokens (Emerald, Amber, Red).
- **Geometric Precision**: 12px to 16px border-radius; pill-shaped badges for metadata.
- **State Animation**: `ping` and `pulse` micro-animations for risk-based reporting.
- **Audit-Ready Density**: Row-based layouts designed for rapid side-by-side verification.

---

## 2. Color Palette & Roles

### Primary & Brand
- **Compliant Emerald** (`#10b981`): Primary brand color, success states, compliant records, primary CTAs.
- **Effective Green** (`#059669`): Hover/Active state for emerald, darker and more "final."
- **Deep Slate** (`#0f172a`): Secondary brand color, dark-mode nav, primary textual headers.

### Regulatory Semantics (Risk-Based)
- **Critical Red** (`#dc2626`): Obsolete records, training gaps, non-compliance alerts.
- **Warning Amber** (`#f59e0b`): Expiring documents, pending signatures, drafts.
- **Audit Blue** (`#3b82f6`): Guidance, systemic notes, info tooltips.

### Text Scale (Accessibility-First)
- **Onyx Slate** (`#0f172a`): Header titles, primary field values.
- **Content Slate** (`#475569`): Body text, labels, secondary descriptions.
- **Muted Slate** (`#94a3b8`): Timestamps, breadcrumb links, deactivated icons.

### Surface & Shadows
- **Base Surface** (`#ffffff`): Card background, modal background.
- **App Background** (`#f8fafc`): Global background, secondary panel background.
- **Standard Shadow**: `shadow-sm` (`rgba(0,0,0,0.05) 0px 1px 2px 0px`).
- **Elevation Shadow**: `shadow-md` (`rgba(0,0,0,0.1) 0px 4px 6px -1px`).

---

## 3. Typography Rules

### Font Family
- **Primary**: `Inter`, fallbacks: `system-ui, -apple-system, sans-serif`.
- **Systematic Font**: Monospace font (e.g., `JetBrains Mono`) specifically for Document IDs (e.g., SOP-QA-001).

### Hierarchy Matrix

| Role | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 24px (1.5rem) | 800 | 1.25 | -0.025em | Main dashboard/module header |
| **Section Title** | 16px (1.0rem) | 700 | 1.5 | -0.0125em | `FormSection` titles, card headers |
| **Field Value** | 14px (0.875rem)| 600 | 1.25 | tight | Primary data points in forms |
| **Field Label** | 14px (0.875rem)| 500 | 1.25 | normal | Input labels, descriptive text |
| **Metadata Tag**| 10px (0.625rem)| 800 | 1.0 | 0.1em (Wide) | Timestamps, uppercase tags |
| **Inline Detail**| 11px (0.687rem)| 500 | 1.25 | normal | Detail sub-text, footer counts |

---

## 4. Component Stylings

### Buttons
- **Primary**: `bg-emerald-600 text-white`, 12px default radius, `active:scale-[0.97]`.
- **Secondary (Outline-Emerald)**: `border-emerald-600 text-emerald-600`, white background. Used for "Export", "Back", "Secondary Actions."
- **Ghost/Link**: No background, `text-emerald-600`. Used for "View All", "History Logs."

### Cards & Container Patterns
- **Standard Card**: `bg-white rounded-xl border border-slate-200 shadow-sm`.
- **FormSection**: A group of fields with a 16px icon and bold title. Each row has a `border-b border-slate-100`.
- **Record Item**: 12px rounded, background color shifts (`bg-slate-50/50` to `bg-white`) on hover.

### Badges (Status Tokens)
- **StatusBadge**: High-visibility pill (`rounded-full`) with a `dot` indicator.
- **Small Badge**: `text-[10px] px-1.5 py-0.5 rounded-md` for metadata (e.g., Version, Year).

### Navigation
- **PageHeader**: White background, dynamic breadcrumbs, primary action slot on the right.
- **TabNav**: Clean underlying line, `emerald-600` active indicator, icon-text combination.

---

## 5. Layout Principles

### Spacing System
- Base unit: **4px**
- Common increments: 4, 8, 12, 16, 24, 32, 48, 64.
- Container padding: `p-6 md:p-8` for main surfaces; `p-4` for internal cards.

### Border Radius Scale
- `rounded-lg` (8px): Inputs, secondary buttons.
- `rounded-xl` (12px): Main cards, form containers, large buttons.
- `rounded-2xl` (16px): Large modals, dashboard tiles.
- `rounded-full` (9999px): Generic badges, avatars, dot indicators.

### Whitespace Philosophy
- **Standard Padding**: We avoid "airy" consumer spacing. Elements are packed efficiently (`gap-4` vs `gap-10`) to keep related data within the vertical fold.
- **Audit Density**: Rows should have a vertical padding of `py-3` to `py-4` max.

---

## 6. Depth & Elevation

| Level | Treatment | Use Case |
| :--- | :--- | :--- |
| **Level 0 (Flat)** | No shadow, just `border-slate-100` | Background, nested sections, table headers |
| **Level 1 (Card)** | `shadow-sm` (Light blur) | Standard information cards, filter panels |
| **Level 2 (Hover)** | `shadow-md` + `border-emerald-200` | Hovering over record list items |
| **Level 3 (Floating)**| `shadow-xl` / `shadow-overlay` | Modals (E-Signature), context menus |

---

## 7. Do's and Don'ts

### Do
- Use **Emerald-600** (`#10b981`) for anything related to successful compliance.
- Use **Inter Bold (700+)** for headers to ensure structure is visible during rapid audits.
- Keep border-radius at **12px–16px** for a modern, professional look.
- Use `StatusBadge` with a dot for critical statuses (Effective, Obsolete).
- Separate tab contents into their own files for maintainability.
- Use `active:scale-[0.97]` for custom interactive elements for "physical" feedback.

### Don't
- Don't use pure black (`#000000`) for text; always use **Slate-900**.
- Don't use light-weight fonts (< 400) for UI elements; they lack clarity in print/audit situations.
- Don't use "Round" corners for buttons; keep them `rounded-xl` for a more enterprise feel.
- Don't introduce non-standard colors unless they are part of a regulatory risk scale.
- Don't make layouts too sparse; e-QMS users expect efficiency and data density.

---

## 8. Responsive Behavior

- **Mobile (xs/sm)**: Views collapse to a single column. Buttons fill `w-full` if they are primary actions.
- **Tablet (md/lg)**: 2-column layouts for `FormSection` containers. Sidebar shifts to icon-only.
- **Desktop (xl/2xl)**: Max density. 3-4 column grids for lists; side-by-side verification panes.
- **Touch Targets**: Min 40px for interactive elements on mobile.

## 9. Standard Component Library (Reusable UI)

The following components from `@/components/ui` MUST be reused to maintain system integrity. Never rebuild these from scratch.

### 9.1 Core Components
- **`Button`**: Supports `default` (Emerald solid), `outline-emerald`, and `link` variants. Use `size="xs"` for record-level actions and `size="sm"` for headers.
- **`Badge`**: Primarily for metadata (Version, ID). Use `variant="soft"` for a professional, low-contrast look.
- **`StatusBadge`**: **Critical.** Use this for all regulatory states. It enforces the semantic color logic for `Effective`, `Obsolete`, and `Pending`.
- **`Card`**: The base container for data blocks. Always use with `shadow-sm` and `rounded-xl`.

### 9.2 Layout & Navigation
- **`PageHeader`**: Mandatory for every main view. Centralizes breadcrumbs and primary action buttons.
- **`FormSection`**: The primary grouping primitive. Ensures consistency in icons, titles, and row-based alignment.
- **`TabNav`**: Use this for content-switching within cards or dossiers. It manages active states and transition styles.
- **`Breadcrumbs`**: Logic for pathing; always provided via the `PageHeader`.

### 9.3 Specialized Modules
- **`ESignatureModal`**: The standard for 21 CFR Part 11 compliance. Use this whenever an "Action" (Approval, Verification) requires a legal signature.
- **`FullPageLoading`**: Use during async operations or page transitions to prevent a sense of "broken" state.
- **`Stepper`**: Use for workflow-based processes (e.g., Document Drafting -> Review -> Approval).

---

## 10. Document Management UI Patterns

The Document module (`src/features/documents`) introduces specialized patterns for sensitive life-cycle management.

### 10.1 Master Data Forms
- **Grid Layout**: Use `grid-cols-1 md:grid-cols-2` with a `gap-4`.
- **Labels**: Positioned **above** inputs using `text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block`.
- **Mandatory Fields**: Add a red asterisk `<span className="text-red-500 ml-1">*</span>` after the label.
- **Read-Only Fields**: Styled with `bg-slate-50 border-slate-200 cursor-default text-slate-700`.

### 10.2 Advanced Table Interactions
- **Sticky Actions**: The "Action" column MUST be `sticky right-0` with a visible left border divider: `before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200`.
- **Expandable Rows**: Support row nesting for related documents using `framer-motion` for smooth entry/exit.
- **State Mapping**: Use `mapDocumentStatusToStatusType` to ensure `StatusBadge` displays correct colors for regulatory states (Active, Draft, Approved).

---

## 11. AI Agent Generation Guide (Anti-Gravity)

When generating new features or components for eQMS:
- **Base Surface**: Always start with `bg-slate-50` for the page and `bg-white` for content containers.
- **Accent**: Use `emerald-600` for primary focus. If it's a "Destroy" or "Obsolete" action, shift to `red-600`.
- **Typography**: Header text should be `text-slate-900 font-bold`. Metadata is `text-[10px] uppercase font-bold text-slate-500`.
- **Forms**: For master data, use inputs with labels above. Mandatory fields must have red asterisks.
- **List Items**: Use the "Record Item" pattern: `p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all`.
- **Animation**: Content must have `animate-in fade-in duration-300`. Use `framer-motion` for layout shifts (e.g., expanded rows).
- **Compliance**: Always include `ESignatureModal` for actions that change a record's state from Draft to Effective.

---
*Last Updated: April 2026 | Project: Integrated Enterprise e-QMS (Vietnam)*
