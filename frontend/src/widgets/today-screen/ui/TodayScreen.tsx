import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { fetchHabits } from '@entities/habit/model/habitsSlice'
import { fetchCheckins, createCheckin, deleteCheckin } from '@entities/checkin/model/checkinsSlice'
import { Card } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { Check, Flame } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { format, isToday, startOfWeek, addDays, isAfter, startOfDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { WeekSelector } from '@widgets/week-selector/ui/WeekSelector'
import { isHabitScheduledOn } from '@shared/lib/schedule'

export function TodayScreen() {
  const dispatch = useAppDispatch()
  const { habits } = useAppSelector((state) => state.habits)
  const { checkins } = useAppSelector((state) => state.checkins)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    dispatch(fetchHabits({ archived: false, as_of_date: dateStr }))
  }, [dispatch, selectedDate])

  useEffect(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = addDays(weekStart, 6)
    const startDate = format(weekStart, 'yyyy-MM-dd')
    const endDate = format(weekEnd, 'yyyy-MM-dd')
    dispatch(fetchCheckins({ start_date: startDate, end_date: endDate }))
  }, [dispatch, selectedDate])

  const handleToggleCheckin = async (habitId: string) => {
    const isFutureDay = isAfter(startOfDay(selectedDate), startOfDay(new Date()))
    if (isFutureDay) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const existing = checkins.find((c) => c.habit_id === habitId && c.date === dateStr)

    if (existing && existing.completed) {
      await dispatch(deleteCheckin(existing.id))
    } else {
      await dispatch(
        createCheckin({
          habit_id: habitId,
          date: dateStr,
          completed: true,
          skipped: false,
        })
      )
    }
    dispatch(fetchCheckins({ start_date: dateStr, end_date: dateStr }))
  }

  const getCheckinStatus = (habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return checkins.find((c) => c.habit_id === habitId && c.date === dateStr)
  }

  const activeHabits = habits.filter((h) => !h.archived && isHabitScheduledOn(h.schedule, selectedDate))

  const habitsByTimeOfDay = {
    morning: activeHabits.filter((h) => h.time_of_day === 'morning'),
    afternoon: activeHabits.filter((h) => h.time_of_day === 'afternoon'),
    evening: activeHabits.filter((h) => h.time_of_day === 'evening'),
    none: activeHabits.filter((h) => !h.time_of_day),
  }

  const timeOfDayLabels = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    none: 'No time',
  }

  const splitByFrequency = (habitsList: typeof activeHabits) => {
    return {
      daily: habitsList.filter((h) => h.frequency === 'daily'),
      weekly: habitsList.filter((h) => h.frequency === 'weekly'),
    }
  }

  const renderHabitCard = (habit: typeof activeHabits[0]) => {
    const checkin = getCheckinStatus(habit.id)
    const isCompleted = checkin?.completed || false
    const isFutureDay = isAfter(startOfDay(selectedDate), startOfDay(new Date()))

    return (
      <Card
        key={habit.id}
        className={`p-4 transition-all duration-200 ${
          isCompleted ? 'bg-primary/5 border-primary/20' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleToggleCheckin(habit.id)}
            disabled={isFutureDay}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? 'bg-primary text-primary-foreground scale-105'
                : 'border-2 border-input hover:border-primary'
            } ${isFutureDay ? 'opacity-40 cursor-not-allowed hover:border-input' : ''}`}
          >
            {isCompleted ? <Check className="w-6 h-6" /> : null}
          </button>
          <div className="flex-1">
            <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {habit.frequency}
              </Badge>
              {habit.type === 'negative' && (
                <Badge className="text-xs bg-red-500/10 text-red-600 border border-red-500/20">
                  Negative
                </Badge>
              )}
                    <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-3 h-3" />
                        <span className="text-xs font-semibold">{habit.current_streak || 0}</span>
                      </div>
            </div>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        </div>
      </Card>
    )
  }

  const getTitle = () => {
    if (isToday(selectedDate)) {
      return 'Today'
    }
    return format(selectedDate, 'EEEE', { locale: enUS })
  }

  const handleTodayClick = () => {
    setSelectedDate(new Date())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground mt-1">{format(selectedDate, 'EEEE, MMMM d', { locale: enUS })}</p>
        </div>
        {!isToday(selectedDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleTodayClick}
            className="rounded-full"
          >
            Today
          </Button>
        )}
      </div>

      <WeekSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        habits={activeHabits}
        checkins={checkins}
      />

      <div className="space-y-6">
        {activeHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits for today. Create a habit to get started!</p>
          </div>
        ) : (
          <>
            {habitsByTimeOfDay.morning.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground px-1">
                  {timeOfDayLabels.morning}
                </h2>
                {splitByFrequency(habitsByTimeOfDay.morning).daily.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Daily</h3>
                    {splitByFrequency(habitsByTimeOfDay.morning).daily.map(renderHabitCard)}
                  </div>
                )}
                {splitByFrequency(habitsByTimeOfDay.morning).weekly.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Weekly</h3>
                    {splitByFrequency(habitsByTimeOfDay.morning).weekly.map(renderHabitCard)}
                  </div>
                )}
              </div>
            )}
            {habitsByTimeOfDay.afternoon.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground px-1">
                  {timeOfDayLabels.afternoon}
                </h2>
                {splitByFrequency(habitsByTimeOfDay.afternoon).daily.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Daily</h3>
                    {splitByFrequency(habitsByTimeOfDay.afternoon).daily.map(renderHabitCard)}
                  </div>
                )}
                {splitByFrequency(habitsByTimeOfDay.afternoon).weekly.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Weekly</h3>
                    {splitByFrequency(habitsByTimeOfDay.afternoon).weekly.map(renderHabitCard)}
                  </div>
                )}
              </div>
            )}
            {habitsByTimeOfDay.evening.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground px-1">
                  {timeOfDayLabels.evening}
                </h2>
                {splitByFrequency(habitsByTimeOfDay.evening).daily.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Daily</h3>
                    {splitByFrequency(habitsByTimeOfDay.evening).daily.map(renderHabitCard)}
                  </div>
                )}
                {splitByFrequency(habitsByTimeOfDay.evening).weekly.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Weekly</h3>
                    {splitByFrequency(habitsByTimeOfDay.evening).weekly.map(renderHabitCard)}
                  </div>
                )}
              </div>
            )}
            {habitsByTimeOfDay.none.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground px-1">
                  {timeOfDayLabels.none}
                </h2>
                {splitByFrequency(habitsByTimeOfDay.none).daily.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Daily</h3>
                    {splitByFrequency(habitsByTimeOfDay.none).daily.map(renderHabitCard)}
                  </div>
                )}
                {splitByFrequency(habitsByTimeOfDay.none).weekly.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Weekly</h3>
                    {splitByFrequency(habitsByTimeOfDay.none).weekly.map(renderHabitCard)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
