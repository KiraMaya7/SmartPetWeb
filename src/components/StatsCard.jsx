import React, { useState, useEffect } from 'react'
import { Card } from 'react-bootstrap'

const StatsCard = ({ nextMeal, consumed }) => {
  const [timeLeft, setTimeLeft] = useState('')

  // Calcular tiempo restante para próxima comida
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const [hours, minutes, seconds] = nextMeal.split(':')
      const mealTime = new Date()
      mealTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
      
      if (mealTime < now) {
        mealTime.setDate(mealTime.getDate() + 1)
      }
      
      const diff = mealTime - now
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeLeft(`${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [nextMeal])

  return (
    <Card className="shadow-lg border-0 rounded-4 h-100 fade-in">
      <Card.Header className="bg-primary text-white rounded-top-4 fw-bold">
        <i className="bi bi-clock-history me-2"></i>
        HORARIOS
      </Card.Header>
      <Card.Body className="p-4">
        {/* Próxima comida */}
        <div className="text-center mb-4">
          <small className="text-muted">Próxima comida</small>
          <div className="display-4 fw-bold text-primary font-monospace">
            {timeLeft}
          </div>
        </div>
        
        {/* Ha comido hoy */}
        <div className="text-center mb-4">
          <small className="text-muted">Ha comido hoy</small>
          <h2 className="display-4 fw-bold text-primary mb-0">
            {consumed}
          </h2>
          <small className="text-muted">gramos</small>
        </div>
        
        {/* Indicadores de navegación */}
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2 text-muted">
            <span><i className="bi bi-graph-up"></i> Análisis</span>
            <span><i className="bi bi-sliders2"></i> Control</span>
            <span><i className="bi bi-gear"></i> Ajustes</span>
          </div>
          <div className="progress" style={{ height: '5px' }}>
            <div className="progress-bar bg-info" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Comandos remotos */}
        <hr className="my-4" />
        <h5 className="mb-3">
          <i className="bi bi-wifi me-2"></i>
          Comandos Remotos
        </h5>
        <div className="d-flex justify-content-around">
          <button className="btn btn-outline-primary rounded-pill px-4">
            <i className="bi bi-arrow-repeat me-1"></i> Sincronizar
          </button>
          <button className="btn btn-outline-info rounded-pill px-4">
            <i className="bi bi-info-circle me-1"></i> Estado
          </button>
        </div>
        <div className="mt-3 text-center">
          <small className="text-muted">
            Última sincronización: hace 2 minutos
          </small>
        </div>
      </Card.Body>
    </Card>
  )
}

export default StatsCard