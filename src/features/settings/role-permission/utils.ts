// Permission action colors for visual distinction
export const getActionColor = (action: string): string => {
  switch (action) {
    case "view":
      return "text-slate-600";
    case "create":
      return "text-emerald-600";
    case "edit":
      return "text-blue-600";
    case "delete":
      return "text-red-600";
    case "approve":
      return "text-purple-600";
    case "review":
      return "text-cyan-600";
    case "archive":
      return "text-amber-600";
    case "export":
      return "text-indigo-600";
    case "assign":
      return "text-teal-600";
    case "close":
      return "text-orange-600";
    default:
      return "text-slate-600";
  }
};
