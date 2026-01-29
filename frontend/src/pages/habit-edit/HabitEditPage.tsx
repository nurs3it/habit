import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@shared/lib/hooks'
import { updateHabit, fetchHabits, type Habit } from '@entities/habit/model/habitsSlice'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { ArrowLeft } from 'lucide-react'
import { HABIT_CATEGORIES, HABIT_COLORS } from '@shared/constants'
import { useToast } from '@shared/ui/toast'
import { cn } from '@shared/lib/utils'

type ScheduleMode = 'all_time' | 'date_range' | 'weekdays' | 'specific_dates' | 'days_21'

function parseScheduleToState(
  schedule: Habit['schedule'],
  todayStr: string
): {
  mode: ScheduleMode
  startDate: string
  endDate: string
  weekdays: number[]
  specificDates: string[]
} {
  const raw = schedule && typeof schedule === 'object' ? (schedule as Record<string, unknown>) : null
  const mode = (typeof raw?.mode === 'string' ? raw.mode : 'all_time') as ScheduleMode
  if (mode === 'date_range') {
    return {
      mode: 'date_range',
      startDate: typeof raw?.start === 'string' ? raw.start : todayStr,
      endDate: typeof raw?.end === 'string' ? raw.end : todayStr,
      weekdays: [],
      specificDates: [],
    }
  }
  if (mode === 'weekdays') {
    return {
      mode: 'weekdays',
      startDate: '',
      endDate: '',
      weekdays: Array.isArray(raw?.days)
        ? raw.days.map((x) => Number(x)).filter((n) => Number.isFinite(n))
        : [],
      specificDates: [],
    }
  }
  if (mode === 'specific_dates') {
    return {
      mode: 'specific_dates',
      startDate: '',
      endDate: '',
      weekdays: [],
      specificDates: Array.isArray(raw?.dates) ? raw.dates.filter((x): x is string => typeof x === 'string') : [],
    }
  }
  if (mode === 'days_21') {
    return { mode: 'days_21', startDate: '', endDate: '', weekdays: [], specificDates: [] }
  }
  return { mode: 'all_time', startDate: '', endDate: '', weekdays: [], specificDates: [] }
}

function buildSchedule(
  mode: ScheduleMode,
  startDate: string,
  endDate: string,
  weekdays: number[],
  specificDates: string[],
  todayStr: string
) {
  if (mode === 'all_time') return { mode: 'all_time' }
  if (mode === 'days_21') return { mode: 'days_21' }
  if (mode === 'date_range') return { mode: 'date_range', start: startDate || todayStr, end: endDate || todayStr }
  if (mode === 'weekdays') return { mode: 'weekdays', days: weekdays }
  return { mode: 'specific_dates', dates: specificDates }
}

export function HabitEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const habits = useAppSelector((state) => state.habits.habits)
  const habit = habits.find((h) => h.id === id)

  const todayStr = new Date().toISOString().slice(0, 10)

  const [name, setName] = useState('')
  const [type, setType] = useState<'positive' | 'negative'>('positive')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | ''>('')
  const [color, setColor] = useState<string>(HABIT_COLORS[0].value)
  const [category, setCategory] = useState('')
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('all_time')
  const [scheduleStartDate, setScheduleStartDate] = useState('')
  const [scheduleEndDate, setScheduleEndDate] = useState('')
  const [scheduleWeekdays, setScheduleWeekdays] = useState<number[]>([])
  const [scheduleSpecificDates, setScheduleSpecificDates] = useState<string[]>([])
  const [specificDateInput, setSpecificDateInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!habit) return
    setName(habit.name)
    setType((habit.type as 'positive' | 'negative') || 'positive')
    setFrequency((habit.frequency as 'daily' | 'weekly') || 'daily')
    setTimeOfDay((habit.time_of_day as 'morning' | 'afternoon' | 'evening' | '') || '')
    setColor(habit.color || HABIT_COLORS[0].value)
    setCategory(habit.category || '')
    const s = parseScheduleToState(habit.schedule, todayStr)
    setScheduleMode(s.mode)
    setScheduleStartDate(s.startDate)
    setScheduleEndDate(s.endDate)
    setScheduleWeekdays(s.weekdays)
    setScheduleSpecificDates(s.specificDates)
  }, [habit, todayStr])

  const toggleWeekday = (day: number) => {
    setScheduleWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  const addSpecificDate = () => {
    if (!specificDateInput || specificDateInput < todayStr) return
    setScheduleSpecificDates((prev) => (prev.includes(specificDateInput) ? prev : [...prev, specificDateInput].sort()))
    setSpecificDateInput('')
  }

  const removeSpecificDate = (d: string) => {
    setScheduleSpecificDates((prev) => prev.filter((x) => x !== d))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !habit) return
    setSaving(true)
    try {
      await dispatch(
        updateHabit({
          id,
          data: {
            name,
            type,
            frequency,
            time_of_day: timeOfDay || undefined,
            color,
            category: category || undefined,
            schedule: buildSchedule(
              scheduleMode,
              scheduleStartDate,
              scheduleEndDate,
              scheduleWeekdays,
              scheduleSpecificDates,
              todayStr
            ),
          },
        })
      ).unwrap()
      toast('Habit updated', 'success')
      dispatch(fetchHabits({}))
      navigate(`/habits/${id}`)
    } catch (err) {
      console.error('Failed to update habit:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!habit) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/habits')} className="mb-4 rounded-[10px]">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground text-[15px]">Habit not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/habits/${id}`)}
            className="h-10 w-10 rounded-[10px] shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-[28px] font-bold tracking-tight">Edit habit</h1>
        </div>

        <form id="edit-habit-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-[15px] font-medium">
              Habit name
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink water"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-medium">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'positive' ? 'default' : 'outline'}
                onClick={() => setType('positive')}
                className="flex-1 rounded-[10px]"
              >
                Positive
              </Button>
              <Button
                type="button"
                variant={type === 'negative' ? 'default' : 'outline'}
                onClick={() => setType('negative')}
                className="flex-1 rounded-[10px]"
              >
                Negative
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="edit-frequency" className="text-[15px] font-medium">
                Frequency
              </label>
              <select
                id="edit-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                className="flex h-11 min-h-[44px] w-full rounded-[10px] border border-input bg-background px-4 py-2 text-[17px]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-time" className="text-[15px] font-medium">
                Time of day
              </label>
              <select
                id="edit-time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | '')}
                className="flex h-11 min-h-[44px] w-full rounded-[10px] border border-input bg-background px-4 py-2 text-[17px]"
              >
                <option value="">No time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 transition-colors active:opacity-90',
                    color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-category" className="text-[15px] font-medium">
              Category (optional)
            </label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 min-h-[44px] w-full rounded-[10px] border border-input bg-background px-4 py-2 text-[17px]"
            >
              <option value="">None</option>
              {HABIT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-medium">Schedule</label>
            <select
              value={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.value as ScheduleMode)}
              className="flex h-11 min-h-[44px] w-full rounded-[10px] border border-input bg-background px-4 py-2 text-[17px]"
            >
              <option value="all_time">All time</option>
              <option value="date_range">Date range</option>
              <option value="weekdays">Weekdays</option>
              <option value="specific_dates">Specific dates</option>
              <option value="days_21">21 days</option>
            </select>
          </div>

          {scheduleMode === 'date_range' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[15px] font-medium">Start date</label>
                <Input
                  type="date"
                  min={todayStr}
                  value={scheduleStartDate || todayStr}
                  onChange={(e) => setScheduleStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium">End date</label>
                <Input
                  type="date"
                  min={scheduleStartDate || todayStr}
                  value={scheduleEndDate}
                  onChange={(e) => setScheduleEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {scheduleMode === 'weekdays' && (
            <div className="space-y-2">
              <label className="text-[15px] font-medium">Days of week</label>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { id: 1, label: 'Mon' },
                  { id: 2, label: 'Tue' },
                  { id: 3, label: 'Wed' },
                  { id: 4, label: 'Thu' },
                  { id: 5, label: 'Fri' },
                  { id: 6, label: 'Sat' },
                  { id: 7, label: 'Sun' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleWeekday(d.id)}
                    className={cn(
                      'h-10 min-h-[44px] rounded-[10px] border border-input text-[15px] font-medium transition-colors active:opacity-90',
                      scheduleWeekdays.includes(d.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scheduleMode === 'specific_dates' && (
            <div className="space-y-2">
              <label className="text-[15px] font-medium">Dates</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={todayStr}
                  value={specificDateInput}
                  onChange={(e) => setSpecificDateInput(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addSpecificDate} className="shrink-0 rounded-[10px]">
                  Add
                </Button>
              </div>
              {scheduleSpecificDates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {scheduleSpecificDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => removeSpecificDate(d)}
                      className="px-3 py-1.5 rounded-[10px] border border-border/80 text-[13px] text-muted-foreground hover:bg-accent/50 active:bg-accent transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {scheduleMode === 'days_21' && (
            <div className="text-[15px] text-muted-foreground">
              This habit will be scheduled for the next 21 days starting today.
            </div>
          )}
        </form>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="p-4 pt-3">
          <Button
            type="submit"
            form="edit-habit-form"
            size="lg"
            className="w-full font-semibold rounded-[10px]"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
