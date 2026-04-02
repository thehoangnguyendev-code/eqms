import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { MOCK_USERS, EXISTING_USERS as _EXISTING_USERS } from "../mockData";
import { BUSINESS_UNIT_DEPARTMENTS } from "../constants";
import { generatePassword } from "../utils";
import type { User, Certification, EducationItem } from "../types";
import type { SectionKey } from "../components/ProfileSectionCard";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUserProfile(userId: string | undefined) {
  const { showToast } = useToast();

  // === Data ===
  // TODO: Replace with React Query:
  //   const { data: userData, isLoading, refetch } = useQuery({
  //     queryKey: ["user", userId],
  //     queryFn: () => userApi.getUserById(userId!),
  //     enabled: !!userId,
  //   });
  const [userData, setUserData] = useState<User>(
    () => (MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0]) as User
  );

  // === Edit state ===
  const [draft, setDraft] = useState<User>(userData);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [sectionOriginal, setSectionOriginal] = useState<User | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>(
    userData.certifications ?? []
  );
  const [educationList, setEducationList] = useState<User["educationList"]>(
    userData.educationList ?? []
  );

  // === Derived ===
  const isDraftDirty =
    sectionOriginal !== null &&
    JSON.stringify(draft) !== JSON.stringify(sectionOriginal);

  const draftDepartments = useMemo(
    () =>
      draft.businessUnit
        ? BUSINESS_UNIT_DEPARTMENTS[draft.businessUnit] || []
        : [],
    [draft.businessUnit]
  );

  const managerOptions = useMemo(
    () =>
      MOCK_USERS.filter((u) => u.id !== userData.id).map((u) => ({
        label: u.fullName,
        value: u.fullName,
      })),
    [userData.id]
  );

  const initials = userData.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const yearsOfService = userData.startDate
    ? (() => {
        const ms = Date.now() - new Date(userData.startDate).getTime();
        const yrs = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
        const mos = Math.floor(
          (ms % (1000 * 60 * 60 * 24 * 365.25)) /
            (1000 * 60 * 60 * 24 * 30.44)
        );
        return yrs > 0
          ? `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos !== 1 ? "s" : ""}`
          : `${mos} month${mos !== 1 ? "s" : ""}`;
      })()
    : null;

  // === Section edit actions ===

  const startSectionEdit = (section: SectionKey) => {
    setSectionOriginal({ ...userData });
    setDraft({ ...userData });
    setEditingSection(section);
  };

  const saveSection = (_section: SectionKey) => {
    // TODO: await userApi.updateUser(userData.id, draft); refetch();
    setUserData({ ...draft });
    setSectionOriginal(null);
    setEditingSection(null);
    showToast({
      type: "success",
      title: "Changes saved",
      message: "Profile information updated successfully.",
    });
  };

  const cancelSection = () => {
    setDraft({ ...userData });
    setSectionOriginal(null);
    setEditingSection(null);
  };

  const resetSection = () => {
    if (sectionOriginal) setDraft({ ...sectionOriginal });
  };

  const updateField = (key: keyof User, value: string) => {
    setDraft((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "businessUnit") updated.department = "";
      return updated;
    });
  };

  // === Certification actions ===

  const saveCert = (data: Omit<Certification, "id">, editing: Certification | null) => {
    if (editing) {
      const updated = certifications.map((c) =>
        c.id === editing.id ? { ...data, id: c.id } : c
      );
      setCertifications(updated);
      setUserData((prev) => ({ ...prev, certifications: updated }));
      showToast({ type: "success", title: "Certificate updated", message: "Certificate has been updated successfully." });
    } else {
      const newCert: Certification = { ...data, id: `cert-${Date.now()}` };
      const updated = [...certifications, newCert];
      setCertifications(updated);
      setUserData((prev) => ({ ...prev, certifications: updated }));
      showToast({ type: "success", title: "Certificate added", message: "Certificate has been added successfully." });
    }
  };

  const deleteCert = (id: string) => {
    const updated = certifications.filter((c) => c.id !== id);
    setCertifications(updated);
    setUserData((prev) => ({ ...prev, certifications: updated }));
    showToast({ type: "success", title: "Certificate removed", message: "Certificate has been removed." });
  };

  // === Education actions ===

  const saveEdu = (data: Omit<EducationItem, "id">, editing: EducationItem | null) => {
    const currentList = educationList || [];
    if (editing) {
      const updated: EducationItem[] = currentList.map((e) =>
        e.id === editing.id ? { ...data, id: e.id } : e
      );
      setEducationList(updated);
      setUserData((prev) => ({ ...prev, educationList: updated }));
      showToast({ type: "success", title: "Education experience updated", message: "Education detail has been updated successfully." });
    } else {
      const newEdu: EducationItem = { ...data, id: `edu-${Date.now()}` };
      const updated: EducationItem[] = [...currentList, newEdu];
      setEducationList(updated);
      setUserData((prev) => ({ ...prev, educationList: updated }));
      showToast({ type: "success", title: "Education experience added", message: "Education detail has been added successfully." });
    }
  };

  const deleteEdu = (id: string) => {
    const updated = (educationList || []).filter((e) => e.id !== id);
    setEducationList(updated);
    setUserData((prev) => ({ ...prev, educationList: updated }));
    showToast({ type: "success", title: "Education experience removed", message: "Education entry has been removed." });
  };

  // === User status actions ===

  const suspendUser = (reason: string, suspendedUntil: string) => {
    // TODO: await userApi.suspendUser(userData.id, { reason, suspendedUntil }); refetch();
    setUserData((prev) => ({
      ...prev,
      status: "Suspended" as const,
      suspendReason: reason,
      suspendedUntil: suspendedUntil || undefined,
    }));
    showToast({ type: "warning", title: "User Suspended", message: `${userData.fullName} has been suspended.` });
  };

  const terminateUser = (reason: string, terminationDate: string) => {
    // TODO: await userApi.terminateUser(userData.id, { reason, terminationDate }); refetch();
    setUserData((prev) => ({
      ...prev,
      status: "Terminated" as const,
      terminationReason: reason,
      terminationDate,
    }));
    showToast({ type: "error", title: "Employee Terminated", message: `${userData.fullName} has been terminated.` });
  };

  const reinstateUser = () => {
    // TODO: await userApi.reinstateUser(userData.id); refetch();
    setUserData((prev) => ({
      ...prev,
      status: "Active" as const,
      suspendReason: undefined,
      suspendedUntil: undefined,
      terminationReason: undefined,
      terminationDate: undefined,
    }));
    showToast({ type: "success", title: "User Reinstated", message: `${userData.fullName} has been reinstated as Active.` });
  };

  const generateResetPassword = generatePassword;

  return {
    // State
    user: userData,
    draft,
    editingSection,
    isDraftDirty,
    certifications,
    // Derived
    draftDepartments,
    managerOptions,
    initials,
    yearsOfService,
    // Section edit
    startSectionEdit,
    saveSection,
    cancelSection,
    resetSection,
    updateField,
    // Certs
    saveCert,
    deleteCert,
    // Education
    educationList,
    saveEdu,
    deleteEdu,
    // User status
    suspendUser,
    terminateUser,
    reinstateUser,
    // Util
    generateResetPassword,
  };
}
