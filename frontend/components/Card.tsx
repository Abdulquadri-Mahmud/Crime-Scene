import React, { ReactNode } from "react";
import { BarChart3, AlertCircle, AlertTriangle, XCircle, CheckCircle, X } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
}

export function Card({ children, className = "", variant = "default", onClick }: CardProps) {
  const baseStyle =
    "rounded-lg transition-all duration-300 ease-out p-6";
  
  const variants = {
    default: "bg-panel border border-line shadow-sm hover:shadow-md",
    elevated: "bg-panel border border-line shadow-lg hover:shadow-2xl hover:border-seal",
    outlined: "bg-transparent border-2 border-line hover:border-seal",
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

interface CaseFileCardProps {
  children: ReactNode;
  caseId: string;
  className?: string;
}

export function CaseFileCard({ children, caseId, className = "" }: CaseFileCardProps) {
  return (
    <div className={`case-tab ${className}`} data-tab={caseId}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "primary" | "info" | "success" | "warning" | "alert";
  className?: string;
}

export function StatCard({ label, value, icon, color = "primary", className = "" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-seal/10 border-seal/30",
    info: "bg-info/10 border-info/30",
    success: "bg-success/10 border-success/30",
    warning: "bg-warning/10 border-warning/30",
    alert: "bg-alert/10 border-alert/30",
  };

  return (
    <div className={`card-compact border rounded-lg p-5 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="mt-2 text-3xl font-bold font-display text-ink">{value}</p>
        </div>
        {icon && <div className="text-4xl opacity-30">{icon}</div>}
      </div>
    </div>
  );
}

interface AlertCardProps {
  title?: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AlertCard({ title, message, type = "info", action, dismissible = false, onDismiss }: AlertCardProps) {
  const typeClasses = {
    info: "alert-info",
    warning: "alert-warning",
    error: "alert-error",
    success: "alert-success",
  };

  const iconMap = {
    info: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <XCircle size={20} />,
    success: <CheckCircle size={20} />,
  };

  return (
    <div className={`alert ${typeClasses[type]} flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{iconMap[type]}</div>
        <div>
          {title && <h4 className="font-semibold text-sm">{title}</h4>}
          <p className={`${title ? "mt-1" : ""} text-sm leading-relaxed`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-semibold underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-lg leading-none hover:opacity-60 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
