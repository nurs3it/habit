import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { fetchInsights, fetchHeatmap } from '@entities/habit/model/analyticsSlice'
import { Card, CardContent, CardTitle } from '@shared/ui/card'
import {
  CalendarCheck2,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  MessageCircle,
} from 'lucide-react'
import { Badge } from '@shared/ui/badge'
import { Progress } from '@shared/ui/progress'
import { cn } from '@shared/lib/utils'
import { format, subDays } from 'date-fns'

interface Summary {
  total_habits: number
  week_checkins: number
  week_scheduled: number
  week_completion_pct: number
  perfect_days_this_week: number
  best_streak: number
  best_streak_habit: string | null
}

interface Tip {
  type: string
  title: string
  message: string
}

const insightUi = (type?: string) => {
  switch (type) {
    case 'best_weekday':
      return {
        icon: Sparkles,
        label: 'Best day',
        ring: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
      }
    case 'recent_activity':
      return {
        icon: CalendarCheck2,
        label: 'Recent',
        ring: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
      }
    default:
      return {
        icon: Lightbulb,
        label: 'Tip',
        ring: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
      }
  }
}

const tipUi = (type: string) => {
  switch (type) {
    case 'perfect_days':
      return { icon: Zap, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' }
    case 'streak':
      return { icon: Flame, bg: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400' }
    case 'strong_week':
      return { icon: TrendingUp, bg: 'bg-primary/10 border-primary/20 text-primary' }
    case 'nudge':
      return { icon: MessageCircle, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' }
    default:
      return { icon: Lightbulb, bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' }
  }
}

function MiniHeatmap({ data }: { data: Record<string, number> }) {
  const days = 28
  const today = new Date()
  const cells = []
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i)
    const key = format(d, 'yyyy-MM-dd')
    const count = data[key] ?? 0
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3
    cells.push(
      <div
        key={key}
        className={cn(
          'w-2.5 h-2.5 rounded-[4px] transition-colors',
          level === 0 && 'bg-muted/50',
          level === 1 && 'bg-primary/40',
          level === 2 && 'bg-primary/70',
          level === 3 && 'bg-primary'
        )}
        title={`${key}: ${count} check-ins`}
      />
    )
  }
  return (
    <div className="grid grid-cols-7 gap-0.5 w-[84px]">
      {cells}
    </div>
  )
}

export function InsightsDashboard() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchHeatmap(30))
  }, [dispatch])

  const payload = data.insights
  const summary: Summary | null = payload?.summary ?? null
  const tips: Tip[] = payload?.tips ?? []
  const insights = payload?.insights ?? []
  const heatmapData = data.heatmap?.data ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Insights</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Your progress, patterns, and tips to stay on track
        </p>
      </div>

      {error ? (
        <Card className="rounded-[12px] border border-border/80 bg-card">
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>Failed to load insights.</p>
            <p className="mt-2 text-xs">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="rounded-[12px] border border-border/80 bg-card">
          <CardContent className="py-10 text-center text-muted-foreground text-[15px]">
            <p>Loading insights...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {summary && (
            <section className="space-y-3 animate-in">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                This week
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="rounded-[12px] border border-border/80 bg-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-muted-foreground">Completion</p>
                        <p className="text-2xl font-bold tracking-tight mt-0.5">
                          {summary.week_completion_pct}%
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <Progress
                      value={summary.week_completion_pct}
                      className="h-1.5 mt-3 rounded-full"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {summary.week_checkins} of {summary.week_scheduled} check-ins
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[12px] border border-border/80 bg-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-muted-foreground">Perfect days</p>
                        <p className="text-2xl font-bold tracking-tight mt-0.5">
                          {summary.perfect_days_this_week}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      All habits done that day
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[12px] border border-border/80 bg-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-muted-foreground">Best streak</p>
                        <p className="text-2xl font-bold tracking-tight mt-0.5">
                          {summary.best_streak}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-[10px] bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 truncate">
                      {summary.best_streak_habit || '—'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[12px] border border-border/80 bg-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-muted-foreground">Habits</p>
                        <p className="text-2xl font-bold tracking-tight mt-0.5">
                          {summary.total_habits}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Active habits
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {Object.keys(heatmapData).length > 0 && (
            <section className="space-y-2 animate-in delay-75">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Activity (last 28 days)
              </h2>
              <Card className="rounded-[12px] border border-border/80 bg-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <MiniHeatmap data={heatmapData} />
                  <div className="text-[13px] text-muted-foreground">
                    <p className="font-medium text-foreground">Check-in density</p>
                    <p className="mt-0.5">Darker = more completed habits that day</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {tips.length > 0 && (
            <section className="space-y-2 animate-in delay-100">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Tips & recommendations
              </h2>
              <div className="space-y-2">
                {tips.map((tip: Tip, index: number) => {
                  const { icon: Icon, bg } = tipUi(tip.type)
                  return (
                    <Card
                      key={`${tip.type}-${index}`}
                      className={cn(
                        'rounded-[12px] border overflow-hidden transition-shadow hover:shadow-sm',
                        'border-border/80 bg-card'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-[10px] flex items-center justify-center border shrink-0',
                              bg
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-[15px] font-semibold">
                              {tip.title}
                            </CardTitle>
                            <p className="mt-1 text-[14px] text-muted-foreground leading-relaxed">
                              {tip.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {insights.length > 0 && (
            <section className="space-y-2 animate-in delay-150">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Patterns
              </h2>
              <div className="space-y-2">
                {insights.map((insight: { type?: string; habit_name: string; message: string }, index: number) => (
                  <Card
                    key={index}
                    className="rounded-[12px] border border-border/80 bg-card overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-11 h-11 rounded-[10px] flex items-center justify-center border shrink-0',
                              insightUi(insight.type).ring
                            )}
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
                              <Badge className={cn('text-xs border shrink-0', insightUi(insight.type).ring)}>
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
            </section>
          )}

          {!summary && tips.length === 0 && insights.length === 0 && (
            <Card className="rounded-[12px] border border-border/80 bg-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <div className="mx-auto w-14 h-14 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center">
                  <Flame className="w-7 h-7" />
                </div>
                <p className="mt-4 font-semibold text-foreground text-[17px]">No insights yet</p>
                <p className="mt-2 text-[15px] max-w-[280px] mx-auto">
                  Keep tracking your habits for a few days and we’ll show your stats, tips, and patterns here.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
