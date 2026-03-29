import React from "react";

interface Reviewer {
    id: string;
    name: string;
    signedOn?: string;
}

interface WorkspaceReviewersTabProps {
    reviewers: Reviewer[];
}

const READ_ONLY_CLASS =
    "w-full h-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default";

export const WorkspaceReviewersTab: React.FC<WorkspaceReviewersTabProps> = ({ reviewers }) => {
    const rows = reviewers.length > 0
        ? reviewers
        : [{ id: "empty", name: "", signedOn: undefined }];

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {rows.map((reviewer, index) => (
                    <React.Fragment key={reviewer.id}>
                        {/* Reviewer Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Reviewer {index + 1}
                            </label>
                            <input
                                type="text"
                                value={reviewer.name}
                                readOnly
                                placeholder="—"
                                className={READ_ONLY_CLASS}
                            />
                        </div>

                        {/* Signed On */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Signed On (dd/MM/yyyy HH:mm:ss)
                            </label>
                            <input
                                type="text"
                                value={reviewer.signedOn || ""}
                                readOnly
                                placeholder="—"
                                className={READ_ONLY_CLASS}
                            />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


