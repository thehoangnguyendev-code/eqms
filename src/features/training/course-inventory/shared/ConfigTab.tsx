import React, { useState } from "react";
import { TrainingMethod } from "../../types";
import { AssessmentConfigContent } from "./AssessmentConfigContent";

interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: number;
    progress: number;
    status: "uploading" | "success" | "error";
}

interface TrainingConfigTabProps {
    trainingMethod: TrainingMethod;
    readOnly?: boolean;
    // Optional data for readOnly mode
    examTemplateName?: string;
    answerKeyName?: string;
    passingGradeType?: "pass_fail" | "score_10" | "percentage";
    passingScore?: number;
    maxAttempts?: number;
}

export const ConfigTab: React.FC<TrainingConfigTabProps> = ({
    trainingMethod,
    readOnly = false,
    examTemplateName,
    answerKeyName,
    passingGradeType: externalPassingGradeType,
    passingScore: externalPassingScore,
    maxAttempts: externalMaxAttempts,
}) => {
    // Assessment Config state (Quiz method only) — used in edit mode
    const [examTemplate, setExamTemplate] = useState<UploadedFile | null>(null);
    const [answerKey, setAnswerKey] = useState<UploadedFile | null>(null);
    const [passingGradeType, setPassingGradeType] = useState<"pass_fail" | "score_10" | "percentage">("score_10");
    const [passingScore, setPassingScore] = useState(7);
    const [maxAttempts, setMaxAttempts] = useState(3);

    // Use external data in readOnly mode, internal state in edit mode
    const effectivePassingGradeType = readOnly ? (externalPassingGradeType || "score_10") : passingGradeType;
    const effectivePassingScore = readOnly ? (externalPassingScore ?? 7) : passingScore;
    const effectiveMaxAttempts = readOnly ? (externalMaxAttempts ?? 3) : maxAttempts;

    return (
        <div className="p-4 lg:p-6 space-y-6">

            {/* Read & Understood: simple notice */}
            {trainingMethod === "Read & Understood" && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-blue-900">Read &amp; Understood</p>
                        <p className="text-sm text-blue-700 mt-0.5">
                            Employee will read the linked document, then confirm they have understood it by e-signature. No quiz required.
                        </p>
                    </div>
                </div>
            )}

            {/* Hands-on/OJT: trainer sign-off notice */}
            {trainingMethod === "Hands-on/OJT" && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-amber-900">Hands-on / OJT</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            Trainer must sign off to confirm the employee has demonstrated practical competency. The employee <strong>cannot self-complete</strong> this course.
                        </p>
                    </div>
                </div>
            )}

            {/* Quiz (Paper-based/Manual): assessment config */}
            {trainingMethod === "Quiz (Paper-based/Manual)" && (
                <AssessmentConfigContent
                    readOnly={readOnly}
                    examTemplate={readOnly ? undefined : examTemplate}
                    setExamTemplate={readOnly ? undefined : setExamTemplate}
                    answerKey={readOnly ? undefined : answerKey}
                    setAnswerKey={readOnly ? undefined : setAnswerKey}
                    examTemplateName={readOnly ? examTemplateName : undefined}
                    answerKeyName={readOnly ? answerKeyName : undefined}
                    passingGradeType={effectivePassingGradeType}
                    setPassingGradeType={readOnly ? undefined : setPassingGradeType}
                    passingScore={effectivePassingScore}
                    setPassingScore={readOnly ? undefined : setPassingScore}
                    maxAttempts={effectiveMaxAttempts}
                    setMaxAttempts={readOnly ? undefined : setMaxAttempts}
                />
            )}
        </div>
    );
};
