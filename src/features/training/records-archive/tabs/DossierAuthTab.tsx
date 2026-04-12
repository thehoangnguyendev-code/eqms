import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmployeeTrainingFile } from "../../types";

interface DossierAuthTabProps {
  employee: EmployeeTrainingFile;
}

export const DossierAuthTab: React.FC<DossierAuthTabProps> = ({ employee }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 gap-4">
        {employee.authorizations?.map((auth) => (
          <Card key={auth.id} className="p-6 flex flex-col sm:flex-row items-center justify-between border-slate-200 shadow-none hover:border-emerald-200 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h5 className="text-base font-bold text-slate-900">{auth.taskTitle}</h5>
                <p className="text-xs text-slate-500 font-medium">Signing Authority Level: **Level 2**</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Verified by: {auth.signedBy}</p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <Badge color="emerald" variant="soft" className="font-extrabold uppercase tracking-tight">Active Authorization</Badge>
              <p className="text-[10px] text-slate-400 font-medium">Expires: {auth.expiryDate}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
