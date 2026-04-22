export const AUTH_PARTNER_BRANDS = [
  "Document Control",
  "Training Management",
  "Deviations & NCs",
  "Reports & Analytics",
  "Audit Trail",
  "... and more",
] as const;

export const AUTH_UI = {
  pageWrapper:
    "flex min-h-screen min-h-dvh w-full items-center justify-center bg-white p-0 sm:bg-slate-200 sm:p-6 lg:p-8",
  cardWrapper:
    "mx-auto w-full max-w-[1160px] overflow-hidden rounded-none bg-transparent shadow-none sm:rounded-2xl sm:shadow-[0_14px_36px_rgba(15,23,42,0.16)] lg:shadow-[0_24px_48px_rgba(15,23,42,0.18)]",
  gridWrapper:
    "grid min-h-screen min-h-dvh w-full grid-cols-1 sm:min-h-[600px] lg:min-h-[640px] lg:grid-cols-2 xl:min-h-[720px]",
  leftPanel:
    "flex flex-col items-center justify-center border-0 border-slate-200/90 bg-white px-6 py-10 sm:flex-row sm:border sm:px-10 sm:py-10 lg:px-16 lg:py-12 xl:px-20",
  formColumn:
    "flex w-full max-w-[360px] flex-1 flex-col justify-center sm:max-w-[440px]",
  headingBlock: "space-y-2 sm:space-y-3",
  formStack: "space-y-5 sm:space-y-6",
  fieldBlock: "space-y-2 sm:space-y-2.5",
  inputBase:
    "h-12 w-full rounded-[10px] border bg-white px-4 text-sm text-slate-700 transition-all sm:h-12 sm:px-4 sm:text-sm",
  inputFocus: "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-800/20",
  inputDefault: "border-slate-300 hover:border-slate-400 focus:border-teal-700",
  inputError: "border-red-300 focus:border-red-500",
  submitButton:
    "mt-2 h-12 w-full rounded-[10px] bg-teal-900 text-sm font-medium text-white transition-colors hover:bg-teal-950 sm:h-12 sm:text-base",
  rightPanel:
    "relative hidden overflow-hidden bg-[#053f46] px-8 py-10 text-white lg:flex lg:flex-col xl:px-12 xl:py-14",
  rightPanelGlow:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_6%,rgba(146,224,224,0.35),transparent_30%)]",
  rightPanelHero: "relative z-10 mt-10 max-w-[460px] space-y-6 xl:mt-24 xl:space-y-8",
  rightPanelFooter: "relative z-10 mt-auto pt-10 xl:pt-16",
  modulesHeader: "mb-7 flex items-center gap-5",
  modulesGrid:
    "grid grid-cols-2 gap-x-4 gap-y-4 text-xs font-medium text-teal-100/90 lg:text-sm xl:grid-cols-3",
  backLink:
    "group inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:text-slate-700 sm:text-sm",
} as const;
