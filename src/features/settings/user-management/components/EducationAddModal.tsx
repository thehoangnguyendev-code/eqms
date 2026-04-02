import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { cn } from "@/components/ui/utils";
import type { EducationItem } from "../types";

interface EducationAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<EducationItem, "id">) => void;
  editing?: EducationItem | null;
}

export const EducationAddModal: React.FC<EducationAddModalProps> = ({ isOpen, onClose, onSave, editing }) => {
  const [degree, setDegree] = useState(editing?.degree ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(editing?.fieldOfStudy ?? "");
  const [institution, setInstitution] = useState(editing?.institution ?? "");
  const [graduationYear, setGraduationYear] = useState(editing?.graduationYear ?? "");
  const [gpa, setGpa] = useState(editing?.gpa ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setDegree(editing?.degree ?? "");
      setFieldOfStudy(editing?.fieldOfStudy ?? "");
      setInstitution(editing?.institution ?? "");
      setGraduationYear(editing?.graduationYear ?? "");
      const initialGpa = editing?.gpa ?? "";
      setGpa(initialGpa.replace(/\s*\/\s*4\.0$/, ""));
      setErrors({});
    }
  }, [isOpen, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!degree.trim()) errs.degree = "Degree is required";
    if (!fieldOfStudy.trim()) errs.fieldOfStudy = "Field of Study is required";
    if (!institution.trim()) errs.institution = "Institution is required";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      institution: institution.trim(),
      graduationYear: graduationYear.trim(),
      gpa: gpa.trim() ? `${gpa.trim()} / 4.0` : "",
    });
  };

  const portalContent = createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="edu-add-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        >
          <motion.div
            key="edu-add-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            key="edu-add-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              duration: 0.3
            }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden relative z-10 flex flex-col"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white min-h-[56px] shrink-0">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-6 truncate">
                  {editing ? "Edit Education" : "Add Education"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Degree */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className={cn(
                    "w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400",
                    errors.degree
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  )}
                />
                {errors.degree && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.degree}</p>}
              </div>

              {/* Field of Study */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Field of Study / Major <span className="text-red-500">*</span>
                </label>
                <input
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className={cn(
                    "w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400",
                    errors.fieldOfStudy
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  )}
                />
                {errors.fieldOfStudy && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.fieldOfStudy}</p>}
              </div>

              {/* Institution */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                  Institution / University / College <span className="text-red-500">*</span>
                </label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className={cn(
                    "w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-400",
                    errors.institution
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  )}
                />
                {errors.institution && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.institution}</p>}
              </div>

              {/* Year & GPA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Graduation Year"
                    value={graduationYear}
                    onChange={setGraduationYear}
                    placeholder="Select year"
                    enableSearch={true}
                    options={Array.from({ length: new Date().getFullYear() - 1970 + 11 }, (_, i) => {
                      const year = (new Date().getFullYear() + 10 - i).toString();
                      return { label: year, value: year };
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    GPA / Grade
                  </label>
                  <div className="relative">
                    <input
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="e.g. 3.8"
                      className="w-full h-9 pl-3 pr-12 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">
                      / 4.0
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                {editing ? "Save Changes" : "Add Education"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return portalContent;
};
