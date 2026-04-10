import type { BreadcrumbItem } from "../Breadcrumb";

/** Dashboard root item — always the first breadcrumb */
export const dashboard = (_navigate?: (path: string) => void): BreadcrumbItem => ({
  label: "Dashboard",
});
