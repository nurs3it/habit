import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { fetchInsights } from '@entities/habit/model/analyticsSlice'
import { Card, CardContent, CardTitle } from '@shared/ui/card'
import { CalendarCheck2, Flame, Lightbulb, Sparkles } from 'lucide-react'
import { Badge } from '@shared/ui/badge'

const insightUi = (type?: string) => {
  switch (type) {
    case 'best_weekday':
      return {
        icon: Sparkles,
        label: 'Best day',
        ring: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      }
    case 'recent_activity':
      return {
        icon: CalendarCheck2,
        label: 'Recent',
        ring: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      }
    default:
      return {
        icon: Lightbulb,
        label: 'Tip',
        ring: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      }
  }
}

export function InsightsDashboard() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchInsights())
  }, [dispatch])

  const insights = data.insights?.insights || []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Insights</h1>
        <p className="text-[15px] text-muted-foreground mt-1">Discover patterns in your habits</p>
      </div>
      {error ? (
        <Card className="rounded-[10px] border border-border/80 bg-card">
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>Failed to load insights.</p>
            <p className="mt-2 text-xs">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="rounded-[10px] border border-border/80 bg-card">
          <CardContent className="py-10 text-center text-muted-foreground text-[15px]">
            <p>Loading insights...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {insights.length === 0 ? (
            <Card className="rounded-[10px] border border-border/80 bg-card">
              <CardContent className="py-10 text-center text-muted-foreground">
                <div className="mx-auto w-12 h-12 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <p className="mt-4 font-medium text-foreground">No insights yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep tracking your habits for a few days and we’ll start surfacing patterns.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight: any, index: number) => (
                <Card key={index} className="rounded-[10px] border border-border/80 bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-[10px] flex items-center justify-center border ${insightUi(
                            insight.type
                          ).ring}`}
                        >
                          {(() => {
                            const Icon = insightUi(insight.type).icon
                            return <Icon className="w-5 h-5" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base font-semibold truncate">
                              {insight.habit_name}
                            </CardTitle>
                            <Badge className={`text-xs border ${insightUi(insight.type).ring}`}>
                              {insightUi(insight.type).label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
