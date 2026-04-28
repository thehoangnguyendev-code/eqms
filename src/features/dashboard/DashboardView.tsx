import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bell,
  Activity,
  PieChart,
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/app/routes.constants';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { FullPageLoading } from '@/components/ui/loading/Loading';

// Mock Data
const MOCK_STATS = {
  documents: { total: 248, trend: 12, trendUp: true },
  pendingReviews: { total: 15, trend: 3, trendUp: false },
  openDeviations: { total: 8, trend: 2, trendUp: false },
  activeTasks: { total: 34, trend: 5, trendUp: true },
  completionRate: { total: 87, trend: 4, trendUp: true, suffix: '%' },
  avgCycleTime: { total: 3.2, trend: 0.5, trendUp: false, suffix: ' Days' },
};

const MOCK_CHART_DATA = {
  monthlyData: [
    { month: 'JAN', value: 120 },
    { month: 'FEB', value: 210 },
    { month: 'MAR', value: 285 },
    { month: 'APR', value: 145 },
    { month: 'MAY', value: 340 },
    { month: 'JUN', value: 275 },
    { month: 'JUL', value: 215 },
    { month: 'AUG', value: 205 },
    { month: 'SEP', value: 290 },
    { month: 'OCT', value: 335 },
    { month: 'NOV', value: 280 },
    { month: 'DEC', value: 125 },
  ]
};

const MOCK_ACTIVITIES = [
  { id: 1, type: 'document', title: 'SOP-QA-002 approved', time: '5 min ago', status: 'success' },
  { id: 2, type: 'task', title: 'CAPA-2024-001 assigned to you', time: '23 min ago', status: 'info' },
  { id: 3, type: 'deviation', title: 'DEV-2024-008 opened', time: '1 hour ago', status: 'warning' },
  { id: 4, type: 'document', title: 'FORM-QC-005 revision submitted', time: '2 hours ago', status: 'info' },
  { id: 5, type: 'training', title: 'GMP training completed', time: '5 hours ago', status: 'success' },
];

const MOCK_DEADLINES = [
  { id: 1, title: 'Review SOP-PROD-003', dueDate: 'Today', priority: 'high', module: 'Document Control' },
  { id: 2, title: 'Complete CAPA Investigation', dueDate: 'Tomorrow', priority: 'high', module: 'CAPA' },
  { id: 3, title: 'Approve Change Request CCR-045', dueDate: 'Jan 10', priority: 'medium', module: 'Change Control' },
  { id: 4, title: 'Training: Data Integrity', dueDate: 'Jan 12', priority: 'medium', module: 'Training' },
];

const QUICK_ACTIONS = [
  { label: 'New Document', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Report Incident', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Schedule Audit', icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'System Alert', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const Counter = ({ value, suffix = '' }: { value: number | string, suffix?: string }) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (typeof value === 'string' && value.includes('.')) {
      return latest.toFixed(1) + suffix;
    }
    return Math.round(latest) + suffix;
  });

  useEffect(() => {
    const controls = animate(count, numericValue, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [numericValue]);

  return <motion.span>{rounded}</motion.span>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState('month');
  const [isNavigating, setIsNavigating] = useState(false);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user's full name
  const getUserFullName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`.trim() || user.username;
  };

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-900">{data.payload.month}</p>
          <p className="text-xs text-slate-600">
            {data.value.toLocaleString()} documents
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${value / 1000}k`;
    return String(value);
  };

  return (
    <>
      <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <motion.div
        className="space-y-6 w-full flex-1 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome & Quick Actions Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Banner - Modern & Bright Design */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 group">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"
              />
              <motion.div
                animate={{
                  x: [0, -50, 0],
                  y: [0, 30, 0],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-60"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  x: [0, 30, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 right-[10%] w-80 h-80 bg-blue-50/40 rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10 flex flex-col items-start justify-center h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                  {getGreeting()}, <br className="hidden md:block lg:hidden" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                    {getUserFullName()}
                  </span>
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                    className="inline-block ml-3 origin-bottom-right cursor-default"
                  >
                    👋
                  </motion.span>
                </h1>

                <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed mb-8">
                  Here is what's happening in your Quality Management System today. You have <span className="inline-flex items-center px-2.5 py-1 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-100 font-medium text-xs mx-1">12 pending tasks</span> requiring attention.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setIsNavigating(true); setTimeout(() => navigate(ROUTES.MY_TASKS), 600); }}
                  className="group relative px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  <span className="relative">View My Tasks</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-sm flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Latest Deviations</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Decorative Floating Cards (Desktop Only) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 opacity-100 pointer-events-none z-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.4 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex items-center gap-3 w-48 transform translate-x-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-20 bg-slate-200 rounded-full mb-2" />
                  <div className="h-2 w-12 bg-slate-100 rounded-full" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.6 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
                className="p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex items-center gap-3 w-48 ml-12"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-24 bg-slate-200 rounded-full mb-2" />
                  <div className="h-2 w-16 bg-slate-100 rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Quick Actions</h2>
              <p className="text-sm text-slate-500 mb-4">Common tasks and shortcuts</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, backgroundColor: "var(--bg-hover)" }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 group",
                    "bg-white hover:border-emerald-200 border-slate-100",
                    action.border
                  )}
                  style={{ "--bg-hover": "var(--slate-50)" } as React.CSSProperties}
                >
                  <div className={cn("p-2 rounded-lg", action.bg, action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              title: 'Documents',
              value: MOCK_STATS.documents.total,
              trend: 12,
              icon: FileText,
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            {
              title: 'Pending Reviews',
              value: MOCK_STATS.pendingReviews.total,
              trend: -2,
              icon: AlertCircle,
              color: 'text-amber-600',
              bg: 'bg-amber-50'
            },
            {
              title: 'Deviations',
              value: MOCK_STATS.openDeviations.total,
              trend: 5,
              icon: AlertTriangle,
              color: 'text-red-600',
              bg: 'bg-red-50'
            },
            {
              title: 'Completion Rate',
              value: 98,
              suffix: '%',
              trend: 3,
              icon: CheckCircle2,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50'
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend > 0 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                )}>
                  {stat.trend > 0 ? "+" : ""}{stat.trend}%
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  <Counter value={stat.value} suffix={stat.suffix || ''} />
                </h3>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          {/* Document Trend Chart */}
          <motion.div
            variants={itemVariants}
            whileHover={{ boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)" }}
            className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-shadow duration-300"
          >
            <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Overall Document Activity</h3>
                  <p className="text-sm text-slate-500">Monthly document creation trends</p>
                </div>
              </div>
              <div className="w-full md:w-32">
                <Select
                  value={chartPeriod}
                  onChange={setChartPeriod}
                  options={[
                    { label: 'Month', value: 'month' },
                    { label: 'Quarter', value: 'quarter' },
                    { label: 'Year', value: 'year' },
                  ]}
                  enableSearch={false}
                  triggerClassName="text-sm"
                />
              </div>
            </div>

            <div className="p-4 md:p-5 flex-1 min-h-[250px] md:min-h-[350px] lg:min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_CHART_DATA.monthlyData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={formatYAxis}
                    dx={-10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column Stack */}
          <div className="space-y-6">
            {/* Deadlines Widget */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Priority Deadlines
                </h3>
                <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full border border-red-200">3 High</span>
              </div>
              <div className="divide-y divide-slate-100">
                {MOCK_DEADLINES.slice(0, 3).map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4, backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                    className="group p-4 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border",
                        item.priority === 'high' ? "bg-red-50 border-red-100 text-red-600" : "bg-amber-50 border-amber-100 text-amber-600"
                      )}>
                        <span className="text-[10px] font-bold uppercase">{item.dueDate.substring(0, 3)}</span>
                        <span className="text-sm font-bold leading-none">{idx + 10}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">{item.module}</span>
                          {item.priority === 'high' && (
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Critical
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Button variant="link" size="xs" className="text-xs text-slate-600 hover:text-slate-900">View all deadlines</Button>
              </div>
            </motion.div>

            {/* Recent Activity Widget */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-4 md:p-5">
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-[7px] w-px bg-slate-200" />
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="space-y-6"
                  >
                    {MOCK_ACTIVITIES.slice(0, 4).map((activity, idx) => (
                      <motion.div
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                        className="relative pl-8 group"
                      >
                        <div className={cn(
                          "absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-1 transition-all group-hover:scale-125 group-hover:ring-2",
                          activity.status === 'success' ? "bg-emerald-500 ring-emerald-100" :
                            activity.status === 'warning' ? "bg-amber-500 ring-amber-100" :
                              "bg-blue-500 ring-blue-100"
                        )} />
                        <p className="text-sm text-slate-900 font-medium group-hover:text-emerald-700 transition-colors">{activity.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {isNavigating && <FullPageLoading text="Loading..." />}
    </>
  );
};
