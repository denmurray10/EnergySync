"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartPulse, RefreshCw, BarChart } from "lucide-react";
import type { ReadinessReport } from "@/lib/types";

type ReadinessCardProps = {
  report: ReadinessReport | null;
  loading: boolean;
  onSync: () => void;
  isProMember: boolean;
};

const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
};

export function ReadinessCard({ report, loading, onSync, isProMember }: ReadinessCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <HeartPulse className="text-red-500 mr-3" />
          Health Readiness
        </CardTitle>
        <Button onClick={onSync} variant="ghost" size="icon" disabled={loading || !isProMember}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center text-center py-6">
             <Skeleton className="h-20 w-20 rounded-full" />
          </div>
        ) : report ? (
          <div className="flex items-center justify-center text-center">
            <div className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-muted"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        <path
                            className={getScoreColor(report.score)}
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${report.score}, 100`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(report.score)}`}>{report.score}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                </div>
                <h3 className="text-lg font-semibold mt-4">{report.title}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">{report.summary}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Sync your health data to get your daily readiness score.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
