import { Download, FileText, Search, CheckCircle, Lock } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  received: "Received",
  under_review: "Under Review",
  investigating: "Investigating",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  received: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <Download size={16} />,
  },
  under_review: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: <FileText size={16} />,
  },
  investigating: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: <Search size={16} />,
  },
  resolved: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: <CheckCircle size={16} />,
  },
  closed: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: <Lock size={16} />,
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.received;
  const label = STATUS_LABEL[status] || status;
  
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider border rounded-lg transition-all ${style.bg} ${style.text} ${style.border}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span aria-hidden="true">{style.icon}</span>
      <span>{label}</span>
    </span>
  );
}
