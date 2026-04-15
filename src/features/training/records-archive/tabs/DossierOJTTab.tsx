import React from "react";
import { 
  Pickaxe, 
  Plus, 
  Verified, 
  Clock, 
  UserCircle, 
  Calendar, 
  FileSignature, 
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import type { EmployeeTrainingFile } from "../../types";

interface DossierOJTTabProps {
  employee: EmployeeTrainingFile;
  onVerifyOJT: (ojt: any) => void;
}

export const DossierOJTTab: React.FC<DossierOJTTabProps> = ({ employee, onVerifyOJT }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pickaxe className="h-4 w-4 text-emerald-600" />
            Practical Competence (OJT)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Hands-on skill verification records</p>
        </div>
        <Button size="sm" variant="default" className="h-8 shadow-sm gap-2">
          <Plus className="h-3.5 w-3.5" /> Add Record
        </Button>
      </div>

      <div className="max-h-[460px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
        <div className="grid grid-cols-1 gap-2.5">
          {employee.ojtRecords?.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                  record.status === 'Completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-200 text-slate-400 group-hover:border-amber-100 group-hover:text-amber-600"
                )}>
                  {record.status === 'Completed' ? <Verified className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate leading-tight group-hover:text-slate-900">
                    {record.taskName}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <UserCircle className="h-3 w-3 text-slate-400" /> Trainer: {record.trainerName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" /> {record.dateCompleted ? `Verified: ${record.dateCompleted}` : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 ml-4">
                {record.status === 'Pending' ? (
                  <Button
                    size="xs"
                    variant="outline-emerald"
                    className="h-7 text-xs gap-1.5 px-3"
                    onClick={() => onVerifyOJT(record)}
                  >
                    <FileSignature className="h-3 w-3" /> Verify
                  </Button>
                ) : (
                  <Badge color="emerald" variant="soft" size="xs" icon={<Check className="h-3.5 w-3.5" />}>
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        <p>Total {employee.ojtRecords?.length || 0} practical competencies recorded for this dossier.</p>
      </div>
    </div>
  );
};
