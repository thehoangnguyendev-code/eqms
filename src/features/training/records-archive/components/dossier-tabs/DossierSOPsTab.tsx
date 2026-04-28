import React from "react";
import {
  FileText,
  Calendar,
  History,
  CheckCircle2,
  UserCircle,
  ShieldCheck
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/Button";
import type { EmployeeTrainingFile } from "@/features/training/types";
import { IconBook } from "@tabler/icons-react";

interface DossierSOPsTabProps {
  employee: EmployeeTrainingFile;
}

export const DossierSOPsTab: React.FC<DossierSOPsTabProps> = ({ employee }) => {
  return (
    <div className="p-4 md:p-5 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <IconBook className="h-4 w-4 text-emerald-600" />
            Mandatory SOP Training Records
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Requirements for {employee.jobPosition} role</p>
        </div>
        <Badge color="slate" variant="soft" size="xs" className="font-bold">EU-GMP Annex 1</Badge>
      </div>

      <div className="max-h-[460px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
        <div className="grid grid-cols-1 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex items-center justify-between p-4 md:p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-slate-900 whitespace-nowrap truncate leading-tight group-hover:text-slate-900">
                    SOP-QA-00{i}: Implementation of Environmental Monitoring Program
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      <History className="h-3 w-3" /> Ver 2.0
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" /> Date: 15/03/2026
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Score: 95/100
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCircle className="h-3 w-3 text-slate-400" /> Trainer: Nguyen An
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck className="h-3 w-3" /> Recurring: 12M
                    </span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 ml-4">
                <StatusBadge status="effective" size="xs" label="COMPLIANT" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <p>Showing 8 records based on active matrices</p>
        <Button variant="link" size="xs" className="font-bold -px-2">View All Full History</Button>
      </div>
    </div>
  );
};
