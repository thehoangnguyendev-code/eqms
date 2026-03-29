# 📄 Documents Module

The Documents module manages the complete lifecycle of controlled documents, SOPs, and work instructions within the eQMS system.

## 📂 Key Subdirectories
- **`document-list/`**: Interactive list of all active documents.
- **`document-detail/`**: In-depth view and editing of a single document record.
- **`document-revisions/`**: History and workflow for document updates.
- **`archived-documents/`**: Management of obsolete and archived records.

## 💎 UI Standardization (Documents)
- **Archived Filters**: Uses the `FilterCard` system with a refined 2x2 grid on Tablet screens.
- **Sticky Actions**: Action columns in the document tables are sticky to ensure accessibility for long table titles.
- **Breadcrumbs**: Integrated with `archivedDocuments` and `documentList` breadcrumb configurations.

## ⚙️ Logic Patterns
- **Retention Calculation**: Includes specialized utilities in `utils.ts` for calculating document expiration dates and status.
- **Audit Logging**: Uses `logAuditTrail` to ensure every document view or modification is tracked for compliance.

---
*Refer to [UI_STANDARDS.md](../../../UI_STANDARDS.md) for grid and spacing specifications.*
