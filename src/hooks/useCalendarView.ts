import { useState, useCallback } from 'react'
import { addDays, addMonths, subDays, subMonths } from 'date-fns'
import type { CalendarView } from '@/lib/constants'

export function useCalendarView(defaultView: CalendarView = '7d') {
  const [view, setView] = useState<CalendarView>(defaultView)
  const [currentDate, setCurrentDate] = useState(new Date())

  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      switch (view) {
        case '1d': return addDays(d, 1)
        case '3d': return addDays(d, 3)
        case '7d': return addDays(d, 7)
        case '1m': return addMonths(d, 1)
      }
    })
  }, [view])

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      switch (view) {
        case '1d': return subDays(d, 1)
        case '3d': return subDays(d, 3)
        case '7d': return subDays(d, 7)
        case '1m': return subMonths(d, 1)
      }
    })
  }, [view])

  return { view, setView, currentDate, setCurrentDate, goToToday, goNext, goPrev }
}
