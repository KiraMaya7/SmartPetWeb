import React from 'react'
import { Card, Button, ProgressBar } from 'react-bootstrap'

const StatusCard = ({ battery, hopper, onFeedNow, onResetHopper }) => {
  // Calcular color según nivel de batería
  const getBatteryColor = () => {
    if (battery >= 50) return 'success'
    if (battery >= 20) return 'warning'
    return 'danger'
  }

  // Calcular ángulo para el círculo de batería
  const batteryAngle = (battery / 100) * 360

  return (
    <Card className="shadow-lg border-0 rounded-4 h-100 fade-in">
      <Card.Header className="bg-primary text-white rounded-top-4 fw-bold">
        <i className="bi bi-speedometer2 me-2"></i>
        INICIO
      </Card.Header>
      <Card.Body className="p-4">
        {/* Estado del dispositivo */}
        <h5 className="mb-3">
          <i className="bi bi-battery-full me-2"></i>
          Estado del dispositivo
        </h5>
        
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={battery >= 50 ? '#1cc88a' : battery >= 20 ? '#f6c23e' : '#e74a3b'}
                strokeWidth="12"
                strokeDasharray={`${batteryAngle * 0.94} 360`}
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
              />
            </svg>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <h2 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>
                {battery}
              </h2>
              <small className="text-muted">%</small>
            </div>
          </div>
        </div>

        {/* Nivel de Tolva */}
        <div className="mt-4">
          <h5 className="mb-3">
            <i className="bi bi-cup-straw me-2"></i>
            Nivel de Tolva
          </h5>
          <ProgressBar 
            now={hopper} 
            variant={hopper > 70 ? 'success' : hopper > 30 ? 'warning' : 'danger'}
            className="rounded-pill"
            style={{ height: '25px' }}
          />
          <div className="d-flex justify-content-between mt-2">
            <span>
              <strong>{hopper}</strong>%
            </span>
            <span className={hopper > 30 ? 'text-success' : 'text-danger'}>
              <i className={`bi ${hopper > 30 ? 'bi-emoji-smile' : 'bi-emoji-frown'}`}></i>
              {' '}{hopper > 70 ? 'Todo perfecto!' : hopper > 30 ? 'Precaución' : '¡Urgente!'}
            </span>
          </div>
        </div>

        <hr className="my-4" />

        {/* Controles manuales */}
        <h5 className="mb-3">
          <i className="bi bi-joystick me-2"></i>
          Control Manual
        </h5>
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            onClick={() => onFeedNow(50)}
            className="btn-feeder rounded-pill py-2"
          >
            <i className="bi bi-cup-hot me-2"></i>
            Alimentar Ahora (50g)
          </Button>
          <Button 
            variant="warning" 
            onClick={onResetHopper}
            className="btn-feeder rounded-pill py-2"
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Resetear Tolva
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default StatusCard