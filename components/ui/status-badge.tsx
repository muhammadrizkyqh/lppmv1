import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
      case "disubmit":
        return {
          variant: "outline" as const,
          className: "text-blue-600 border-blue-200 bg-blue-50",
          label: "Submitted"
        };
      case "in_review":
      case "review":
      case "dalam_review":
        return {
          variant: "outline" as const,
          className: "text-orange-600 border-orange-200 bg-orange-50",
          label: "In Review"
        };
      case "approved":
      case "diterima":
        return {
          variant: "outline" as const,
          className: "text-green-600 border-green-200 bg-green-50",
          label: "Approved"
        };
      case "rejected":
      case "ditolak":
        return {
          variant: "outline" as const,
          className: "text-red-600 border-red-200 bg-red-50",
          label: "Rejected"
        };
      case "revision":
      case "revisi":
        return {
          variant: "outline" as const,
          className: "text-yellow-600 border-yellow-200 bg-yellow-50",
          label: "Revision"
        };
      case "monitoring":
        return {
          variant: "outline" as const,
          className: "text-purple-600 border-purple-200 bg-purple-50",
          label: "Monitoring"
        };
      case "completed":
      case "selesai":
        return {
          variant: "default" as const,
          className: "bg-green-600",
          label: "Completed"
        };
      case "draft":
        return {
          variant: "secondary" as const,
          className: "",
          label: "Draft"
        };
      case "active":
      case "aktif":
        return {
          variant: "default" as const,
          className: "",
          label: "Active"
        };
      case "inactive":
      case "nonaktif":
        return {
          variant: "secondary" as const,
          className: "",
          label: "Inactive"
        };
      default:
        return {
          variant: "secondary" as const,
          className: "",
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={variant || config.variant} 
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}