'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // Enviar métricas para analytics
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })

    // Você pode enviar para seu próprio endpoint de analytics
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      window.navigator.sendBeacon('/api/analytics', body)
    }
  })

  return null
}

