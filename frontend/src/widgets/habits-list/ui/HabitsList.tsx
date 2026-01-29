import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { fetchHabits, type Habit } from '@entities/habit/model/habitsSlice'
import { Card } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HabitsList() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { habits, loading } = useAppSelector((state) => state.habits)

  useEffect(() => {
    dispatch(fetchHabits({}))
  }, [dispatch])

  if (loading) {
    return (
      <div className="text-center py-8 text-[15px] text-muted-foreground">
        Loading habits...
      </div>
    )
  }

  const activeHabits = habits.filter((h) => !h.archived)
  const dailyHabits = activeHabits.filter((h) => h.frequency === 'daily')
  const weeklyHabits = activeHabits.filter((h) => h.frequency === 'weekly')

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-[15px]">
        <p>No habits yet. Create your first habit to get started!</p>
      </div>
    )
  }

  const handleHabitClick = (habit: Habit) => {
    navigate(`/habits/${habit.id}`)
  }

  return (
    <div className="space-y-6">
      {dailyHabits.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-header">Daily</h2>
          {dailyHabits.map((habit) => (
            <Card
              key={habit.id}
              className={`p-4 cursor-pointer rounded-[10px] hover:bg-accent/50 active:bg-accent/70 transition-colors ${
                habit.type === 'negative' ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
              onClick={() => handleHabitClick(habit)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 min-w-[44px] min-h-[44px] rounded-[10px] flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[17px]">{habit.name}</h3>
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
          <h2 className="section-header">Weekly</h2>
          {weeklyHabits.map((habit) => (
            <Card
              key={habit.id}
              className={`p-4 cursor-pointer rounded-[10px] hover:bg-accent/50 active:bg-accent/70 transition-colors ${
                habit.type === 'negative' ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
              onClick={() => handleHabitClick(habit)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 min-w-[44px] min-h-[44px] rounded-[10px] flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[17px]">{habit.name}</h3>
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
  )
}
