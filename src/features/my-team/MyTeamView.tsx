import React from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  IconUsers,
  IconUserCheck,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconUserCircle,
  IconLayoutGrid,
  IconTarget,
  IconClock,
  IconMaximize,
  IconPlus,
  IconMinus,
  IconSitemap
} from '@tabler/icons-react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import { PageHeader } from '@/components/ui/page/PageHeader';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/routes.constants';
import { TabNav } from '@/components/ui/tabs/TabNav';
import { Badge } from '@/components/ui/badge/Badge';
import { Card } from '@/components/ui/card/ResponsiveCard';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';


// --- Types ---
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  isHead?: boolean;
  status: 'active' | 'on-leave' | 'remote';
  employeeId: string;
  joinDate: string; // ISO string
  parentId?: string;
}

const MOCK_POOL: Employee[] = [
  { id: '101', name: 'Lê Văn Khải', role: 'Intern QA', department: 'Quality Assurance', email: 'khai.lv@eqms.vn', phone: '0901-111-222', location: 'Hanoi', status: 'active', employeeId: 'EQMS-105', joinDate: '2024-01-01' },
  { id: '102', name: 'Phạm Minh Tuấn', role: 'QC Analyst', department: 'Quality Assurance', email: 'tuan.pm@eqms.vn', phone: '0901-111-333', location: 'Hanoi', status: 'active', employeeId: 'EQMS-108', joinDate: '2024-01-01' },
  { id: '103', name: 'Hoàng Kim Ngân', role: 'QA Assistant', department: 'Quality Assurance', email: 'ngan.hk@eqms.vn', phone: '0901-111-444', location: 'Hanoi', status: 'remote', employeeId: 'EQMS-112', joinDate: '2024-01-01' },
  { id: '104', name: 'Đặng Bảo Nam', role: 'Documentation Specialist', department: 'Quality Assurance', email: 'nam.db@eqms.vn', phone: '0901-111-555', location: 'Hanoi', status: 'active', employeeId: 'EQMS-115', joinDate: '2024-01-01' },
];

// --- Utils ---
const calculateTenure = (joinDate: string) => {
  const join = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - join.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} days`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
};

// --- Mock Data ---
const MY_TEAM_DATA: Employee[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Department Head (Trưởng phòng)',
    department: 'Quality Assurance',
    email: 'nva.qa@eqms.com',
    phone: '+84 901 234 567',
    location: 'Hanoi Office - Floor 5',
    isHead: true,
    status: 'active',
    employeeId: 'EQMS-001',
    joinDate: '2022-01-10',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    role: 'QA Specialist',
    department: 'Quality Assurance',
    email: 'ttb.qa@eqms.com',
    phone: '+84 902 345 678',
    location: 'Hanoi Office - Floor 5',
    status: 'active',
    employeeId: 'EQMS-012',
    joinDate: '2022-06-15',
    parentId: '1',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    role: 'Compliance Lead',
    department: 'Quality Assurance',
    email: 'lvc.qa@eqms.com',
    phone: '+84 903 456 789',
    location: 'Remote - Da Nang',
    status: 'remote',
    employeeId: 'EQMS-005',
    joinDate: '2022-03-20',
    parentId: '1',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    role: 'Document Controller',
    department: 'Quality Assurance',
    email: 'ptd.qa@eqms.com',
    phone: '+84 904 567 890',
    location: 'Hanoi Office - Floor 5',
    status: 'on-leave',
    employeeId: 'EQMS-045',
    joinDate: '2023-01-01',
    parentId: '1',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    role: 'QA Auditor',
    department: 'Quality Assurance',
    email: 'hve.qa@eqms.com',
    phone: '+84 905 678 901',
    location: 'Ho Chi Minh Office - Floor 2',
    status: 'active',
    employeeId: 'EQMS-089',
    joinDate: '2023-05-12',
    parentId: '1',
  },
  {
    id: '6',
    name: 'Vũ Thị F',
    role: 'QA Specialist',
    department: 'Quality Assurance',
    email: 'vtf.qa@eqms.com',
    phone: '+84 906 789 012',
    location: 'Hanoi Office - Floor 5',
    status: 'active',
    employeeId: 'EQMS-102',
    joinDate: '2023-11-20',
    parentId: '1',
  },
];

// --- Sub-components ---

const StatusBadge: React.FC<{ status: Employee['status'], className?: string }> = ({ status, className }) => {
  const colorMap: Record<Employee['status'], any> = {
    active: "emerald",
    'on-leave': "amber",
    remote: "blue",
  };

  const labels: Record<Employee['status'], string> = {
    active: "Active",
    'on-leave': "On Leave",
    remote: "Remote",
  };

  return (
    <Badge color={colorMap[status]} size="xs" pill={true} variant="soft" className={cn("uppercase font-bold tracking-wider", className)}>
      {labels[status]}
    </Badge>
  );
};

interface EmployeeCardProps {
  employee: Employee;
  variant?: 'grid' | 'org';
  onAddMember?: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, variant = 'grid', onAddMember }) => {
  const isOrg = variant === 'org';
  const tenure = calculateTenure(employee.joinDate);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      whileHover={{ y: isOrg ? 0 : -4, scale: isOrg ? 1.02 : 1 }}
      className="h-full relative group"
    >
      <Card
        padding="none"
        className={cn(
          "h-full relative transition-all duration-300 overflow-hidden border-slate-200",
          employee.isHead ? "border-emerald-200 ring-4 ring-emerald-50/50 shadow-emerald-50/50" : "hover:border-slate-300",
          isOrg ? "p-4" : "p-3 sm:p-5"
        )}
      >
        {/* Decorative background for Head */}
        {employee.isHead && (
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <IconUserCheck className="w-16 h-16 text-emerald-600" />
          </div>
        )}

        {/* Header Info */}
        <div className={cn("flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4 text-center sm:text-left", isOrg && "mb-3 gap-3")}>
          <div className={cn(
            "rounded-full flex items-center justify-center shrink-0 border-2 transition-transform",
            isOrg ? "h-12 w-12" : "h-10 w-10 sm:h-14 sm:w-14",
            employee.isHead ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-slate-50 border-slate-100 shadow-sm"
          )}>
            <IconUserCircle className={cn(isOrg ? "w-8 h-8" : "w-7 h-7 sm:w-10 sm:h-10", employee.isHead ? "text-emerald-500" : "text-slate-400")} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className={cn("flex items-center justify-center sm:justify-between gap-2 overflow-hidden", isOrg && "flex-col items-start gap-0")}>
              <h3 className={cn("font-bold text-slate-900 truncate", isOrg ? "text-[13px] leading-tight" : "text-sm sm:text-base")}>
                {employee.name}
              </h3>
              {!isOrg && <StatusBadge status={employee.status} className="hidden sm:inline-flex" />}
            </div>
            <p className={cn(
              "font-semibold truncate",
              isOrg ? "text-[11px] mt-0.5" : "text-[10px] sm:text-xs mt-0.5",
              employee.isHead ? "text-emerald-600" : "text-slate-500"
            )}>
              {employee.role}
            </p>
            {!isOrg && <StatusBadge status={employee.status} className="sm:hidden mt-1.5" />}
            {isOrg && <StatusBadge status={employee.status} className="mt-1.5" />}
          </div>
        </div>

        {/* Employee Meta Info */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4 bg-slate-50/50 rounded-lg p-2 sm:p-2.5 border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9px] font-semibold text-slate-700">ID</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600">{employee.employeeId}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9px] font-semibold text-slate-700">Tenure</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600">{tenure}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-600 hover:text-slate-900 transition-colors">
            <IconMail className="w-3 h-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-70" />
            <span className="text-[9px] sm:text-[11px] truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-600 hover:text-slate-900 transition-colors">
            <IconPhone className="w-3 h-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-70" />
            <span className="text-[9px] sm:text-[11px] truncate">{employee.phone}</span>
          </div>
        </div>

        {/* Footer Actions */}
        {!isOrg && (
          <div className="mt-4 sm:mt-5 flex gap-1.5 sm:gap-2">
            <button className="flex-1 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-100 active:scale-95">
              Profile
            </button>
            <button className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-100 active:scale-95">
              Chat
            </button>
          </div>
        )}
      </Card>

      {/* Add Member Button - Perfectly centered on edge with pulsing effect */}
      {isOrg && (
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          {/* Pulsing Outer Ring */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-emerald-400"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddMember?.(employee);
            }}
            className="relative h-5 w-5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all border-[1.5px] border-white cursor-pointer z-10"
            title={`Add member to ${employee.name}'s team`}
          >
            <IconPlus size={10} strokeWidth={3} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const DepartmentHero: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group"
    >
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-blue-50 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Department Info */}
        <div className="lg:col-span-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50">
            Current Department
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quality Assurance</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ensuring high standards of quality and compliance across all manufacturing processes and documentation.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 group/stat hover:border-emerald-200 transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover/stat:text-emerald-600 transition-colors">
              <IconUsers size={16} className="sm:size-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[11px] sm:text-sm font-bold text-slate-900">12</p>
              <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-wide">Size</p>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 group/stat hover:border-emerald-200 transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover/stat:text-emerald-600 transition-colors">
              <IconTarget size={16} className="sm:size-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[11px] sm:text-sm font-bold text-slate-900">94%</p>
              <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-wide">Train</p>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 group/stat hover:border-emerald-200 transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover/stat:text-emerald-600 transition-colors">
              <IconClock size={16} className="sm:size-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[11px] sm:text-sm font-bold text-slate-900">2.4d</p>
              <p className="text-[8px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-wide">Time</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedLine: React.FC<{ className?: string; direction?: 'v' | 'h'; origin?: 'center' | 'start' }> = ({ className, direction = 'v', origin = 'start' }) => {
  return (
    <div className={cn("bg-slate-200 overflow-hidden relative", className)}>
      <motion.div
        animate={direction === 'v' ? { y: ["-100%", "100%"] } : { x: ["-100%", "100%"] }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "linear",
          repeatDelay: 0.5
        }}
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent",
          direction === 'v' && "bg-gradient-to-b"
        )}
      />
    </div>
  );
};

// --- Modal ---

const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (members: Employee[]) => void;
  parentEmployee: Employee | null;
  existingIds: string[];
}> = ({ isOpen, onClose, onConfirm, parentEmployee, existingIds }) => {
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = MOCK_POOL.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase()) ||
    user.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = () => {
    const selectedUsers = MOCK_POOL.filter(u => selectedIds.includes(u.id));
    onConfirm(selectedUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
      >
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 leading-6">Add Team Member</h3>
              <p className="mt-1 text-sm text-slate-500">
                Assigning to: <span className="text-emerald-600 font-bold">{parentEmployee?.name}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <XIcon className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, role, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2 bg-white overflow-y-auto max-h-[300px] flex-1 min-h-0 custom-scrollbar">
          {filteredUsers.length > 0 ? (
            <div className="space-y-1 divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isAlreadyAdded = existingIds.includes(user.id);
                const isSelected = selectedIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => !isAlreadyAdded && handleToggleUser(user.id)}
                    disabled={isAlreadyAdded}
                    className={cn(
                      "w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all group text-left border border-transparent",
                      isSelected ? "bg-emerald-50 border-emerald-100" : isAlreadyAdded ? "bg-slate-50 opacity-60 cursor-not-allowed" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="shrink-0 pointer-events-none">
                      <Checkbox 
                        checked={isSelected} 
                        disabled={isAlreadyAdded}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate text-sm flex items-center gap-2">
                        {user.name}
                        {isAlreadyAdded && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold shrink-0">Added</span>}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 truncate mt-0.5 uppercase tracking-wide">
                        {user.role} • {user.employeeId}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md shrink-0 uppercase tracking-wider">
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconUsers className="h-10 w-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900">No members found</p>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 sm:gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={selectedIds.length === 0}>
            Assign Member ({selectedIds.length})
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const NodeLines: React.FC<{
  totalWidth: number;
  childCenters: number[];
  gapY: number;
  radius: number;
}> = ({ totalWidth, childCenters, gapY, radius }) => {
  const STEM_HEIGHT = 40;
  const centerX = totalWidth / 2;

  return (
    <svg
      width={totalWidth}
      height={gapY + 20}
      className="overflow-visible"
      style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Main stem from parent */}
      <path d={`M ${centerX} 0 V ${STEM_HEIGHT}`} stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

      {childCenters.map((childX, i) => {
        const isCenter = Math.abs(childX - centerX) < 2;

        let d = "";
        if (isCenter) {
          d = `M ${centerX} ${STEM_HEIGHT} V ${gapY}`;
        } else {
          const r = childX < centerX ? radius : -radius;
          d = `M ${centerX} ${STEM_HEIGHT} H ${childX + r} Q ${childX} ${STEM_HEIGHT} ${childX} ${STEM_HEIGHT + radius} V ${gapY}`;
        }

        return (
          <g key={i}>
            {/* Static Emerald line */}
            <path d={d} stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Pulsing ring for card nodes */}
            <motion.circle 
              cx={childX} 
              cy={gapY} 
              animate={{ r: [4, 7, 4], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              fill="#10b981"
            />
            {/* Connection node at card top edge */}
            <circle cx={childX} cy={gapY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Pulsing ring for junction */}
      <motion.circle 
        cx={centerX} 
        cy={STEM_HEIGHT} 
        animate={{ r: [4, 7, 4], opacity: [0.6, 0, 0.6] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        fill="#10b981"
      />
      {/* Junction node */}
      <circle cx={centerX} cy={STEM_HEIGHT} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      
      {/* Pulsing ring for parent start */}
      <motion.circle 
        cx={centerX} 
        cy="0" 
        animate={{ r: [3.5, 6.5, 3.5], opacity: [0.6, 0, 0.6] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        fill="#10b981"
      />
      {/* Start node at parent bottom */}
      <circle cx={centerX} cy="0" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
};

const OrgChartView: React.FC<{
  teamData: Employee[];
  onAddMember: (employee: Employee) => void
}> = ({ teamData, onAddMember }) => {
  const [scale, setScale] = React.useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const head = teamData.find(e => e.isHead);

  // Build tree structure
  const buildTree = (parentId?: string): any[] => {
    return teamData
      .filter(e => e.parentId === parentId || (!parentId && e.isHead))
      .map(entry => ({
        ...entry,
        children: buildTree(entry.id)
      }));
  };

  const tree = head ? buildTree() : [];

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4));
  const handleReset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale(prev => Math.min(Math.max(prev + delta, 0.4), 2));
    }
  };

  // Dimensional constants for layout
  const CARD_WIDTH = 256;
  const GAP_X = 64;
  const GAP_Y = 100;
  const RADIUS = 16;

  // Recursive width calculation
  const getWidth = (node: any): number => {
    const children = node.children || [];
    if (children.length === 0) return CARD_WIDTH;
    const childrenWidth = children.reduce((sum: number, child: any) => sum + getWidth(child), 0);
    const gaps = (children.length - 1) * GAP_X;
    return Math.max(CARD_WIDTH, childrenWidth + gaps);
  };

  // Recursive render function
  const renderNode = (node: any, level = 0): React.ReactNode => {
    const children = node.children || [];

    // Calculate children positions for correctly aligned lines
    let childrenCenters: number[] = [];
    let totalSubtreeWidth = 0;

    if (children.length > 0) {
      const childWidths = children.map(child => getWidth(child));
      let currentX = 0;
      childWidths.forEach(w => {
        childrenCenters.push(currentX + w / 2);
        currentX += w + GAP_X;
      });
      totalSubtreeWidth = currentX - GAP_X;
    }

    return (
      <div key={node.id} className="relative flex flex-col items-center">
        <div className="w-64 z-10 shrink-0">
          <EmployeeCard
            employee={node}
            variant="org"
            onAddMember={onAddMember}
          />
        </div>

        {children.length > 0 && (
          <div className="relative pt-[100px] flex justify-center" style={{ gap: GAP_X }}>
            <div className="absolute top-0 inset-0 pointer-events-none z-[20]" style={{ height: GAP_Y }}>

              <NodeLines
                totalWidth={totalSubtreeWidth}
                childCenters={childrenCenters}
                gapY={GAP_Y}
                radius={RADIUS}
              />
            </div>
            {children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[650px] bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-grab active:cursor-grabbing select-none" onWheel={handleWheel}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.9]" style={{ backgroundImage: `linear-gradient(#f1f5f9 1.5px, transparent 1.5px), linear-gradient(90deg, #f1f5f9 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px' }} />

      <motion.div drag dragMomentum={false} style={{ x, y, scale }} className="absolute inset-0 flex flex-col items-center py-20 min-w-max">
        {tree.map(root => renderNode(root))}
      </motion.div>

      {/* Floating Control Panel */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 z-[40]">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-1.5 shadow-xl flex items-center gap-1">
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all active:scale-90" title="Zoom Out"><IconMinus size={18} /></button>
          <div className="px-2 min-w-[50px] text-center"><span className="text-[11px] font-bold text-slate-500 tabular-nums">{Math.round(scale * 100)}%</span></div>
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all active:scale-90" title="Zoom In"><IconPlus size={18} /></button>
          <div className="w-px h-6 bg-slate-100 mx-1" />
          <button onClick={handleReset} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all active:scale-90" title="Reset View"><IconMaximize size={18} /></button>
        </div>
      </div>

      {/* Help Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none z-[40]">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 px-4 py-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold">⌘</span>
              <span className="text-[11px] font-medium text-slate-500">+ Click to pan</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const MyTeamView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('grid');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedParent, setSelectedParent] = React.useState<Employee | null>(null);
  const [teamData, setTeamData] = React.useState<Employee[]>(MY_TEAM_DATA);

  const handleAddMember = (parent: Employee) => {
    setSelectedParent(parent);
    setIsAddModalOpen(true);
  };

  const handleConfirmAddMembers = (newMembers: Employee[]) => {
    if (!selectedParent) return;

    const preparedMembers = newMembers.map(m => ({
      ...m,
      parentId: selectedParent.id,
      isHead: false
    }));

    setTeamData(prev => [...prev, ...preparedMembers]);
  };

  const headEmployee = teamData.find(e => e.isHead);
  const otherEmployees = teamData.filter(e => !e.isHead);

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
    { label: 'My Team', isActive: true },
  ];

  const TABS = [
    { id: 'grid', label: 'Card Grid', icon: IconLayoutGrid },
    { id: 'org', label: 'Org Chart', icon: IconSitemap },
  ];

  const headerActions = (
    <div className="flex items-center gap-4">
      <div className="w-48">
        <TabNav
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
          layoutId="teamViewStyle"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Standard Page Header */}
      <PageHeader
        title="My Team"
        breadcrumbItems={breadcrumbItems}
        actions={headerActions}
      />

      {/* Department Hero Card */}
      <DepartmentHero />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'grid' ? (
          <motion.div
            key="grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-10"
          >
            {/* Department Head Section */}
            {headEmployee && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <IconUserCheck className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Department Head</h2>
                  <div className="flex-1 h-px bg-slate-100 ml-2" />
                </div>
                <div className="max-w-md">
                  <EmployeeCard employee={headEmployee} />
                </div>
              </section>
            )}

            {/* Team Members Grid */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <IconBriefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-800">Team Members ({otherEmployees.length})</h2>
                <div className="flex-1 h-px bg-slate-100 ml-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {otherEmployees.map(employee => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="org"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <OrgChartView
              teamData={teamData}
              onAddMember={handleAddMember}
            />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddMemberModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onConfirm={handleConfirmAddMembers}
            parentEmployee={selectedParent}
            existingIds={teamData.map(e => e.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
