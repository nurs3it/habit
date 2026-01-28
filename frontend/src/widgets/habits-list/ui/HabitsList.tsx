import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { fetchHabits, deleteHabit, updateHabit, Habit } from '@entities/habit/model/habitsSlice'
import { Card } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { Flame, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Input } from '@shared/ui/input'
import { HABIT_CATEGORIES, HABIT_COLORS } from '@shared/constants'

export function HabitsList() {
  const dispatch = useAppDispatch()
  const { habits, loading } = useAppSelector((state) => state.habits)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<'positive' | 'negative'>('positive')
  const [editFrequency, setEditFrequency] = useState<'daily' | 'weekly'>('daily')
  const [editTimeOfDay, setEditTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | ''>('')
  const [editColor, setEditColor] = useState<string>(HABIT_COLORS[0].value)
  const [editCategory, setEditCategory] = useState<string>('')
  const [editScheduleMode, setEditScheduleMode] = useState<
    'all_time' | 'date_range' | 'weekdays' | 'specific_dates' | 'days_21'
  >('all_time')
  const [editScheduleStartDate, setEditScheduleStartDate] = useState('')
  const [editScheduleEndDate, setEditScheduleEndDate] = useState('')
  const [editScheduleWeekdays, setEditScheduleWeekdays] = useState<number[]>([])
  const [editScheduleSpecificDates, setEditScheduleSpecificDates] = useState<string[]>([])
  const [editSpecificDateInput, setEditSpecificDateInput] = useState('')

  useEffect(() => {
    dispatch(fetchHabits({}))
  }, [dispatch])

  const todayStr = new Date().toISOString().slice(0, 10)

  const parseSchedule = (schedule: Habit['schedule']) => {
    const raw = schedule && typeof schedule === 'object' ? (schedule as Record<string, unknown>) : null
    const mode = (typeof raw?.mode === 'string' ? raw.mode : 'all_time') as
      | 'all_time'
      | 'date_range'
      | 'weekdays'
      | 'specific_dates'
      | 'days_21'
    if (mode === 'date_range') {
      setEditScheduleMode('date_range')
      setEditScheduleStartDate(typeof raw?.start === 'string' ? raw.start : todayStr)
      setEditScheduleEndDate(typeof raw?.end === 'string' ? raw.end : '')
      setEditScheduleWeekdays([])
      setEditScheduleSpecificDates([])
      setEditSpecificDateInput('')
      return
    }
    if (mode === 'weekdays') {
      setEditScheduleMode('weekdays')
      setEditScheduleStartDate('')
      setEditScheduleEndDate('')
      setEditScheduleWeekdays(
        Array.isArray(raw?.days)
          ? raw.days
              .map((x) => Number(x))
              .filter((n) => Number.isFinite(n))
              .map((n) => n as number)
          : []
      )
      setEditScheduleSpecificDates([])
      setEditSpecificDateInput('')
      return
    }
    if (mode === 'specific_dates') {
      setEditScheduleMode('specific_dates')
      setEditScheduleStartDate('')
      setEditScheduleEndDate('')
      setEditScheduleWeekdays([])
      setEditScheduleSpecificDates(
        Array.isArray(raw?.dates) ? raw.dates.filter((x): x is string => typeof x === 'string') : []
      )
      setEditSpecificDateInput('')
      return
    }
    if (mode === 'days_21') {
      setEditScheduleMode('days_21')
      setEditScheduleStartDate('')
      setEditScheduleEndDate('')
      setEditScheduleWeekdays([])
      setEditScheduleSpecificDates([])
      setEditSpecificDateInput('')
      return
    }
    setEditScheduleMode('all_time')
    setEditScheduleStartDate('')
    setEditScheduleEndDate('')
    setEditScheduleWeekdays([])
    setEditScheduleSpecificDates([])
    setEditSpecificDateInput('')
  }

  const buildEditSchedule = () => {
    if (editScheduleMode === 'all_time') return { mode: 'all_time' }
    if (editScheduleMode === 'days_21') return { mode: 'days_21' }
    if (editScheduleMode === 'date_range')
      return {
        mode: 'date_range',
        start: editScheduleStartDate || todayStr,
        end: editScheduleEndDate || todayStr,
      }
    if (editScheduleMode === 'weekdays') return { mode: 'weekdays', days: editScheduleWeekdays }
    return { mode: 'specific_dates', dates: editScheduleSpecificDates }
  }

  const toggleEditWeekday = (day: number) => {
    setEditScheduleWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  const addEditSpecificDate = () => {
    const d = editSpecificDateInput
    if (!d) return
    if (d < todayStr) return
    setEditScheduleSpecificDates((prev) => (prev.includes(d) ? prev : [...prev, d].sort()))
    setEditSpecificDateInput('')
  }

  const removeEditSpecificDate = (d: string) => {
    setEditScheduleSpecificDates((prev) => prev.filter((x) => x !== d))
  }

  const handleHabitClick = (habit: Habit) => {
    setSelectedHabit(habit)
    setIsEditing(false)
    setEditName(habit.name)
    setEditType((habit.type as 'positive' | 'negative') || 'positive')
    setEditFrequency((habit.frequency as 'daily' | 'weekly') || 'daily')
    setEditTimeOfDay((habit.time_of_day as 'morning' | 'afternoon' | 'evening' | '') || '')
    setEditColor(habit.color || HABIT_COLORS[0].value)
    setEditCategory(habit.category || '')
    parseSchedule(habit.schedule)
    setIsDetailsOpen(true)
  }

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedHabit) {
      await dispatch(deleteHabit(selectedHabit.id))
      setDeleteConfirmOpen(false)
      setIsDetailsOpen(false)
      setSelectedHabit(null)
      setIsEditing(false)
    }
  }

  const getTimeOfDayLabel = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning':
        return 'Morning'
      case 'afternoon':
        return 'Afternoon'
      case 'evening':
        return 'Evening'
      default:
        return 'No time'
    }
  }

  const getCategoryLabel = (category?: string) => {
    if (!category) return 'None'
    const match = HABIT_CATEGORIES.find((c) => c.id === category)
    return match?.name || category
  }

  const getStreakLabel = (habit?: Habit | null) => {
    if (!habit) return 'Streak'
    return habit.frequency === 'weekly' ? 'Streak (weeks)' : 'Streak (days)'
  }

  const handleStartEdit = () => {
    if (!selectedHabit) return
    setIsEditing(true)
    setEditName(selectedHabit.name)
    setEditType((selectedHabit.type as 'positive' | 'negative') || 'positive')
    setEditFrequency((selectedHabit.frequency as 'daily' | 'weekly') || 'daily')
    setEditTimeOfDay((selectedHabit.time_of_day as 'morning' | 'afternoon' | 'evening' | '') || '')
    setEditColor(selectedHabit.color || HABIT_COLORS[0].value)
    setEditCategory(selectedHabit.category || '')
    parseSchedule(selectedHabit.schedule)
  }

  const handleCancelEdit = () => {
    if (!selectedHabit) return
    setIsEditing(false)
    setEditName(selectedHabit.name)
    setEditType((selectedHabit.type as 'positive' | 'negative') || 'positive')
    setEditFrequency((selectedHabit.frequency as 'daily' | 'weekly') || 'daily')
    setEditTimeOfDay((selectedHabit.time_of_day as 'morning' | 'afternoon' | 'evening' | '') || '')
    setEditColor(selectedHabit.color || HABIT_COLORS[0].value)
    setEditCategory(selectedHabit.category || '')
    parseSchedule(selectedHabit.schedule)
  }

  const handleSaveEdit = async () => {
    if (!selectedHabit) return
    const updated = await dispatch(
      updateHabit({
        id: selectedHabit.id,
        data: {
          name: editName,
          type: editType,
          frequency: editFrequency,
          time_of_day: editTimeOfDay || undefined,
          color: editColor,
          category: editCategory || undefined,
          schedule: buildEditSchedule(),
        },
      })
    ).unwrap()
    setSelectedHabit(updated)
    setIsEditing(false)
    dispatch(fetchHabits({}))
  }

  if (loading) {
    return <div className="text-center py-8">Loading habits...</div>
  }

  const activeHabits = habits.filter((h) => !h.archived)
  const dailyHabits = activeHabits.filter((h) => h.frequency === 'daily')
  const weeklyHabits = activeHabits.filter((h) => h.frequency === 'weekly')

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No habits yet. Create your first habit to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {dailyHabits.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground px-1">Daily</h2>
            {dailyHabits.map((habit) => (
              <Card
                key={habit.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  habit.type === 'negative' ? 'border-red-500/30 bg-red-500/5' : ''
                }`}
                onClick={() => handleHabitClick(habit)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: habit.color }}
                  >
                    {habit.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{habit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {habit.frequency}
                      </Badge>
                      {habit.type === 'negative' && (
                        <Badge className="text-xs bg-red-500/10 text-red-600 border border-red-500/20">
                          Negative
                        </Badge>
                      )}
                      {habit.category && (
                        <Badge variant="outline" className="text-xs">
                          {habit.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{habit.current_streak || 0}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {weeklyHabits.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground px-1">Weekly</h2>
            {weeklyHabits.map((habit) => (
              <Card
                key={habit.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  habit.type === 'negative' ? 'border-red-500/30 bg-red-500/5' : ''
                }`}
                onClick={() => handleHabitClick(habit)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: habit.color }}
                  >
                    {habit.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{habit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {habit.frequency}
                      </Badge>
                      {habit.type === 'negative' && (
                        <Badge className="text-xs bg-red-500/10 text-red-600 border border-red-500/20">
                          Negative
                        </Badge>
                      )}
                      {habit.category && (
                        <Badge variant="outline" className="text-xs">
                          {habit.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{habit.current_streak || 0}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-auto">
          <DialogHeader>
            <div className="rounded-2xl overflow-hidden border bg-background">
              <div
                className="p-5 text-white"
                style={{
                  background: `linear-gradient(135deg, ${selectedHabit?.color || '#3B82F6'} 0%, rgba(0,0,0,0.25) 140%)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white font-semibold text-2xl border border-white/20">
                    {selectedHabit?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl text-white">{selectedHabit?.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="bg-white/15 text-white border border-white/20">
                        {selectedHabit?.frequency === 'weekly' ? 'Weekly' : 'Daily'}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/15 text-white border border-white/20">
                        {getTimeOfDayLabel(selectedHabit?.time_of_day)}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/15 text-white border border-white/20">
                        {selectedHabit?.type === 'negative' ? 'Negative' : 'Positive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border p-4 bg-muted/30">
                    <div className="text-xs text-muted-foreground">{getStreakLabel(selectedHabit)}</div>
                    <div className="mt-2 flex items-center gap-2 text-orange-500">
                      <Flame className="w-5 h-5" />
                      <div className="text-2xl font-semibold">{selectedHabit?.current_streak || 0}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border p-4 bg-muted/30">
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div className="mt-2 text-base font-semibold">{getCategoryLabel(selectedHabit?.category)}</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className={`space-y-4 mt-4 ${isEditing ? 'overflow-y-auto max-h-[50vh] pr-1' : ''}`}>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Habit name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editType === 'positive' ? 'default' : 'outline'}
                      onClick={() => setEditType('positive')}
                      className="flex-1"
                    >
                      Positive
                    </Button>
                    <Button
                      type="button"
                      variant={editType === 'negative' ? 'default' : 'outline'}
                      onClick={() => setEditType('negative')}
                      className="flex-1"
                    >
                      Negative
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <select
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value as 'daily' | 'weekly')}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time of day</label>
                    <select
                      value={editTimeOfDay}
                      onChange={(e) => setEditTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | '')}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                    >
                      <option value="">No time</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {HABIT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditColor(c.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          editColor === c.value ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
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
                    value={editScheduleMode}
                    onChange={(e) =>
                      setEditScheduleMode(
                        e.target.value as 'all_time' | 'date_range' | 'weekdays' | 'specific_dates' | 'days_21'
                      )
                    }
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                  >
                    <option value="all_time">All time</option>
                    <option value="date_range">Date range</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="specific_dates">Specific dates</option>
                    <option value="days_21">21 days</option>
                  </select>
                </div>

                {editScheduleMode === 'date_range' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start date</label>
                      <Input
                        type="date"
                        min={todayStr}
                        value={editScheduleStartDate || todayStr}
                        onChange={(e) => setEditScheduleStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End date</label>
                      <Input
                        type="date"
                        min={editScheduleStartDate || todayStr}
                        value={editScheduleEndDate}
                        onChange={(e) => setEditScheduleEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {editScheduleMode === 'weekdays' && (
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
                          onClick={() => toggleEditWeekday(d.id)}
                          className={`h-10 rounded-xl border text-xs font-semibold transition-all ${
                            editScheduleWeekdays.includes(d.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {editScheduleMode === 'specific_dates' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dates</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        min={todayStr}
                        value={editSpecificDateInput}
                        onChange={(e) => setEditSpecificDateInput(e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={addEditSpecificDate} className="shrink-0">
                        Add
                      </Button>
                    </div>
                    {editScheduleSpecificDates.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {editScheduleSpecificDates.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => removeEditSpecificDate(d)}
                            className="px-3 py-1 rounded-full border text-xs text-muted-foreground hover:bg-accent transition-colors"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {editScheduleMode === 'days_21' && (
                  <div className="text-sm text-muted-foreground">
                    This habit will be scheduled for the next 21 days starting today.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/20">
                  <div className="text-sm font-semibold">Details</div>
                </div>
                <div className="divide-y">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="text-sm font-semibold">{selectedHabit?.type === 'negative' ? 'Negative' : 'Positive'}</div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">Frequency</div>
                    <div className="text-sm font-semibold">{selectedHabit?.frequency === 'weekly' ? 'Weekly' : 'Daily'}</div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">Time of day</div>
                    <div className="text-sm font-semibold">{getTimeOfDayLabel(selectedHabit?.time_of_day)}</div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="text-sm font-semibold">{getCategoryLabel(selectedHabit?.category)}</div>
                  </div>
                  {selectedHabit?.start_date && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm text-muted-foreground">Start date</div>
                      <div className="text-sm font-semibold">
                        {format(new Date(selectedHabit.start_date), 'MMMM d, yyyy', { locale: enUS })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            {isEditing ? (
              <>
                <Button onClick={handleSaveEdit} className="w-full sm:w-auto">
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleStartEdit} className="w-full sm:w-auto">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete habit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete habit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedHabit?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
