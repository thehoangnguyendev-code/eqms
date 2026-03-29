# 🧩 eQMS Feature Modules

This directory contains the core functional modules of the eQMS system. Each module is isolated to ensure testability and clear ownership.

## 🧱 Standard Module Structure
Each feature folder follows a strictly standardized structure as defined in [ARCHITECTURE.md](../../ARCHITECTURE.md).

## 🗂️ Module Index

| Module | Purpose | Status | Key Views |
|--------|---------|--------|-----------|
| **[training](./training/README.md)** | Management of courses, compliance matrix, and assessments. | 🟢 Optimized | TrainingMatrix, CourseStatus, MyTraining |
| **[documents](./documents/README.md)** | Controlled document lifecycle, revisions, and archiving. | 🟡 Active | DocumentList, ArchivedDocuments |
| **[settings](./settings/README.md)** | System dictionaries, user management, and configuration. | 🟢 Optimized | Dictionaries, UserProfiles |
| **audit-trail** | System-wide immutable logging of all actions. | 🟢 Stable | AuditTrailView |
| **auth** | Session management, login, and RBAC implementation. | 🟢 Stable | LoginView, ForgotPassword |
| **capa** | Corrective & Preventive Action workflows. | 🟡 In Dev | CAPAList, CAPADetail |
| **deviations** | Quality event investigation and resolution. | 🟡 In Dev | DeviationList, InvestigationView |

## 🚀 Key Patterns and Shared Logic
- **`useTableFilter`**: Shared hook for search, pagination, and multi-criteria filtering.
- **`FullPageLoading`**: Integrated with navigation transitions.
- **`MatrixTable`**: Specialized high-performance grid for Compliance Tracking.

---
*Refer to individual module folders for detailed technical documentation.*
