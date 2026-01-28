export const HABIT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
] as const

export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'heart' },
  { id: 'productivity', name: 'Productivity', icon: 'briefcase' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'brain' },
  { id: 'fitness', name: 'Fitness', icon: 'dumbbell' },
  { id: 'learning', name: 'Learning', icon: 'book' },
  { id: 'social', name: 'Social', icon: 'users' },
  { id: 'custom', name: 'Custom', icon: 'folder' },
] as const
