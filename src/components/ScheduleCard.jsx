import React, { useState } from 'react'
import { Card, Button, Form, Alert } from 'react-bootstrap'

const ScheduleCard = ({ schedules, onDeleteSchedule, onAddSchedule }) => {
  const [showForm, setShowForm] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: '',
    time: '12:00',
    amount: 100,
    icon: 'bi-calendar-event',
    color: 'primary'
  })

  const handleAddMeal = () => {
    if (!newMeal.name.trim()) {
      alert('Por favor ingresa un nombre para la comida')
      return
    }
    
    onAddSchedule(newMeal)
    setNewMeal({ name: '', time: '12:00', amount: 100, icon: 'bi-calendar-event', color: 'primary' })
    setShowForm(false)
  }

  return (
    <Card className="shadow-lg border-0 rounded-4 h-100 fade-in">
      <Card.Header className="bg-primary text-white rounded-top-4 fw-bold">
        <i className="bi bi-calendar-event me-2"></i>
        Programación de comidas
      </Card.Header>
      <Card.Body className="p-4">
        {/* Lista de horarios */}
        {schedules.length === 0 ? (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No hay comidas programadas
          </Alert>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="schedule-item mb-3 p-3 bg-light rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className={`bi ${schedule.icon} text-${schedule.color} fs-4 me-2`}></i>
                  <strong>{schedule.name}</strong>
                  <div className="small text-muted">
                    {schedule.time} - {schedule.amount}g
                  </div>
                </div>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onDeleteSchedule(schedule.id)}
                  className="rounded-pill"
                >
                  <i className="bi bi-trash me-1"></i>
                  ELIMINAR
                </Button>
              </div>
            </div>
          ))
        )}

        <hr />

        {/* Formulario para agregar nueva comida */}
        {!showForm ? (
          <Button 
            variant="success" 
            onClick={() => setShowForm(true)}
            className="w-100 rounded-pill py-2"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar nueva comida
          </Button>
        ) : (
          <div className="border rounded-3 p-3 bg-light">
            <h6 className="mb-3">Nueva comida</h6>
            <Form>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Nombre (ej: MERIENDA)"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({...newMeal, name: e.target.value.toUpperCase()})}
                />
              </Form.Group>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <Form.Control
                    type="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                  />
                </div>
                <div className="col-6">
                  <Form.Control
                    type="number"
                    placeholder="Gramos"
                    value={newMeal.amount}
                    onChange={(e) => setNewMeal({...newMeal, amount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-grow-1 rounded-pill">
                  Cancelar
                </Button>
                <Button variant="success" onClick={handleAddMeal} className="flex-grow-1 rounded-pill">
                  Guardar
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ScheduleCard