import React, { useState, useMemo } from"react";
import { useNavigate } from"react-router-dom";
import { Save, X, AlertTriangle, User as UserIcon, Briefcase, Shield, GraduationCap } from"lucide-react";
import { Button } from"@/components/ui/button/Button";
import { Select } from"@/components/ui/select/Select";
import { DateTimePicker } from"@/components/ui/datetime-picker/DateTimePicker";
import { AlertModal } from"@/components/ui/modal/AlertModal";
import { CredentialsModal } from"../components/CredentialsModal";
import { useToast } from"@/components/ui/toast";
import { cn } from"@/components/ui/utils";
import { NewUser } from"../types";
import { BUSINESS_UNIT_DEPARTMENTS, USER_MANAGEMENT_ROUTES } from"../constants";
import { removeAccents, generateUsername, generatePassword } from"../utils";
import { EXISTING_USERS, MOCK_USERS } from"../mockData";
import { PageHeader } from"@/components/ui/page/PageHeader";
import { addUser as addUserBreadcrumb } from"@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from"@/components/ui/loading/Loading";

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const AddUserView: React.FC = () => {
 const navigate = useNavigate();
 const { showToast } = useToast();

 const [newUser, setNewUser] = useState<NewUser>({
 employeeCode: "",
 username: "",
 fullName: "",
 email: "",
 phone: "",
 role: "" as any,
 businessUnit: "",
 department: "",
 status: "" as any,
 permissions: [],
 });
 const [isUsernameEdited, setIsUsernameEdited] = useState(false);

 const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [showCredentialsModal, setShowCredentialsModal] = useState(false);
 const [generatedCredentials, setGeneratedCredentials] = useState({ username:"", password:"" });
 const [isNavigating, setIsNavigating] = useState(false);

 // Duplicate detection warnings (non-blocking)
 const [warnings, setWarnings] = useState<{ [key: string]: string }>({});

 const formDepartments = useMemo(() => {
 return newUser.businessUnit ? BUSINESS_UNIT_DEPARTMENTS[newUser.businessUnit] || [] : [];
 }, [newUser.businessUnit]);

 const managerOptions = useMemo(
   () => MOCK_USERS.map(u => ({ label: u.fullName, value: u.fullName })),
   []
 );

 const validateForm = (): boolean => {
 const errors: { [key: string]: string } = {};

 if (!newUser.employeeCode) {
 errors.employeeCode = "Employee Code is required";
 } else if (newUser.employeeCode.length !== 4) {
 errors.employeeCode = "Employee Code must be 4 digits";
 }

 if (!newUser.fullName.trim()) {
 errors.fullName = "Full Name is required";
 }

 if (!newUser.username.trim()) {
 errors.username = "Username is required";
 }

 if (!newUser.email.trim()) {
 errors.email = "Email is required";
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
 errors.email = "Invalid email format";
 }

 if (!newUser.jobTitle?.trim()) {
 errors.jobTitle = "Job Title is required";
 }

 if (!newUser.startDate) {
 errors.startDate = "Start Date is required";
 }

 if (!newUser.employmentType) {
 errors.employmentType = "Employment Type is required";
 }

 if (!newUser.businessUnit) {
 errors.businessUnit = "Business Unit is required";
 }

 if (!newUser.department) {
 errors.department = "Department is required";
 }

 if (!newUser.role) {
 errors.role = "System Role is required";
 }

 if (!newUser.status) {
 errors.status = "Account Status is required";
 }

 setFormErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleRegeneratePassword = () => {
 const newPassword = generatePassword();
 setGeneratedCredentials((prev) => ({ ...prev, password: newPassword }));
 };

 const handleSubmit = () => {
 if (!validateForm()) {
 showToast({ type: "error", message: "Please fix all errors before submitting" });
 return;
 }

 const password = generatePassword();
 
 setGeneratedCredentials({ username: newUser.username, password });
 setShowCredentialsModal(true);

 showToast({ type:"success", message: `User ${newUser.fullName} created successfully` });
 };

 const handleCancel = () => {
 setShowCancelModal(true);
 };

 const handleConfirmCancel = () => {
 setShowCancelModal(false);
 setIsNavigating(true);
 setTimeout(() => navigate(USER_MANAGEMENT_ROUTES.LIST), 600);
 };

 const handleCredentialsClose = () => {
 setShowCredentialsModal(false);
 setIsNavigating(true);
 setTimeout(() => navigate(USER_MANAGEMENT_ROUTES.LIST), 600);
 };

 return (
 <div className="space-y-6 w-full flex-1 flex flex-col">
  {/* Header */}
  <PageHeader
   title="Add New User"
   breadcrumbItems={addUserBreadcrumb(navigate)}
   actions={
    <>
     <Button onClick={handleCancel} variant="outline-emerald" size="sm" className="whitespace-nowrap gap-2">Cancel</Button>
     <Button onClick={handleSubmit} variant="outline-emerald" size="sm" className="whitespace-nowrap gap-2">Create User</Button>
    </>
   }
  />

  {/* 8-4 two-column layout */}
  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
   {/* Left col (8) — Personal Info + Education */}
   <div className="xl:col-span-8 space-y-6">
  {/* Personal Information */}
  <FormSection title="Personal Information" icon={<UserIcon className="h-4 w-4" />}>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
    {/* Employee Code */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Employee Code <span className="text-red-500">*</span>
     </label>
     <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">NTP.</span>
      <input
       type="text"
       value={newUser.employeeCode}
       onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setNewUser({ ...newUser, employeeCode: value });
        setFormErrors({ ...formErrors, employeeCode: "" });
        setWarnings({ ...warnings, employeeCode: "" });
       }}
       onBlur={(e) => {
        const empCode = e.target.value.trim();
        if (empCode && EXISTING_USERS.some(u => u.employeeCode === empCode)) {
         setWarnings({ ...warnings, employeeCode: "This Employee Code is already assigned" });
        }
       }}
       placeholder="0008"
       maxLength={4}
       className={cn(
        "w-full h-9 pl-12 pr-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors font-medium",
        formErrors.employeeCode ? "border-red-300 bg-red-50" : warnings.employeeCode ? "border-amber-300 bg-amber-50" : "border-slate-200"
       )}
      />
     </div>
     {formErrors.employeeCode && <p className="text-xs text-red-600 mt-1.5">{formErrors.employeeCode}</p>}
     {!formErrors.employeeCode && warnings.employeeCode && (
      <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
       <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{warnings.employeeCode}
      </p>
     )}
    </div>

    {/* Full Name */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Full Name <span className="text-red-500">*</span>
     </label>
     <input
      type="text"
      value={newUser.fullName}
      onChange={(e) => {
       const name = e.target.value;
       setNewUser(prev => ({
        ...prev,
        fullName: name,
        username: isUsernameEdited ? prev.username : generateUsername(name, []),
       }));
       setFormErrors(prev => ({ ...prev, fullName: "" }));
      }}
      placeholder="Nguyễn Thế Hoàng"
      className={cn(
       "w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors",
       formErrors.fullName ? "border-red-300 bg-red-50" : "border-slate-200"
      )}
     />
     {formErrors.fullName && <p className="text-xs text-red-600 mt-1.5">{formErrors.fullName}</p>}
    </div>

    {/* Username */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Username <span className="text-red-500">*</span>
     </label>
     <input
      type="text"
      value={newUser.username}
      onChange={(e) => {
       setIsUsernameEdited(true);
       setNewUser({ ...newUser, username: e.target.value });
       setFormErrors({ ...formErrors, username: "" });
      }}
      placeholder="e.g. hoangnt"
      className={cn(
       "w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors",
       formErrors.username ? "border-red-300 bg-red-50" : "border-slate-200"
      )}
     />
     {formErrors.username && <p className="text-xs text-red-600 mt-1.5">{formErrors.username}</p>}
    </div>

    {/* Email */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Email <span className="text-red-500">*</span>
     </label>
     <input
      type="email"
      value={newUser.email}
      onChange={(e) => { setNewUser({ ...newUser, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); setWarnings({ ...warnings, email: "" }); }}
      onBlur={(e) => {
       const email = e.target.value.trim();
       if (email && EXISTING_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setWarnings({ ...warnings, email: "This email is already in use by another user" });
       }
      }}
      placeholder="john.doe@company.com"
      className={cn(
       "w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors",
       formErrors.email ? "border-red-300 bg-red-50" : warnings.email ? "border-amber-300 bg-amber-50" : "border-slate-200"
      )}
     />
     {formErrors.email && <p className="text-xs text-red-600 mt-1.5">{formErrors.email}</p>}
     {!formErrors.email && warnings.email && (
      <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
       <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{warnings.email}
      </p>
     )}
    </div>

    {/* Phone */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</label>
     <input
      type="tel"
      value={newUser.phone}
      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
      placeholder="+84-0123-456-789"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
     />
    </div>

    {/* Gender */}
    <Select
     label="Gender"
     value={newUser.gender || ""}
     onChange={(value) => setNewUser({ ...newUser, gender: value as any })}
     options={[
      { label: "Select Gender", value: "" },
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Other", value: "Other" },
     ]}
    />

    {/* Date of Birth */}
    <DateTimePicker
     label="Date of Birth"
     value={newUser.dateOfBirth || ""}
     onChange={(v) => setNewUser({ ...newUser, dateOfBirth: v })}
     placeholder="Select date of birth"
    />

    {/* Nationality */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Nationality</label>
     <input
      type="text"
      value={newUser.nationality || ""}
      onChange={(e) => setNewUser({ ...newUser, nationality: e.target.value })}
      placeholder="e.g. Vietnamese"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Language(s) */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Language(s)</label>
     <input
      type="text"
      value={newUser.language || ""}
      onChange={(e) => setNewUser({ ...newUser, language: e.target.value })}
      placeholder="e.g. Vietnamese, English"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* ID / Passport No. */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">ID / Passport No.</label>
     <input
      type="text"
      value={newUser.idNumber || ""}
      onChange={(e) => setNewUser({ ...newUser, idNumber: e.target.value })}
      placeholder="e.g. 001234567890"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Address */}
    <div className="md:col-span-2">
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Permanent Address</label>
     <input
      type="text"
      value={newUser.address || ""}
      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
      placeholder="e.g. 123 Main Street, City, Country"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>
   </div>
  </FormSection>


  {/* Education & Professional Background */}
  <FormSection title="Education & Professional Background" icon={<GraduationCap className="h-4 w-4" />}>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
    {/* Highest Degree */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Highest Degree</label>
     <input
      type="text"
      value={newUser.degree || ""}
      onChange={(e) => setNewUser({ ...newUser, degree: e.target.value })}
      placeholder="e.g. Bachelor of Science"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Field of Study */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Field of Study</label>
     <input
      type="text"
      value={newUser.fieldOfStudy || ""}
      onChange={(e) => setNewUser({ ...newUser, fieldOfStudy: e.target.value })}
      placeholder="e.g. Pharmaceutical Sciences"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Institution */}
    <div className="md:col-span-2">
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Institution</label>
     <input
      type="text"
      value={newUser.institution || ""}
      onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })}
      placeholder="e.g. Hanoi University of Pharmacy"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Graduation Year */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Graduation Year</label>
     <input
      type="text"
      value={newUser.graduationYear || ""}
      onChange={(e) => setNewUser({ ...newUser, graduationYear: e.target.value })}
      placeholder="e.g. 2018"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* GPA / Grade */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">GPA / Grade</label>
     <input
      type="text"
      value={newUser.gpa || ""}
      onChange={(e) => setNewUser({ ...newUser, gpa: e.target.value })}
      placeholder="e.g. 3.8 / 4.0"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Professional Level */}
    <div className="md:col-span-2">
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Professional Level</label>
     <input
      type="text"
      value={newUser.professionalLevel || ""}
      onChange={(e) => setNewUser({ ...newUser, professionalLevel: e.target.value })}
      placeholder="e.g. Senior / Manager"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Area of Expertise */}
    <div className="md:col-span-2">
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Area of Expertise</label>
     <input
      type="text"
      value={newUser.areaOfExpertise || ""}
      onChange={(e) => setNewUser({ ...newUser, areaOfExpertise: e.target.value })}
      placeholder="e.g. Quality Assurance, Regulatory Affairs"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Years of Experience */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Years of Experience</label>
     <input
      type="text"
      value={newUser.yearsOfExperience || ""}
      onChange={(e) => setNewUser({ ...newUser, yearsOfExperience: e.target.value })}
      placeholder="e.g. 5"
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>

    {/* Previous Employer */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">Previous Employer</label>
     <input
      type="text"
      value={newUser.previousEmployer || ""}
      onChange={(e) => setNewUser({ ...newUser, previousEmployer: e.target.value })}
      placeholder="e.g. ABC Pharma Co."
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
     />
    </div>
   </div>
  </FormSection>
   </div>{/* end left col */}

   {/* Right col (4) — Work + Account */}
   <div className="xl:col-span-4 space-y-6">
  {/* Work & Professional Profile */}
  <FormSection title="Work & Professional Profile" icon={<Briefcase className="h-4 w-4" />}>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
    {/* Business Unit */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Business Unit <span className="text-red-500">*</span>
     </label>
     <Select
      label=""
      value={newUser.businessUnit}
      onChange={(value) => { setNewUser({ ...newUser, businessUnit: value, department: "" }); setFormErrors({ ...formErrors, businessUnit: "", department: "" }); }}
      options={[
       { label: "Select Business Unit", value: "" },
       ...Object.keys(BUSINESS_UNIT_DEPARTMENTS).map(bu => ({ label: bu, value: bu }))
      ]}
     />
     {formErrors.businessUnit && <p className="text-xs text-red-600 mt-1.5">{formErrors.businessUnit}</p>}
    </div>

    {/* Department */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Department <span className="text-red-500">*</span>
     </label>
     <Select
      label=""
      value={newUser.department}
      onChange={(value) => { setNewUser({ ...newUser, department: value }); setFormErrors({ ...formErrors, department: "" }); }}
      options={[
       { label: newUser.businessUnit ? "Select Department" : "Select Business Unit first", value: "" },
       ...formDepartments.map(dept => ({ label: dept, value: dept }))
      ]}
      disabled={!newUser.businessUnit}
     />
     {formErrors.department && <p className="text-xs text-red-600 mt-1.5">{formErrors.department}</p>}
    </div>

    {/* Job Title */}
    <div className="md:col-span-2">
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Job Title <span className="text-red-500">*</span>
     </label>
     <input
      type="text"
      value={newUser.jobTitle || ""}
      onChange={(e) => { setNewUser({ ...newUser, jobTitle: e.target.value }); setFormErrors({ ...formErrors, jobTitle: "" }); }}
      placeholder="e.g. Quality Specialist"
      className={cn(
       "w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400",
       formErrors.jobTitle ? "border-red-300 bg-red-50" : "border-slate-200"
      )}
     />
     {formErrors.jobTitle && <p className="text-xs text-red-600 mt-1.5">{formErrors.jobTitle}</p>}
    </div>

    {/* Employment Type */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Employment Type <span className="text-red-500">*</span>
     </label>
     <Select
      label=""
      value={newUser.employmentType || ""}
      onChange={(value) => { setNewUser({ ...newUser, employmentType: value as any }); setFormErrors({ ...formErrors, employmentType: "" }); }}
      options={[
       { label: "Select Employment Type", value: "" },
       { label: "Full-time", value: "Full-time" },
       { label: "Part-time", value: "Part-time" },
       { label: "Contract", value: "Contract" },
       { label: "Intern", value: "Intern" },
      ]}
     />
     {formErrors.employmentType && <p className="text-xs text-red-600 mt-1.5">{formErrors.employmentType}</p>}
    </div>

    {/* Start Date */}
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Start Date <span className="text-red-500">*</span>
     </label>
     <DateTimePicker
      label=""
      value={newUser.startDate || ""}
      onChange={(v) => { setNewUser({ ...newUser, startDate: v }); setFormErrors({ ...formErrors, startDate: "" }); }}
      placeholder="Select start date"
     />
     {formErrors.startDate && <p className="text-xs text-red-600 mt-1.5">{formErrors.startDate}</p>}
    </div>

    {/* Direct Manager */}
    <div className="md:col-span-2">
     <Select
      label="Direct Manager"
      value={newUser.managerName || ""}
      onChange={(value) => setNewUser({ ...newUser, managerName: value })}
      options={[
       { label: "Select Manager", value: "" },
       ...managerOptions,
      ]}
     />
    </div>
   </div>
  </FormSection>

  {/* Account & Access Control */}
  <FormSection title="Account & Access Control" icon={<Shield className="h-4 w-4" />}>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      System Role <span className="text-red-500">*</span>
     </label>
     <Select
      label=""
      value={newUser.role}
      onChange={(value) => { setNewUser({ ...newUser, role: value as any }); setFormErrors({ ...formErrors, role: "" }); }}
      options={[
       { label: "Select System Role", value: "" },
       { label: "Admin", value: "Admin" },
       { label: "QA Manager", value: "QA Manager" },
       { label: "Document Owner", value: "Document Owner" },
       { label: "Reviewer", value: "Reviewer" },
       { label: "Approver", value: "Approver" },
       { label: "Viewer", value: "Viewer" },
      ]}
     />
     {formErrors.role && <p className="text-xs text-red-600 mt-1.5">{formErrors.role}</p>}
    </div>
    <div>
     <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      Account Status <span className="text-red-500">*</span>
     </label>
     <Select
      label=""
      value={newUser.status}
      onChange={(value) => { setNewUser({ ...newUser, status: value as any }); setFormErrors({ ...formErrors, status: "" }); }}
      options={[
       { label: "Select Account Status", value: "" },
       { label: "Active", value: "Active" },
       { label: "Inactive", value: "Inactive" },
       { label: "Pending", value: "Pending" },
      ]}
     />
     {formErrors.status && <p className="text-xs text-red-600 mt-1.5">{formErrors.status}</p>}
    </div>
   </div>
   <div className="mt-5 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">User Account Information</p>
    <ul className="space-y-1 text-xs sm:text-sm text-blue-700">
     <li>• A temporary password will be sent to the user's email</li>
     <li>• User must change password on first login</li>
     <li>• Role determines access permissions in the system</li>
    </ul>
   </div>
  </FormSection>
   </div>{/* end right col */}
  </div>{/* end 8-4 grid */}

 {/* Modals */}
 <AlertModal
 isOpen={showCancelModal}
 onClose={() => setShowCancelModal(false)}
 onConfirm={handleConfirmCancel}
 type="warning"
 title="Cancel User Creation?"
 description="Are you sure you want to cancel? All entered information will be lost."
 confirmText="Yes, Cancel"
 cancelText="No, Continue"
 showCancel={true}
 />

 <CredentialsModal
 isOpen={showCredentialsModal}
 onClose={handleCredentialsClose}
 employeeCode={newUser.employeeCode}
 username={generatedCredentials.username}
 password={generatedCredentials.password}
 onRegeneratePassword={handleRegeneratePassword}
 />

 {isNavigating && <FullPageLoading text="Loading..." />}
 </div>
 );
};