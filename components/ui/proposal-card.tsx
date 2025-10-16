import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, User, DollarSign, Clock, Eye } from "lucide-react";

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    status: string;
    submittedDate: string;
    budget?: number;
    progress?: number;
    reviewer?: string;
    deadline?: string;
    scheme?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  variant?: "default" | "compact";
}

export function ProposalCard({ proposal, onView, onEdit, variant = "default" }: ProposalCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (variant === "compact") {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-foreground line-clamp-2 mb-1">
                {proposal.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                ID: {proposal.id}
              </p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(proposal.submittedDate)}</span>
            </div>
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(proposal.id)}>
                <Eye className="w-3 h-3 mr-1" />
                Lihat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-foreground line-clamp-2">
                {proposal.title}
              </h4>
              <StatusBadge status={proposal.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              <span className="font-medium text-primary">{proposal.id}</span>
              {proposal.scheme && ` • ${proposal.scheme}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <div>
              <p className="text-xs">Tanggal Submit</p>
              <p className="font-medium text-foreground">{formatDate(proposal.submittedDate)}</p>
            </div>
          </div>

          {proposal.budget && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <div>
                <p className="text-xs">Dana Penelitian</p>
                <p className="font-medium text-foreground">{formatCurrency(proposal.budget)}</p>
              </div>
            </div>
          )}

          {proposal.reviewer && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <div>
                <p className="text-xs">Reviewer</p>
                <p className="font-medium text-foreground">{proposal.reviewer}</p>
              </div>
            </div>
          )}

          {proposal.deadline && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-xs">Deadline</p>
                <p className="font-medium text-foreground">{formatDate(proposal.deadline)}</p>
              </div>
            </div>
          )}
        </div>

        {proposal.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{proposal.progress}%</span>
            </div>
            <Progress value={proposal.progress} className="h-2" />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          {onView && (
            <Button size="sm" variant="outline" onClick={() => onView(proposal.id)}>
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(proposal.id)}>
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}