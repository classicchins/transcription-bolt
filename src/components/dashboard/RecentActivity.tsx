import { FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transcription } from "@/lib/types";
import { formatTranscriptionStatus } from "@/lib/transcription-utils";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  transcriptions: Transcription[];
  className?: string;
}

export function RecentActivity({ transcriptions, className }: RecentActivityProps) {
  return (
    <Card className={cn("col-span-3", className)}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transcriptions.map((transcription) => (
            <div key={transcription.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transcription.file?.name}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {new Date(transcription.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className={cn(
                "ml-auto rounded-full px-2 py-1 text-xs font-medium",
                transcription.status === 'completed' && "bg-green-100 text-green-700",
                transcription.status === 'processing' && "bg-blue-100 text-blue-700",
                transcription.status === 'pending' && "bg-yellow-100 text-yellow-700",
                transcription.status === 'error' && "bg-red-100 text-red-700"
              )}>
                {formatTranscriptionStatus(transcription.status)}
              </div>
            </div>
          ))}

          {transcriptions.length === 0 && (
            <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}