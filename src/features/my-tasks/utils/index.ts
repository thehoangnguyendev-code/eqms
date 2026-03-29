/**
 * My Tasks - Utility Functions
 *
 * Helper functions for task display, styling, and calculations.
 */

import React from "react";
import {
  FileText,
  AlertTriangle,
  Shield,
  GraduationCap,
} from "lucide-react";
import type { Priority, TaskStatus, ModuleType } from "../types";

/**
 * Parse a dd/MM/yyyy date string into a Date object
 */
export const parseDateDMY = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  return new Date(Number(year), Number(month) - 1, Number(day));
};

/**
 * Convert a dd/MM/yyyy date string to yyyy-MM-dd (ISO) format
 */
export const toISODateString = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Get priority badge color classes
 */
export const getPriorityColor = (p: Priority): string => {
  switch (p) {
    case "Critical":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Low":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

/**
 * Get status badge style classes
 */
export const getStatusBadgeStyle = (s: TaskStatus | "Overdue"): string => {
  switch (s) {
    case "Pending":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "In-Progress":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Reviewing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Overdue":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

/**
 * Get module icon component
 */
export const getModuleIcon = (m: ModuleType) => {
  switch (m) {
    case "Document":
      return FileText;
    case "Deviation":
      return AlertTriangle;
    case "CAPA":
      return Shield;
    case "Training":
      return GraduationCap;
  }
};

/**
 * Get module badge style classes
 */
export const getModuleBadgeStyle = (m: ModuleType): string => {
  switch (m) {
    case "Document":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Deviation":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "CAPA":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Training":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
};

/**
 * Check if a date (dd/MM/yyyy) is overdue (before today)
 */
export const isOverdue = (dateString: string): boolean => {
  const due = parseDateDMY(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
};

/**
 * Calculate days until a date (dd/MM/yyyy)
 */
export const daysUntil = (dateString: string): number => {
  const due = parseDateDMY(dateString);
  const today = new Date();
  // Normalize to midnight to avoid partial-day rounding issues
  const dueMid = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  ).getTime();
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  return Math.ceil((dueMid - todayMid) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days left until due date (dd/MM/yyyy)
 */
export const calculateDaysLeft = (dueDate: string): number => {
  const due = parseDateDMY(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get priority badge style (alternative)
 */
export const getPriorityBadgeStyle = (priority: string): string => {
  switch (priority) {
    case "Critical":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Low":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};


