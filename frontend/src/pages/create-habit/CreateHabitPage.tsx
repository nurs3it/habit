import { useNavigate } from 'react-router-dom'
import { CreateHabitForm } from '@features/create-habit/ui/CreateHabitForm'
import { Button } from '@shared/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@shared/ui/toast'

export function CreateHabitPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast('Habit created successfully!', 'success')
    navigate('/habits')
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/habits')}
            className="h-10 w-10 rounded-[10px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-[28px] font-bold tracking-tight">Create habit</h1>
        </div>
        <CreateHabitForm onSuccess={handleSuccess} />
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="p-4 pt-3">
          <Button
            type="submit"
            form="create-habit-form"
            size="lg"
            className="w-full font-semibold"
          >
            Create habit
          </Button>
        </div>
      </div>
    </div>
  )
}
