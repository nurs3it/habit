import { useState } from 'react'
import { useAppDispatch } from '@shared/lib/hooks'
import { createHabit } from '@entities/habit/model/habitsSlice'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { HABIT_COLORS, HABIT_CATEGORIES } from '@shared/constants'

interface CreateHabitFormProps {
  onSuccess?: () => void
}

export function CreateHabitForm({ onSuccess }: CreateHabitFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'positive' | 'negative'>('positive')
  const [frequency, setFrequency] = useState('daily')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | ''>('')
  const [color, setColor] = useState<string>(HABIT_COLORS[0].value)
  const [category, setCategory] = useState('')
  const [scheduleMode, setScheduleMode] = useState<
    'all_time' | 'date_range' | 'weekdays' | 'specific_dates' | 'days_21'
  >('all_time')
  const [scheduleStartDate, setScheduleStartDate] = useState('')
  const [scheduleEndDate, setScheduleEndDate] = useState('')
  const [scheduleWeekdays, setScheduleWeekdays] = useState<number[]>([])
  const [scheduleSpecificDates, setScheduleSpecificDates] = useState<string[]>([])
  const [specificDateInput, setSpecificDateInput] = useState('')
  const dispatch = useAppDispatch()

  const todayStr = new Date().toISOString().slice(0, 10)

  const buildSchedule = () => {
    if (scheduleMode === 'all_time') {
      return { mode: 'all_time' }
    }
    if (scheduleMode === 'days_21') {
      return { mode: 'days_21' }
    }
    if (scheduleMode === 'date_range') {
      return { mode: 'date_range', start: scheduleStartDate || todayStr, end: scheduleEndDate || todayStr }
    }
    if (scheduleMode === 'weekdays') {
      return { mode: 'weekdays', days: scheduleWeekdays }
    }
    return { mode: 'specific_dates', dates: scheduleSpecificDates }
  }

  const toggleWeekday = (day: number) => {
    setScheduleWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  const addSpecificDate = () => {
    const d = specificDateInput
    if (!d) return
    if (d < todayStr) return
    setScheduleSpecificDates((prev) => (prev.includes(d) ? prev : [...prev, d].sort()))
    setSpecificDateInput('')
  }

  const removeSpecificDate = (d: string) => {
    setScheduleSpecificDates((prev) => prev.filter((x) => x !== d))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(
        createHabit({
          name,
          type,
          frequency,
          start_date: new Date().toISOString(),
          time_of_day: timeOfDay || undefined,
          color,
          category: category || undefined,
          schedule: buildSchedule(),
        })
      ).unwrap()
      setName('')
      setScheduleMode('all_time')
      setScheduleStartDate('')
      setScheduleEndDate('')
      setScheduleWeekdays([])
      setScheduleSpecificDates([])
      setSpecificDateInput('')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create habit:', error)
    }
  }

  return (
    <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Habit name
            </label>
            <Input
              id="name"
              placeholder="e.g., Drink water, Read books"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'positive' ? 'default' : 'outline'}
                onClick={() => setType('positive')}
                className="flex-1"
              >
                Positive
              </Button>
              <Button
                type="button"
                variant={type === 'negative' ? 'default' : 'outline'}
                onClick={() => setType('negative')}
                className="flex-1"
              >
                Negative
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Time of day</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={timeOfDay === 'morning' ? 'default' : 'outline'}
                onClick={() => setTimeOfDay('morning')}
                className="flex-1"
              >
                Morning
              </Button>
              <Button
                type="button"
                variant={timeOfDay === 'afternoon' ? 'default' : 'outline'}
                onClick={() => setTimeOfDay('afternoon')}
                className="flex-1"
              >
                Afternoon
              </Button>
              <Button
                type="button"
                variant={timeOfDay === 'evening' ? 'default' : 'outline'}
                onClick={() => setTimeOfDay('evening')}
                className="flex-1"
              >
                Evening
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category (optional)
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
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
            <label className="text-sm font-medium">Schedule</label>
            <select
              value={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.value as any)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
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
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  min={todayStr}
                  value={scheduleStartDate || todayStr}
                  onChange={(e) => setScheduleStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End date</label>
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
              <label className="text-sm font-medium">Days of week</label>
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
                    className={`h-10 rounded-xl border text-xs font-semibold transition-all ${
                      scheduleWeekdays.includes(d.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scheduleMode === 'specific_dates' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={todayStr}
                  value={specificDateInput}
                  onChange={(e) => setSpecificDateInput(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addSpecificDate} className="shrink-0">
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
                      className="px-3 py-1 rounded-full border text-xs text-muted-foreground hover:bg-accent transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {scheduleMode === 'days_21' && (
            <div className="text-sm text-muted-foreground">
              This habit will be scheduled for the next 21 days starting today.
            </div>
          )}
          <Button type="submit" className="w-full">
            Create habit
          </Button>
        </form>
    </div>
  )
}
