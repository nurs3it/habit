import { useState } from 'react'
import { format, startOfWeek, addWeeks, addDays, subDays, isSameDay, eachDayOfInterval, isToday, startOfMonth, endOfMonth, addMonths, subMonths, addYears, subYears } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, Flame } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { cn } from '@shared/lib/utils'
import { isHabitScheduledOn } from '@shared/lib/schedule'

interface Habit {
  id: string
  archived: boolean
  schedule?: Record<string, unknown> | null
}

interface Checkin {
  habit_id: string
  date: string
  completed: boolean
}

interface WeekSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  habits?: Habit[]
  checkins?: Checkin[]
}

export function WeekSelector({ selectedDate, onDateChange, habits = [], checkins = [] }: WeekSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarView, setCalendarView] = useState<'days' | 'months' | 'years'>('days')
  const [calendarMonth, setCalendarMonth] = useState(selectedDate)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

  const isDayComplete = (day: Date) => {
    const scheduledHabits = habits.filter((h) => !h.archived && isHabitScheduledOn(h.schedule, day))
    if (scheduledHabits.length === 0) return false
    
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayCheckins = checkins.filter((c) => c.date === dayStr && c.completed)
    const completedHabitIds = new Set(dayCheckins.map((c) => c.habit_id))
    
    return scheduledHabits.every((habit) => completedHabitIds.has(habit.id))
  }

  const handlePreviousWeek = () => {
    const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const lastDayOfPreviousWeek = subDays(currentWeekStart, 1)
    onDateChange(lastDayOfPreviousWeek)
  }

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1)
    onDateChange(newDate)
  }

  const handleDayClick = (day: Date) => {
    onDateChange(day)
  }

  const handleCalendarDayClick = (day: Date) => {
    onDateChange(day)
    setIsCalendarOpen(false)
    setCalendarView('days')
  }

  const handleMonthClick = (month: Date) => {
    setCalendarMonth(month)
    setCalendarView('days')
  }

  const handleYearClick = (year: number) => {
    setCalendarMonth(new Date(year, calendarMonth.getMonth(), 1))
    setCalendarView('months')
  }

  const getMonthRange = () => {
    const firstDay = weekDays[0]
    const lastDay = weekDays[6]
    if (format(firstDay, 'MMMM', { locale: enUS }) === format(lastDay, 'MMMM', { locale: enUS })) {
      return format(firstDay, 'MMMM yyyy', { locale: enUS })
    }
    return `${format(firstDay, 'MMMM', { locale: enUS })} - ${format(lastDay, 'MMMM yyyy', { locale: enUS })}`
  }

  const calendarDays = (() => {
    const monthStart = startOfMonth(calendarMonth)
    const monthEnd = endOfMonth(calendarMonth)
    const start = startOfWeek(monthStart, { weekStartsOn: 1 })
    const end = startOfWeek(addDays(monthEnd, 7), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: subDays(end, 1) })
  })()

  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(calendarMonth.getFullYear(), i, 1)
    return { date, name: format(date, 'MMMM', { locale: enUS }) }
  })

  const yearRange = (() => {
    const currentYear = calendarMonth.getFullYear()
    const startYear = Math.floor(currentYear / 10) * 10
    return Array.from({ length: 12 }, (_, i) => startYear + i - 1)
  })()

  return (
    <div className="rounded-[10px] border border-border/80 bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousWeek}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-accent/50 active:bg-accent transition-colors min-h-[44px]"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-semibold">{getMonthRange()}</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)
          const isComplete = isDayComplete(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-[10px] transition-colors relative min-h-[52px] active:opacity-90',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent',
                isCurrentDay && !isSelected && 'bg-accent/60'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-wide',
                  isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                )}
              >
                {format(day, 'EEE', { locale: enUS })}
              </span>
              <span className={cn(
                'text-lg font-semibold leading-none',
                isSelected ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </span>
              {isCurrentDay && !isSelected && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {isComplete && (
                <Flame
                  className={cn(
                    'w-3.5 h-3.5 absolute top-1.5 right-1.5 animate-flame',
                    isSelected ? 'text-orange-200' : 'text-orange-500'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      <Dialog open={isCalendarOpen} onOpenChange={(open) => {
        setIsCalendarOpen(open)
        if (!open) {
          setCalendarView('days')
          setCalendarMonth(selectedDate)
        }
      }}>
        <DialogContent className="max-w-sm rounded-[14px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {calendarView === 'days' && format(calendarMonth, 'MMMM yyyy', { locale: enUS })}
                {calendarView === 'months' && format(calendarMonth, 'yyyy', { locale: enUS })}
                {calendarView === 'years' && `${yearRange[0]} - ${yearRange[yearRange.length - 1]}`}
              </DialogTitle>
              <div className="flex gap-1">
                {calendarView === 'days' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarView('months')}
                      className="h-8 px-3"
                    >
                      {format(calendarMonth, 'MMM yyyy', { locale: enUS })}
                    </Button>
                  </>
                )}
                {calendarView === 'months' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(subYears(calendarMonth, 1))}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(addYears(calendarMonth, 1))}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarView('years')}
                      className="h-8 px-3"
                    >
                      {format(calendarMonth, 'yyyy', { locale: enUS })}
                    </Button>
                  </>
                )}
                {calendarView === 'years' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(subYears(calendarMonth, 10))}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(addYears(calendarMonth, 10))}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          {calendarView === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)
                  const isCurrentMonth = format(day, 'M') === format(calendarMonth, 'M')
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleCalendarDayClick(day)}
                      className={cn(
                        'aspect-square flex items-center justify-center rounded-[10px] text-[15px] font-medium transition-colors min-w-[44px] min-h-[44px] active:opacity-90',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentDay
                          ? 'bg-accent text-foreground'
                          : isCurrentMonth
                          ? 'hover:bg-accent text-foreground'
                          : 'text-muted-foreground/50'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {calendarView === 'months' && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map(({ date, name }) => {
                const isSelected = format(date, 'M') === format(selectedDate, 'M') && format(date, 'yyyy') === format(selectedDate, 'yyyy')
                return (
                  <button
                    key={name}
                    onClick={() => handleMonthClick(date)}
                    className={cn(
                      'py-3 px-4 rounded-[10px] text-[15px] font-medium transition-colors min-h-[44px] active:opacity-90',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          )}
          {calendarView === 'years' && (
            <div className="grid grid-cols-3 gap-2">
              {yearRange.map((year) => {
                const isSelected = year === selectedDate.getFullYear()
                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={cn(
                      'py-3 px-4 rounded-[10px] text-[15px] font-medium transition-colors min-h-[44px] active:opacity-90',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
