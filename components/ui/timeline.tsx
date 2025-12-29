import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimelineItemProps {
  icon?: React.ReactNode;
  title: string;
  timestamp?: string;
  actor?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "outline" | "destructive";
  content?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function TimelineItem({
  icon,
  title,
  timestamp,
  actor,
  status,
  statusVariant = "default",
  content,
  collapsible = false,
  defaultOpen = false,
  className,
}: TimelineItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("relative pb-8 last:pb-0", className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border last:hidden" />

      <div className="relative flex gap-4">
        {/* Icon circle */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
          {icon || <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm">{title}</h4>
                {status && (
                  <Badge variant={statusVariant} className="text-xs">
                    {status}
                  </Badge>
                )}
              </div>
              {(actor || timestamp) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {actor && <span>{actor}</span>}
                  {actor && timestamp && <span>•</span>}
                  {timestamp && <time>{timestamp}</time>}
                </div>
              )}
            </div>

            {collapsible && content && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {content && (
            <div
              className={cn(
                "transition-all overflow-hidden",
                collapsible ? (isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0") : ""
              )}
            >
              <Card className="p-4 bg-muted/50 border-muted">
                {content}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn("space-y-0", className)}>{children}</div>;
}
