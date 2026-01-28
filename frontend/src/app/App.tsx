import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@shared/lib/hooks'
import { LoginForm } from '@features/auth/ui/LoginForm'
import { RegisterForm } from '@features/auth/ui/RegisterForm'
import { TodayScreen } from '@widgets/today-screen/ui/TodayScreen'
import { HabitsList } from '@widgets/habits-list/ui/HabitsList'
import { InsightsDashboard } from '@widgets/insights-dashboard/ui/InsightsDashboard'
import { SettingsScreen } from '@widgets/settings/ui/SettingsScreen'
import { BottomNavigation } from '@widgets/bottom-navigation/ui/BottomNavigation'
import { CreateHabitForm } from '@features/create-habit/ui/CreateHabitForm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@shared/ui/accordion'
import { useRef } from 'react'

function CreateHabitFormWithAccordion() {
  const accordionRef = useRef<{ close: () => void } | null>(null)
  return (
    <Accordion ref={accordionRef}>
      <AccordionItem>
        <AccordionTrigger className="text-left">
          Create new habit
        </AccordionTrigger>
        <AccordionContent>
          <CreateHabitForm onSuccess={() => {
            if (accordionRef.current) {
              accordionRef.current.close()
            }
          }} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function App() {
  const isAuthenticated = useAppSelector((state) => !!state.user.token)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <>
      <div className="pb-16 min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-4">
                <TodayScreen />
              </div>
            }
          />
          <Route
            path="/habits"
            element={
              <div className="space-y-4 p-4">
                <div>
                  <h1 className="text-3xl font-bold">Habits</h1>
                </div>
                <CreateHabitFormWithAccordion />
                <HabitsList />
              </div>
            }
          />
          <Route
            path="/insights"
            element={
              <div className="p-4">
                <InsightsDashboard />
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="p-4">
                <SettingsScreen />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <BottomNavigation />
    </>
  )
}

export default App
