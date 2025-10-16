import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileX, 
  Search, 
  Plus, 
  AlertTriangle, 
  RefreshCw,
  Bell,
  Users,
  FileText,
  Settings
} from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = FileX, 
  title, 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground max-w-sm">{description}</p>
          </div>
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="mt-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined empty states for common scenarios
export function NoProposalsFound({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="Belum Ada Proposal"
      description="Anda belum memiliki proposal penelitian. Buat proposal pertama Anda untuk memulai penelitian."
      action={onCreateNew ? {
        label: "Buat Proposal Baru",
        onClick: onCreateNew
      } : undefined}
    />
  );
}

export function NoSearchResults({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="Tidak Ada Hasil"
      description="Tidak ditemukan hasil yang sesuai dengan pencarian Anda. Coba gunakan kata kunci yang berbeda."
      action={onClearSearch ? {
        label: "Hapus Filter",
        onClick: onClearSearch,
        variant: "outline"
      } : undefined}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="Tidak Ada Notifikasi"
      description="Anda sudah up-to-date! Tidak ada notifikasi baru saat ini."
    />
  );
}

export function NoUsersFound({ onInviteUser }: { onInviteUser?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Belum Ada Pengguna"
      description="Belum ada pengguna terdaftar dalam kategori ini. Undang pengguna baru untuk memulai."
      action={onInviteUser ? {
        label: "Undang Pengguna",
        onClick: onInviteUser
      } : undefined}
    />
  );
}

// Error State Component
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Terjadi Kesalahan",
  description = "Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.",
  onRetry,
  className = ""
}: ErrorStateProps) {
  return (
    <Card className={`border-0 shadow-sm border-red-200 ${className}`}>
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground max-w-sm">{description}</p>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}