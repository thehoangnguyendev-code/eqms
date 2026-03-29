import React, { useState } from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";

interface TrainingInformationTabProps {
  isReadOnly?: boolean;
}

export const TrainingInformationTab: React.FC<TrainingInformationTabProps> = ({ isReadOnly = false }) => {
  const [trainingPlannedDate, setTrainingPlannedDate] = useState<string>("");
  const [trainingPeriodEndDate, setTrainingPeriodEndDate] = useState<string>("");
  const [trainingCompletionDate, setTrainingCompletionDate] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Training Dates Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DateTimePicker
          label="Training Planned Date"
          value={trainingPlannedDate}
          onChange={setTrainingPlannedDate}
          placeholder="Select planned date"
          disabled={isReadOnly}
        />

        <DateTimePicker
          label="Training Period End Date"
          value={trainingPeriodEndDate}
          onChange={setTrainingPeriodEndDate}
          placeholder="Select end date"
          disabled={isReadOnly}
        />

        <DateTimePicker
          label="Training Completion Date"
          value={trainingCompletionDate}
          onChange={setTrainingCompletionDate}
          placeholder="Select completion date"
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <p className="text-xs text-slate-500">
          <span className="font-medium">Note:</span> Training Planned Date should be set before the Training Period End Date.
          Training Completion Date is set when all training activities are finished.
        </p>
      )}
    </div>
  );
};
