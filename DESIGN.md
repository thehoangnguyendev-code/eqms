# DESIGN.md — eQMS UI Design System

> **Purpose:** This document defines how every UI element in the eQMS is designed. Read this before building any view, form, table, modal, or interactive component. Everything here reflects the actual patterns found in the codebase — not aspirational — so designs based on this will look native and consistent.

---

## 1. Design Language

### 1.1 Personality

- **Enterprise, not minimal** — clear hierarchy, structured layouts, information density
- **GxP-aware** — status and compliance states are first-class visual elements
- **Calm, not loud** — motion is purposeful (data loads, state changes), not decorative
- **Trust through clarity** — users see exactly where they are, what something means, and what they can do

### 1.2 Core Color System

All colors are defined as CSS custom properties in `globals.css`. Always use Tailwind classes or CSS variables — never hardcode hex values.

#### Brand / Primary

| Token | Value | Tailwind | Usage |
|-------|-------|---------|-------|
| `--color-primary` | `#059669` | `emerald-600` | Primary actions, active states, links |
| `--color-primary-dark` | `#047857` | `emerald-700` | Hover state on primary |
| `--color-primary-light` | `#10b981` | `emerald-500` | Accent, highlights |

#### Semantic Status Colors

| Token | Value | Tailwind | Usage |
|-------|-------|---------|-------|
| `--color-success` | `#10b981` | `emerald-500` | Approved, Active, Effective |
| `--color-warning` | `#f59e0b` | `amber-500` | Pending, In-Review, Caution |
| `--color-error` | `#ef4444` | `red-500` | Critical, Rejected, Error |
| `--color-info` | `#3b82f6` | `blue-500` | Informational |

#### Neutral Palette (Slate)

| Role | Tailwind | Usage |
|------|---------|-------|
| Page background | `bg-slate-50` | Body + main layout background |
| Card / Panel | `bg-white` | All cards, modals, dropdowns |
| Border | `border-slate-200` | Card and table borders |
| Text – primary | `text-slate-900` | Headings, body text |
| Text – secondary | `text-slate-600` | Descriptions, sub-labels |
| Text – muted | `text-slate-400` | Placeholders, disabled labels |
| Hover – subtle | `bg-slate-50` / `bg-slate-100` | Row hover, button hover |

### 1.3 Typography

All text uses **the system font stack** (`font-sans` → Inter, system-ui, etc.).

| Element | Class |
|---------|-------|
| Page title (h1) | `text-2xl font-bold text-slate-900` (responsive: `text-lg md:text-xl lg:text-2xl`) |
| Section heading (h2) | `text-lg font-semibold text-slate-900` |
| Card title | `text-base font-semibold text-slate-900` |
| Body text | `text-sm text-slate-600` |
| Table cell text | `text-sm text-slate-900` |
| Label | `text-sm font-medium text-slate-700` |
| Muted / hint | `text-xs text-slate-500` |
| Badge text | `text-[10px]` to `text-xs` |

### 1.4 Spacing & Layout

- **Base unit:** 4px (Tailwind default)
- **Card padding:** `p-4 md:p-6 lg:p-8` (responsive)
- **Section gaps:** `gap-4 md:gap-6` between cards and major sections
- **Page padding:** `p-4 md:p-6` applied inside the outer page container

### 1.5 Border Radius

| Element | Class |
|---------|-------|
| Cards, modals, panels | `rounded-xl` |
| Buttons, inputs | `rounded-lg` |
| Badges | `rounded-full` (pill) or `rounded-lg` |
| Avatar | `rounded-full` |
| Tags / small items | `rounded-md` |

### 1.6 Shadows

| Elevation | Class | Usage |
|-----------|-------|-------|
| Card (resting) | `shadow-sm` | Default cards, tables |
| Card (hover) | `shadow-md` | On hover with `hover:shadow-md` |
| Dropdown/Modal | `shadow-xl` | Portal-rendered elements |
| Button (default) | `shadow-sm` | Primary and outline buttons |

### 1.7 Transitions

All interactive elements use `transition-all duration-200` for snappy but smooth feedback. Hover scale: `hover:scale-[0.97]` on active press (via `active:scale-[0.97]`).

---

## 2. Animation Patterns

Animation is provided by **Framer Motion**. Keep motion purposeful — it should reinforce state changes, not distract.

### 2.1 List / Grid Entrance

Used on dashboard stats, table rows, and card grids:

```tsx
// Container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

// Each item
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
};

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>...</motion.div>
  ))}
</motion.div>
```

### 2.2 Modal Entrance

```tsx
// Backdrop
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2, ease: 'easeOut' }}

// Modal panel
initial={{ opacity: 0, scale: 0.95, y: 16 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 12 }}
transition={{ type: 'spring', damping: 25, stiffness: 300 }}
```

### 2.3 Sidebar / Drawer Slide

```tsx
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
```

### 2.4 Dropdown / Popover

```tsx
initial={{ opacity: 0, scale: 0.95, y: -4 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: -4 }}
transition={{ duration: 0.15, ease: 'easeOut' }}
```

### 2.5 Numeric Counter (KPI)

Use `framer-motion`'s `useMotionValue`, `useTransform`, and `animate` to count from 0 to the target KPI value on mount:

```tsx
const count = useMotionValue(0);
const rounded = useTransform(count, v => Math.round(v));
useEffect(() => {
  const controls = animate(count, targetValue, { duration: 1.5, ease: 'easeOut' });
  return controls.stop;
}, [targetValue]);
<motion.span>{rounded}</motion.span>
```

### 2.6 Tab Content Fade

```tsx
<div className="animate-in fade-in duration-200">
  {renderTabContent()}
</div>
```

### 2.7 Reduced Motion

`globals.css` sets `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important` when `prefers-reduced-motion: reduce` is active. No code changes required — the CSS layer handles it automatically.

---

## 3. The App Shell

The layout wraps every authenticated view. Understand it before building views.

```
fixed inset-0 bg-slate-50         ← full-viewport root (never scrolls)
├── <NetworkStatusMonitor>         ← sticky top warning if offline
├── <Sidebar>                      ← 256px expanded / 64px collapsed
└── flex flex-col flex-1
    ├── <Header>                   ← h-16 sticky, z-50
    └── <main scroll container>    ← flex-1 overflow-y-auto  ← only thing that scrolls
        └── <Outlet>               ← feature view renders here
        └── <Footer>
```

**Critical:** Never add `overflow` or `height` constraints to feature views that would conflict with the scroll container. Features render full height content naturally — the scroll container handles scrolling.

---

## 4. Page Layout Pattern

Every feature view follows the same outer structure:

```tsx
<div className="p-4 md:p-6">                              {/* ← page padding */}
  {isNavigating && <FullPageLoading text="Loading..." />}   {/* ← nav overlay */}

  <PageHeader
    title="All Documents"
    breadcrumbItems={breadcrumbs.documentList(navigate)}
    actions={
      <>
        <Button variant="outline" size="sm">Export</Button>
        <Button size="sm"><IconPlus /> New Document</Button>
      </>
    }
  />

  {/* Filter section */}
  <div className="mt-4 md:mt-6 flex flex-wrap gap-3">
    ...filter controls...
  </div>

  {/* Data table */}
  <div className="mt-4 md:mt-6">
    <ResponsiveTableContainer>
      <ResponsiveTableWrapper ref={scrollerRef} {...dragEvents}>
        <Table>
          <TableHeader>...</TableHeader>
          <TableBody>...</TableBody>
        </Table>
      </ResponsiveTableWrapper>

      {paginatedItems.length === 0 && <TableEmptyState />}

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
      />
    </ResponsiveTableContainer>
  </div>
</div>
```

### 4.1 PageHeader

```tsx
<PageHeader
  title="Page Title"                        // required — drives the h1 and sticky header title
  breadcrumbItems={breadcrumbs.xxx()}       // required
  actions={<>...</>}                        // optional — right-aligned buttons
  onBack={() => navigate(-1)}              // optional — renders back button left of title
/>
```

- The `<h1>` inside PageHeader is observed by MainLayout; when it scrolls out of view, the header shows its text
- Actions render right-aligned on `sm+` and left-aligned on mobile
- Breadcrumbs render below the title

---

## 5. Component Reference

### 5.1 Button

```tsx
<Button
  variant="default"        // default (emerald) | outline | outline-emerald | ghost | destructive | secondary | link
  size="sm"                // xs | sm | default | lg | xl | icon | icon-sm | icon-lg
  onClick={fn}
>
  Label
</Button>
```

**Variant guide:**

| Variant | Appearance | When to use |
|---------|-----------|-------------|
| `default` | Filled emerald | Primary actions (Save, Create, Submit) |
| `outline` | White + slate border | Secondary actions (Cancel, Back, Export) |
| `outline-emerald` | White + emerald border | Secondary action that should emphasize brand |
| `ghost` | Transparent, hover fill | Toolbar actions, icon buttons |
| `destructive` | Filled red | Irreversible actions (Delete, Terminate, Archive) |
| `secondary` | Filled slate-100 | Tertiary actions |
| `link` | Text-only emerald | Inline links |

**Size guide:**

| Size | Height | Typical use |
|------|--------|-------------|
| `xs` | 32px mobile / 28px desktop | Dense toolbar actions |
| `sm` | 36px | Most header action buttons |
| `default` | 40–44px | Form submit, modal footer |
| `lg` | 48–56px | Landing / auth page CTAs |
| `icon-sm` | 40×40px | Compact icon-only buttons |
| `icon` | 44×44px | Standard icon-only buttons |

**All buttons auto-default to `type="button"`. Only explicit `type="submit"` overrides this.**

### 5.2 Badge

```tsx
<Badge
  color="emerald"          // slate | emerald | amber | red | blue | purple | orange | cyan | sky | rose | indigo | teal | gray
  variant="soft"           // soft | outline | solid
  size="default"           // xs | sm | default | lg
  showDot={false}          // shows colored dot before label
  pill={true}              // rounded-full vs rounded-lg
>
  Approved
</Badge>
```

**Status-to-color mapping (use consistently):**

| Status | Badge Color |
|--------|------------|
| Approved / Active / Effective / Pass | `emerald` |
| Pending Approval / Pending Review / In-Review | `amber` |
| Draft / Open | `blue` |
| Rejected / Error / Critical / Failed | `red` |
| Obsolete / Archived / Closed | `slate` |
| Cancelled | `gray` |
| Training / Info | `purple` / `indigo` |

The `StatusBadge` named export (`from '@/components/ui'`) wraps `Badge` with pre-mapped GxP status types.

### 5.3 TabNav

Two variants:

**Underline (default)** — use inside a card container:
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <TabNav
    tabs={[
      { id: 'general', label: 'General Information', icon: InfoIcon },
      { id: 'audit',   label: 'Audit Trail', count: 12 },
    ]}
    activeTab={activeTab}
    onChange={setActiveTab}
  />
  <div className="animate-in fade-in duration-200">
    {renderTabContent()}
  </div>
</div>
```

**Pill** — standalone segmented control (e.g., All / Pending):
```tsx
<TabNav
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="pill"
/>
```

### 5.4 FormModal

```tsx
<FormModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleSave}
  title="Create New Document"
  description="Fill in all required fields below."
  confirmText="Save"
  cancelText="Cancel"
  size="xl"              // sm | md | lg | xl | 2xl
  isLoading={isSaving}
  confirmDisabled={!isFormValid}
>
  {/* form content in children */}
</FormModal>
```

**Size guide:**

| Size | Max-width | Usage |
|------|---------|-------|
| `sm` | 384px | Simple confirmation with 1–2 fields |
| `md` | 448px | Small forms (~3 fields) |
| `lg` | 512px | Medium forms |
| `xl` | 672px | Most create/edit forms |
| `2xl` | 768px | Complex forms or multi-column layouts |

### 5.5 AlertModal

Use for confirmations, warnings, and destructive action prompts:

```tsx
<AlertModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Document"
  description="This action cannot be undone. All related files will be permanently removed."
  type="error"             // success | error | warning | info | confirm
  confirmText="Delete"
  cancelText="Cancel"
  isLoading={isDeleting}
  showCancel={true}
/>
```

- Has keyboard focus trap and Escape-to-close
- Color-coded icon by `type`

### 5.6 ResponsiveTable

Always use the full component set — never build bare `<table>` elements:

```tsx
<ResponsiveTableContainer>
  <ResponsiveTableWrapper ref={scrollerRef} {...dragEvents}>
    <Table>
      <TableHeader>
        <tr>
          <TableCell isHeader>Document Code</TableCell>
          <TableCell isHeader>Title</TableCell>
          <TableCell isHeader align="center">Status</TableCell>
          <TableCell isHeader align="right">Actions</TableCell>
        </tr>
      </TableHeader>
      <TableBody>
        {paginatedItems.map(item => (
          <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
            <TableCell>{item.code}</TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell align="center">
              <StatusBadge type={item.status} />
            </TableCell>
            <TableCell align="right">
              <button ref={getRef(item.id)} onClick={() => toggle(item.id)} type="button">
                <MoreVertical />
              </button>
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  </ResponsiveTableWrapper>

  {paginatedItems.length === 0 && <TableEmptyState message="No documents found." />}
  
  <TablePagination
    currentPage={currentPage}
    totalPages={totalPages}
    itemsPerPage={itemsPerPage}
    totalItems={filteredItems.length}
    onPageChange={setCurrentPage}
    onPageSizeChange={setItemsPerPage}
  />
</ResponsiveTableContainer>
```

**Table design rules:**
- `TableHeader` background: `bg-slate-50`, sticky at top, `z-10`
- Row hover: `hover:bg-slate-50`
- Padding: `px-3 py-3 md:px-4 md:py-4 lg:px-6` (handled by `TableCell`)
- Enable drag scroll with `useTableDragScroll()` and spread `{...dragEvents}` on the wrapper

### 5.7 Card

```tsx
<Card padding="md" hover={false}>  {/* padding: none | sm | md | lg */}
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  ...content...
</Card>
```

Base: `bg-white rounded-xl border border-slate-200 shadow-sm`

### 5.8 FormField + Inputs

```tsx
<FormField label="Document Title" required error={errors.title} hint="Max 255 characters">
  <input
    type="text"
    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
  />
</FormField>
```

For select inputs, always use the `Select` component:
```tsx
<Select
  label="Status"
  value={statusFilter}
  onChange={setStatusFilter}
  options={statusOptions}
  enableSearch={true}
/>
```

For date ranges, use `DateRangePicker`. For single dates/times, use `DateTimePicker`.

### 5.9 Toast

```tsx
const { showToast } = useToast();

showToast({ type: 'success', title: 'Document Saved', message: 'The document was saved successfully.' });
showToast({ type: 'error',   message: 'An error occurred. Please try again.' });
showToast({ type: 'warning', message: 'Session will expire in 5 minutes.' });
```

Max 3 toasts visible simultaneously. Auto-dismiss after 3.5 seconds. Rendered top-right, stacked.

### 5.10 Loading States

| Component | When to use |
|-----------|------------|
| `<FullPageLoading text="Loading..." />` | Full app overlay (navigation transitions, initial auth check) |
| `<SectionLoading />` | While data is loading inside a card/section |
| `<ButtonLoading />` | Inside a button `children` while an async action is pending |
| `<InlineLoading />` | Small inline spinner (e.g., inside a dropdown while searching) |

For page navigation, use `useNavigateWithLoading()` which auto-shows `FullPageLoading` for 600ms.

### 5.11 FilterCard

Wrapper for the filter bar of every list/table view. Use `FilterCard` instead of a bare `div` — it provides consistent card styling and a 12-column responsive grid.

```tsx
import { FilterCard } from '@/components/ui';

<FilterCard>
  <FilterCard.Row>
    {/* Search — spans 5 of 12 xl-columns */}
    <FilterCard.Item span={5}>
      <input
        type="search"
        placeholder="Search by code or title..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </FilterCard.Item>

    {/* Status filter — spans 3 columns */}
    <FilterCard.Item span={3}>
      <Select label="Status" value={status} onChange={setStatus} options={statusOptions} />
    </FilterCard.Item>

    {/* Date range — spans 4 columns */}
    <FilterCard.Item span={4}>
      <DateRangePicker
        startDate={from} endDate={to}
        onStartDateChange={setFrom} onEndDateChange={setTo}
      />
    </FilterCard.Item>
  </FilterCard.Row>
</FilterCard>
```

**Layout rules:**
- `FilterCard` container: `bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm`
- `FilterCard.Row` grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-4 items-end`
- `FilterCard.Item span={N}` → `xl:col-span-N` where N is 1–12
- `FilterCard.Item mdSpan={N}` → `md:col-span-N` (1 or 2)
- Span values in a row should sum to 12 for full-width layout

### 5.12 FormSection

Standard animated card section used in all detail and form views. Groups related fields with a consistent header — icon, title, optional description, and an optional right-side slot.

```tsx
import { FormSection } from '@/components/ui';
import { FileText } from 'lucide-react';

<FormSection
  title="Identification"
  icon={<FileText className="h-4 w-4" />}
  description="Basic document information"
  headerRight={<Badge color="blue">Draft</Badge>}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
    <FormField label="Document Code" required>
      <input ... />
    </FormField>
    <FormField label="Title" required>
      <input ... />
    </FormField>
  </div>
</FormSection>
```

**Visual specs:**
- Container: `bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`
- Header: `bg-gradient-to-r from-white to-slate-50/50` with a bottom border
- Icon: `text-emerald-600`, 16px, renders left of title
- Title: `text-sm font-semibold text-slate-900 tracking-tight`
- Description: `text-xs text-slate-500` below the title
- `headerRight`: floated right in the header — use for status badge or contextual action button
- Entrance animation: `motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`

### 5.13 Breadcrumb

Configured via factory functions in `src/components/ui/breadcrumb/breadcrumbs.config.ts` and passed to `PageHeader.breadcrumbItems`.

**Rendering logic:**
- **First item**: always `IconLayoutGrid` (dashboard icon), clickable if `onClick` is provided
- **Middle items**: collapse to `"..."` on mobile (`hidden sm:inline`), show full label on `sm+`
- **Last item**: `text-slate-700 font-medium` — bold, no link
- Container: `flex items-center gap-1.5 text-slate-500 mt-1 text-xs whitespace-nowrap overflow-x-auto`
- Separator: `IconChevronRight` between each item

```tsx
// In PageHeader:
<PageHeader
  title="CAPA Detail"
  breadcrumbItems={[
    { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
    { label: 'CAPA Management', onClick: () => navigate(ROUTES.CAPA) },
    { label: 'CAPA-2024-001' },  // no onClick → renders as bold active item
  ]}
/>
```

### 5.14 Checkbox

Custom-styled checkbox using the `sr-only` native input + visual peer label pattern.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  id="rememberMe"
  checked={rememberMe}
  onChange={setRememberMe}
  label="Remember me for 30 days"
/>
```

**Visual specs:**
- Size: `w-5 h-5 rounded border-2`
- Unchecked: `bg-white border-slate-200 hover:border-emerald-400`
- Checked: `bg-emerald-600 border-emerald-600` with white `Check` icon (`stroke-[3]`)
- Focus: `peer-focus-visible:ring-1 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2`

### 5.15 Radio

Two variants: `default` (inline) and `card` (bordered selection panel).

```tsx
import { Radio, RadioGroup } from '@/components/ui';

// Standard inline radio
<Radio
  name="scope"
  value="department"
  checked={scope === 'department'}
  onChange={setScope}
  label="Department-wide"
  description="Applies to all users in your department"
/>

// Card variant — suited for mutually exclusive selections with descriptions
<Radio
  name="type"
  value="corrective"
  checked={type === 'corrective'}
  onChange={setType}
  label="Corrective Action"
  icon={<IconCheck className="h-4 w-4" />}
  variant="card"
/>

// RadioGroup shorthand (renders a group of default radios)
<RadioGroup
  label="Action Type"
  value={actionType}
  onChange={setActionType}
  options={[
    { label: 'Corrective', value: 'corrective' },
    { label: 'Preventive', value: 'preventive' },
  ]}
/>
```

**Card variant specs:**
- Checked: `border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20`
- Unchecked: `border-slate-200 bg-white hover:border-emerald-400`

### 5.16 Popover (Info Hint)

Use `Popover` to show contextual help text for a field without cluttering the layout.

```tsx
import { Popover } from '@/components/ui';

<FormField
  label={
    <span className="flex items-center gap-1">
      Document Code
      <Popover
        title="Document Code Format"
        content="Format: [DEPT]-[TYPE]-[YYYY]-[NNN]. Example: QA-SOP-2024-001"
        placement="top"
      />
    </span>
  }
>
  <input ... />
</FormField>
```

**Behavior:**
- Trigger: `Info` icon (`h-4 w-4 text-slate-400`) with pointer cursor
- Rendering: `createPortal` to `document.body`, positioned via `getBoundingClientRect()`
- `placement`: `'top'` | `'bottom'`
- Closes on outside click, scroll, or window resize

### 5.17 ActionDropdown

Preferred shorthand for table row action menus. Wraps `SmartDropdown` (portal, auto-flip) with a `MoreVertical` trigger button — no manual `usePortalDropdown()` needed.

```tsx
import { ActionDropdown } from '@/components/ui';
import { Eye, Edit, Trash } from 'lucide-react';

<ActionDropdown
  actions={[
    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => handleView(item.id) },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => handleEdit(item.id) },
    { type: 'divider' },
    {
      label: 'Delete',
      icon: <Trash className="h-4 w-4" />,
      onClick: () => handleDelete(item.id),
      destructive: true,
    },
  ]}
  size="default"   // sm | default | lg
/>
```

**Props:**
- `actions`: `ActionItem[]` where each item has `label`, `icon?`, `onClick`, `disabled?`, `destructive?`; or `{ type: 'divider' }` for a separator
- `size`: trigger button size (`sm` = 28×28px, `default` = 32×32px, `lg` = 36×36px)
- `triggerIcon`: custom icon (default: `MoreVertical`)
- `minWidth`: dropdown min-width in px (default: 180)
- `destructive: true` renders label and icon in `text-red-600`

> **Rule:** Use `ActionDropdown` for standard row menus. Fall back to `usePortalDropdown()` + `createPortal()` only when a custom dropdown layout is required.

### 5.18 DateTimePicker / DateRangePicker

**Single date:**
```tsx
import { DateTimePicker } from '@/components/ui';

<DateTimePicker
  label="Effective Date"
  value={effectiveDate}       // accepts dd/MM/yyyy or ISO strings
  onChange={setEffectiveDate} // returns dd/MM/yyyy string
  placeholder="Select date"
  disabled={false}
/>
```

**Date range:**
```tsx
import { DateRangePicker } from '@/components/ui';

<DateRangePicker
  label="Date Range"
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  includeTime={false}   // set true to get "dd/MM/yyyy HH:mm:ss" strings
/>
```

- Internal value format: `dd/MM/yyyy` (or `dd/MM/yyyy HH:mm:ss` when `includeTime` is true)
- Calendar is portal-rendered and auto-positions above/below the trigger
- Supports calendar → month → year drill-down navigation
- Multiple pickers on the same page use a `CustomEvent` to close each other

---

## 6. View Patterns

### 6.1 List View (Standard)

Used in: All Documents, CAPA, Deviations, Users, Courses, etc.

**Structure:**
```
<PageHeader title="..." breadcrumbItems={...} actions={<Button>New</Button>} />

[Filter Bar — horizontal flex with gap-3]
  ↳ Search input (flex-1 min-w-[200px])
  ↳ Status <Select> (w-40)
  ↳ Date range pickers
  ↳ Clear filters button (ghost, visible only when filters active)

[Stats ribbon — optional, 3–6 KPI cards in a grid row]

[<ResponsiveTableContainer>]
  ↳ Column header row
  ↳ Data rows with hover state
  ↳ Empty state if no results
  ↳ <TablePagination>
```

**Filter hooks:** Use `useTableFilter<T>()` with a `filterFn` for client-side filtering, or replace `filteredItems` with API-driven data for server-side.

### 6.2 Detail View (Tabbed)

Used in: Document Detail, Revision Detail, Course Detail, CAPA Detail, User Profile, etc.

**Structure:**
```
<PageHeader title={title} breadcrumbItems={...} onBack={handleBack}
  actions={<Button variant="outline" size="sm">Edit</Button>} />

[Summary card — key metadata in a 2–4 column grid]
  ↳ ID/code, Status badge, Owner, Created date, etc.

[Tab container — bg-white rounded-xl border]
  ↳ <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
  ↳ <div className="animate-in fade-in duration-200 p-4 md:p-6">
       {renderTabContent(activeTab)}
     </div>
```

**Standard tabs for GxP views:**

| Tab ID | Label | Contains |
|--------|-------|---------|
| `general` | General Information | Master data fields, document status, related items sub-tabs |
| `document` | Document | PDF/DOCX viewer |
| `training` | Training | Training requirements and records |
| `signatures` | Signatures | Electronic signature log |
| `audit` | Audit Trail | Immutable action history |

Sub-tabs within General Information use `TabNav variant="pill"`.

### 6.3 Create / Edit View (Multi-step or Single Form)

**Single form (simple entities):**
```tsx
<FormModal isOpen size="xl" title="New CAPA" onConfirm={handleSubmit}>
  <FormSection title="Identification">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="CAPA ID" required>...</FormField>
      <FormField label="Type" required>...</FormField>
    </div>
  </FormSection>
  <FormSection title="Description">
    <FormField label="Root Cause" required>
      <textarea .../>
    </FormField>
  </FormSection>
</FormModal>
```

**Multi-step (complex creation workflows):**
Use a stepper pattern:
```
[Step 1: Basic Information]
[Step 2: Classification]
[Step 3: Attachments]
[Step 4: Review & Submit]
```

Each step renders in the content area. Navigation uses Back/Next buttons with the stepper UI at the top.

### 6.4 Read-Only Detail Fields

For viewing (not editing) data records, wrap `ReadOnlyField` in a `FormField` for the label:

```tsx
// Text value — always wrap in FormField for the label
<FormField label="Document Code">
  <ReadOnlyField value={document.code} />
</FormField>

// Null/empty — shows placeholder (default: "—")
<FormField label="Owner">
  <ReadOnlyField value={document.owner ?? null} placeholder="Not assigned" />
</FormField>

// Status — use Badge directly (ReadOnlyField is text-only)
<FormField label="Status">
  <StatusBadge type={document.status} />
</FormField>
```

`ReadOnlyField` renders `h-9 bg-slate-50 border border-slate-200 rounded-lg px-3` — same height as an editable input so forms look consistent in both view and edit modes.

---

## 7. Context Menu / Row Actions

Every table row that has actions uses a portal-rendered dropdown via `usePortalDropdown()`:

```tsx
const { openId, position, getRef, toggle, close } = usePortalDropdown();

// In table row:
<button
  ref={getRef(item.id)}
  type="button"
  onClick={() => toggle(item.id)}
>
  <MoreVertical className="h-4 w-4" />
</button>

// Dropdown (rendered via createPortal):
{openId === item.id && createPortal(
  <AnimatePresence>
    <motion.div style={{ position: 'fixed', ...position }} className="...">
      <button onClick={() => { handleView(item.id); close(); }}>
        <Eye /> View Details
      </button>
      ...
    </motion.div>
  </AnimatePresence>,
  document.body
)}
```

Dropdown items follow: Icon (16px) + Label text, `px-3 py-2 hover:bg-slate-50 flex items-center gap-2` with `text-sm text-slate-700`.

> **Prefer `ActionDropdown` for standard row menus.** The manual `usePortalDropdown()` pattern above is for custom dropdown layouts. For typical View / Edit / Delete actions, use `<ActionDropdown actions={[...]} />` instead (see [5.17 ActionDropdown](#517-actiondropdown)).

---

## 8. Status System

Status badges appear throughout all GxP modules. Use `StatusBadge` from `@/components/ui` for predefined types, or `Badge` directly for custom labels.

### 8.1 Document Statuses

| Status | Color | Badge |
|--------|-------|-------|
| Draft | blue | `<Badge color="blue">Draft</Badge>` |
| Pending Review | amber | `<Badge color="amber">Pending Review</Badge>` |
| Pending Approval | amber | `<Badge color="amber">Pending Approval</Badge>` |
| Approved | emerald | `<Badge color="emerald">Approved</Badge>` |
| Effective | emerald | `<Badge color="emerald" showDot>Effective</Badge>` |
| Active | emerald | `<Badge color="emerald" showDot>Active</Badge>` |
| Obsolete | slate | `<Badge color="slate">Obsolete</Badge>` |
| Archived | slate | `<Badge color="slate">Archived</Badge>` |
| Closed - Cancelled | gray | `<Badge color="gray">Cancelled</Badge>` |

### 8.2 Task / Quality Event Statuses

| Status | Color |
|--------|-------|
| Open | blue |
| Under Investigation | amber |
| In-Progress | blue |
| Verification | purple |
| Effectiveness Check | indigo |
| Completed / Closed | emerald |
| Cancelled | gray |
| Critical / Rejected | red |

### 8.3 User Statuses

| Status | Color |
|--------|-------|
| Active | emerald |
| Suspended | amber |
| Terminated | red |
| Pending | blue |

---

## 9. Icon Conventions

Two icon libraries are used. Choose based on context:

| Library | Import | Use for |
|---------|--------|---------|
| **Lucide React** | `import { FileText } from 'lucide-react'` | Navigation, generic actions (Search, Download, Settings, ChevronRight, etc.) |
| **Tabler Icons** | `import { IconPlus } from '@tabler/icons-react'` | Module-specific icons, GxP actions (CAPA, Training, Deviations, Alerts) |
| **Huge Icons** | `import { SomeIcon } from '@hugeicons/react'` | Decorative / large hero icons |

**Sizing convention:**

| Context | Class | Size |
|---------|-------|------|
| Navigation sidebar | `h-5 w-5` | 20px |
| Table action button | `h-4 w-4` | 16px |
| Page header actions | `h-4 w-4` | 16px |
| Stat card icons | `h-6 w-6` | 24px |
| Empty state | `h-12 w-12 text-slate-300` | 48px |
| Alert modal icon | `h-8 w-8` | 32px |

---

## 10. Dashboard View Pattern

The dashboard follows a specific visual pattern:

```
[Welcome greeting — "Good morning, {name}"]

[KPI Cards row — 6 cards in responsive grid]
  Each card: white, rounded-xl, shadow-sm
  ↳ Icon (colored bg circle with semantic color)
  ↳ Animated count (framer-motion Counter)
  ↳ Trend badge (↑/↓ with color)
  ↳ Label

[Two-column row (on desktop)]
  ↳ Left: Bar chart (Recharts, emerald bars, monthly data)
  ↳ Right: Recent Activity feed (icon + text + timestamp)

[Two-column row]
  ↳ Left: Upcoming deadlines (priority-colored left border)
  ↳ Right: Quick actions (4 action cards with colored icons)
```

**KPI card color coding:**

| Metric type | Icon color | Background |
|-------------|-----------|-----------|
| Documents | `text-emerald-600` | `bg-emerald-50` |
| Risks / Deviations | `text-amber-600` | `bg-amber-50` |
| Tasks | `text-blue-600` | `bg-blue-50` |
| Compliance | `text-purple-600` | `bg-purple-50` |

---

## 11. Form Input Styling

All form inputs should follow this consistent styling:

```tsx
// Text input
<input
  type="text"
  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500
             focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400
             disabled:cursor-not-allowed transition-colors"
/>

// Textarea
<textarea
  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900
             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500
             focus:border-emerald-500 resize-none transition-colors"
  rows={4}
/>
```

Focus ring is always `ring-emerald-500`. Error state adds `border-red-500 ring-red-500`.

Font-size must be `16px` on mobile (enforced by globals.css) to prevent iOS auto-zoom.

---

## 12. Responsive Design

### 12.1 Breakpoints (Tailwind defaults)

| Prefix | Min-width | Target |
|--------|---------|--------|
| (none) | 0 | Mobile (360–767px) |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet (iPad) |
| `lg:` | 1024px | Desktop (laptop) |
| `xl:` | 1280px | Wide desktop |

### 12.2 Touch Targets

All interactive elements meet **44×44px minimum** on mobile:
- Button `sm` height is `h-9` (36px) on desktop but scales up to `h-9` on mobile
- Use `.touch-target` class for elements that need explicit min sizing
- Bottom navigation and sidebar items are always ≥ 44px tall on mobile

### 12.3 Table Responsiveness

Tables never collapse to cards — they use `overflow-x-auto` with drag-scroll. Column widths are explicit to enable horizontal scroll comfortably.

### 12.4 Filter Layouts

Filters on desktop display horizontally in a `flex flex-wrap gap-3`. On mobile they stack naturally. Always assign `min-w` to ensure inputs don't get too thin.

### 12.5 Grid Patterns

| Content | Mobile | Desktop |
|---------|--------|---------|
| KPI stats row | `grid-cols-2` | `grid-cols-3 lg:grid-cols-6` |
| Form fields | `grid-cols-1` | `grid-cols-2 lg:grid-cols-3` |
| Summary metadata | `grid-cols-1 sm:grid-cols-2` | `lg:grid-cols-4` |
| Card grid | `grid-cols-1` | `md:grid-cols-2 lg:grid-cols-3` |

---

## 13. Sidebar Navigation Design

### 13.1 Expanded State

- Width: 256px
- Logo: full logo with text
- Nav items: icon (left, 20px) + label + optional chevron (for parent nodes)
- Active item: `bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600`
- Hover: `hover:bg-slate-100`
- Parent nodes expanded: animated `ChevronRight` rotates to `ChevronDown`
- Children indent: `BASE_PADDING + depth * LEVEL_PADDING` (12px base + 16px per level)

### 13.2 Collapsed State (Desktop)

- Width: 64px, icons only
- Hovering a parent item opens a portal flyout menu at the item's position
- Active item: icon with emerald background dot

### 13.3 Mobile Drawer

- Off-canvas, full-height from left, overlays content
- Backdrop `bg-slate-900/50` with `backdrop-blur-sm`
- Closes on item navigation or backdrop tap

### 13.4 Favorites Tab

- Users can star any nav item
- Tab toggles between "All Items" and "Favorites" at top of sidebar
- Stars use `IconStar` (Tabler) — filled amber when favorited

---

## 14. E-Signature Modal

Used wherever GxP requires an electronic signature (approval, rejection, release, destruction):

```tsx
// Custom action with a change-log
<ESignatureModal
  isOpen={isSignModalOpen}
  onClose={handleClose}
  onConfirm={(reason) => handleApprove(reason)}
  actionTitle="Approve Document"
  changes={[
    { action: "Update Status", oldValue: "Pending Approval", newValue: "Approved", category: "status" }
  ]}
  documentDetails={{ code: doc.code, title: doc.title, revision: doc.revision }}
/>

// Using a built-in transaction preset
<ESignatureModal
  isOpen={isSignModalOpen}
  onClose={handleClose}
  onConfirm={(reason) => handleDistribute(reason)}
  transactionType="distribute"
  documentDetails={{ code: doc.code, title: doc.title }}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called on cancel or backdrop click |
| `onConfirm` | `(reason: string) => void` | Called with the justification text the user typed |
| `actionTitle` | `string?` | Modal header title (e.g. "Approve Document") |
| `changes` | `ChangeItem[]?` | List of old→new changes to display inside the modal |
| `documentDetails` | `{ code?, title?, revision? }?` | Context shown in the modal header |
| `transactionType` | `'distribute' \| 'cancel-distribution'?` | Built-in preset — overrides `actionTitle`/`changes` |

- The modal collects a **justification/reason** text from the user (not a password re-entry)
- `onConfirm` receives the typed reason string
- Use `transactionType` for the two built-in presets; otherwise supply `actionTitle` + `changes` manually

---

## 15. Audit Trail Tab

Every GxP module detail view includes an Audit Trail tab showing an immutable log:

- Table columns: Timestamp | Action | User | Details
- Rows are read-only — no edit/delete controls
- Timestamps use `formatDateUS()` from `utils/format.ts`
- Actions displayed as description strings (e.g., "Document status changed to Approved")

---

## 16. Empty States

Use `TableEmptyState` for tables with no data:

```tsx
import { TableEmptyState } from '@/components/ui';
import { FileX } from 'lucide-react';

<TableEmptyState
  icon={<FileX className="h-8 w-8 text-slate-300" />}  // optional React element
  title="No Documents Found"                            // optional, default: "No Results Found"
  description="Try adjusting your filters."            // optional
  actionLabel="Clear Filters"                           // optional — shows button when onAction is set
  onAction={handleClearFilters}                         // optional callback
/>
```

- Container: `flex flex-col items-center justify-center py-8 sm:py-12 bg-white text-center`
- Icon sits in a `h-14 w-14 bg-slate-50 rounded-full` circle
- Default icon when none provided: `Search` from lucide-react
- Clear button uses outline style and transitions to `bg-red-600 text-white border-red-600` on hover

---

## 17. Network Status Monitor

`NetworkStatusMonitor` renders a full-width banner at the very top of the viewport when offline:

```
⚠  You are currently offline. Some features may be unavailable.
```

- Background: `bg-amber-50 border-b border-amber-200`
- Text: `text-amber-800 text-sm font-medium`
- Slides down via Framer Motion when offline, slides up when reconnected

---

## 18. Scrollbar Styling

The main scroll container and all scrollable areas use custom thin scrollbars:

```
scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400
scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full
```

On mobile, scrollbars are hidden for cleaner look via `.custom-scrollbar` utility.

---

## 19. Quick-Reference Checklist for New Views

When building a new feature view, verify:

- [ ] Uses `<PageHeader>` with title, breadcrumbs, and action buttons
- [ ] Imports `ROUTES.*` for all navigation (no hardcoded strings)
- [ ] Uses `useNavigateWithLoading()` for transitions
- [ ] Table uses `ResponsiveTableContainer` + `useTableFilter()` + `useTableDragScroll()`
- [ ] Row actions use `ActionDropdown` (preferred) or `usePortalDropdown()` + `createPortal()` for custom layouts
- [ ] Status labels use `Badge` or `StatusBadge` from `@/components/ui`
- [ ] All buttons are `<Button type="button">` (or native `<button type="button">`)
- [ ] Modals use `FormModal` (forms) or `AlertModal` (confirmations)
- [ ] Toast notifications call `showToast()` from `useToast()`
- [ ] E-signature actions use `<ESignatureModal>`
- [ ] Color values use Tailwind classes or CSS variables — no hardcoded hex
- [ ] Mobile touch targets ≥ 44px on interactive elements
- [ ] `isNavigating && <FullPageLoading />` rendered when navigating away
- [ ] Form fields use `FormField` wrapper with `label`, `required`, `error`
- [ ] Filter bar uses `FilterCard` + `FilterCard.Row` + `FilterCard.Item`
- [ ] Form sections use `FormSection` with `title` and optional `icon`
- [ ] Read-only fields use `ReadOnlyField` inside `FormField` (no `label` prop on ReadOnlyField)

---

## 20. Auth Page Design

The auth pages (Login, 2FA, Forgot Password) use a split-screen layout distinct from the main app shell.

### 20.1 Layout Structure

```
<div min-h-screen bg-gradient-to-br from-slate-100 to-slate-200>
  <div max-w-screen-xl mx-auto flex>
    ├── Left panel (form)     — always visible, w-full lg:w-1/2 xl:w-2/5
    └── Right panel (branding) — hidden on mobile, hidden lg:flex lg:w-1/2 xl:w-3/5
```

**Left panel** — white card, centered form:
- Logo: full app logo image, centered
- Title: `text-2xl font-bold text-slate-900`
- Fields: username/email input + password input with eye-toggle show/hide button
- Remember Me: `Checkbox` component
- CTA: `<Button variant="default">` full-width, shows `<ButtonLoading>` on submit
- Links: Forgot Password, Contact Admin — `text-sm text-emerald-600 hover:text-emerald-700`
- Inline validation: error messages below fields on blur

### 20.2 Branding Carousel (`AuthBranding`)

The right panel is a full-height dark card (`bg-slate-900 rounded-[1.2rem]`):

```
┌─────────────────────────────────────┐
│  [Slide image carousel — fills bg]  │  ← AnimatePresence, scale+fade 0.8s
│  [Dark gradient overlay]            │  ← from-slate-950/95 → transparent
│                                     │
│  ─── COMPLIANCE FIRST               │  ← emerald tag, tracking-widest uppercase
│  Pharmaceutical Excellence          │  ← text-4xl xl:text-5xl font-bold text-white
│  A comprehensive platform...        │  ← text-base text-slate-200/90 font-light
│                                     │
│  ●●●○○○○○○  (pagination bars)       │  ← scaleX animated, auto-advances 4s
└─────────────────────────────────────┘
```

**Slide content layers:**
1. **Tag** — `text-emerald-400 font-bold tracking-widest text-[10px] uppercase` with a `w-10 h-0.5 bg-emerald-500` bar prefix
2. **Title** — `text-4xl xl:text-5xl font-bold leading-[1.1] text-white tracking-tight`
3. **Description** — `text-base text-slate-200/90 leading-relaxed font-light max-w-lg`

Content transitions: `AnimatePresence mode="wait"` with `opacity: 0, y: 15 → 1, 0` in 0.5s easeOut.

**9 slide topics:** Compliance, Digital Integrity, Analytics, Collaboration, Audit Readiness, Risk Intelligence, Supplier Control, Training Excellence, Smart Automation.

### 20.3 TwoFactorView and ForgotPasswordView

Both reuse the same split-screen shell and `AuthBranding` carousel. Left panel differences:
- **TwoFactorView**: 6-box OTP input grid, verify button
- **ForgotPasswordView**: email input, submit to receive link
- **ContactAdminView**: static info card (no branding carousel — full-width form panel)
