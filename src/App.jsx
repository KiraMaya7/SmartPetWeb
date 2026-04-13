import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  // ========== ESTADOS PRINCIPALES ==========
  const [battery, setBattery] = useState(55)
  const [hopper, setHopper] = useState(90)
  const [nextMeal, setNextMeal] = useState('10:45:34')
  const [consumed, setConsumed] = useState(555)
  const [isConnected, setIsConnected] = useState(true)
  const [lastSync, setLastSync] = useState('hace 2 minutos')
  
  // ========== PROGRAMACIÓN DE COMIDAS ==========
  const [schedules, setSchedules] = useState([
    { id: 1, name: 'DESAYUNO', time: '08:00', amount: 150, icon: '☀️', active: true },
    { id: 2, name: 'CENA', time: '20:00', amount: 200, icon: '🌙', active: true }
  ])
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [newMealTime, setNewMealTime] = useState('12:00')
  const [newMealAmount, setNewMealAmount] = useState(100)
  
  // ========== NOTIFICACIONES ==========
  const [notification, setNotification] = useState(null)

  // ========== EFECTO: ACTUALIZAR PRÓXIMA COMIDA ==========
  useEffect(() => {
    const updateNextMeal = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      
      // Buscar la próxima comida del día
      let next = null
      let minDiff = Infinity
      
      schedules.forEach(schedule => {
        if (schedule.active) {
          const [hours, minutes] = schedule.time.split(':')
          const scheduleDate = new Date()
          scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0)
          
          let diff = scheduleDate - now
          if (diff < 0) {
            scheduleDate.setDate(scheduleDate.getDate() + 1)
            diff = scheduleDate - now
          }
          
          if (diff < minDiff) {
            minDiff = diff
            next = schedule
          }
        }
      })
      
      if (next) {
        const nextDate = new Date()
        const [hours, minutes] = next.time.split(':')
        nextDate.setHours(parseInt(hours), parseInt(minutes), 0)
        if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1)
        
        const diffSeconds = Math.floor((nextDate - now) / 1000)
        const h = Math.floor(diffSeconds / 3600)
        const m = Math.floor((diffSeconds % 3600) / 60)
        const s = diffSeconds % 60
        setNextMeal(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
      }
    }
    
    updateNextMeal()
    const interval = setInterval(updateNextMeal, 1000)
    return () => clearInterval(interval)
  }, [schedules])

  // ========== FUNCIÓN: ALIMENTAR AHORA ==========
  const handleFeedNow = (grams = 50) => {
    if (hopper <= 0) {
      showNotification('❌ No hay suficiente comida en la tolva', 'error')
      return
    }
    
    const newConsumed = consumed + grams
    const newHopper = Math.max(0, hopper - (grams / 5))
    
    setConsumed(newConsumed)
    setHopper(newHopper)
    setBattery(prev => Math.max(0, prev - 0.5))
    
    showNotification(`🦴 Alimentando: ${grams} gramos servidos`, 'success')
    
    // Simular respuesta del alimentador
    setTimeout(() => {
      console.log('Comida servida correctamente')
    }, 500)
  }
  
  // ========== FUNCIÓN: RESETEAR TOLVA ==========
  const handleResetHopper = () => {
    setHopper(100)
    showNotification('✅ Tolva reabastecida al 100%', 'success')
  }
  
  // ========== FUNCIÓN: AGREGAR COMIDA PROGRAMADA ==========
  const handleAddSchedule = () => {
    if (!newMealName.trim()) {
      showNotification('⚠️ Ingresa un nombre para la comida', 'error')
      return
    }
    
    const newSchedule = {
      id: Date.now(),
      name: newMealName.toUpperCase(),
      time: newMealTime,
      amount: newMealAmount,
      icon: newMealName.toLowerCase().includes('desayuno') ? '☀️' : 
            newMealName.toLowerCase().includes('cena') ? '🌙' : '🍽️',
      active: true
    }
    
    setSchedules([...schedules, newSchedule])
    setNewMealName('')
    setNewMealTime('12:00')
    setNewMealAmount(100)
    setShowAddForm(false)
    showNotification(`✅ Comida agregada: ${newSchedule.name}`, 'success')
  }
  
  // ========== FUNCIÓN: ELIMINAR COMIDA PROGRAMADA ==========
  const handleDeleteSchedule = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id))
    showNotification('🗑️ Horario eliminado', 'success')
  }
  
  // ========== FUNCIÓN: SINCRONIZAR CON DISPOSITIVO ==========
  const handleSync = () => {
    showNotification('🔄 Sincronizando con el alimentador...', 'info')
    
    setTimeout(() => {
      setLastSync('ahora mismo')
      setIsConnected(true)
      showNotification('✅ Sincronización completada', 'success')
    }, 1500)
  }
  
  // ========== FUNCIÓN: VER ESTADO DEL DISPOSITIVO ==========
  const handleGetStatus = () => {
    showNotification(`
      📊 ESTADO DEL DISPOSITIVO:
      🔋 Batería: ${battery}%
      🥣 Tolva: ${hopper}%
      🍽️ Comido hoy: ${consumed}gr
      📅 Comidas programadas: ${schedules.length}
    `, 'info')
  }
  
  // ========== FUNCIÓN: ANÁLISIS ==========
  const handleAnalisis = () => {
    const totalWeekly = consumed * 7
    showNotification(`
      📈 ANÁLISIS DE CONSUMO:
      🍖 Hoy: ${consumed}gr
      📅 Promedio semanal: ${totalWeekly}gr
      🎯 Recomendación: ${hopper < 30 ? 'Reabastecer tolva' : 'Todo en orden'}
    `, 'info')
  }
  
  // ========== FUNCIÓN: AJUSTES ==========
  const handleAjustes = () => {
    showNotification(`
      ⚙️ AJUSTES DISPONIBLES:
      🔔 Notificaciones: Activadas
      🌙 Modo noche: Desactivado
      📊 Reportes diarios: Activados
    `, 'info')
  }
  
  // ========== MOSTRAR NOTIFICACIÓN ==========
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }
  
  // ========== SIMULAR DESCARGA DE BATERÍA ==========
  useEffect(() => {
    const interval = setInterval(() => {
      setBattery(prev => Math.max(0, prev - 0.01))
    }, 60000) // Cada minuto
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="layout">
      
      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">🐾</div>
        <div className="menu-item active" onClick={handleGetStatus}>
          🏠
        </div>
        <div className="menu-item" onClick={handleAnalisis}>
          📊
        </div>
        <div className="menu-item" onClick={handleAjustes}>
          ⚙️
        </div>
        <div className="menu-item" onClick={handleSync}>
          🔄
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        
        {/* HEADER */}
        <div className="header">
          <div className="d-flex align-items-center gap-2">
            <span className="paw">🐾</span>
            <h4 className="m-0 fw-bold">SMARTPET DASHBOARD</h4>
          </div>
          <div className="header-right">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="user-avatar">👤</span>
          </div>
        </div>

        {/* CARD 1 - Estado del dispositivo */}
        <div className="card-box">
          <div className="row align-items-center">
            <div className="col-6">
              <p className="card-label">🔋 Estado del dispositivo</p>
              <div className="progress-bar-custom">
                <div className="progress-fill" style={{ width: `${battery}%` }}></div>
              </div>
              <span className="percentage-value">{Math.floor(battery)}%</span>
              <button className="small-btn" onClick={() => handleFeedNow(30)}>🔋 Cargar</button>
            </div>
            <div className="col-6 text-center">
              <p className="card-label">🥣 Nivel de Tolva</p>
              <div className="circle-green">
                <span>{Math.floor(hopper)}%</span>
              </div>
              <p className="success-text">
                {hopper > 70 ? '✅ Todo perfecto!' : hopper > 30 ? '⚠️ Precaución' : '❌ ¡Urgente!'}
              </p>
              <button className="small-btn-outline" onClick={handleResetHopper}>
                🔄 Reabastecer
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2 - Alimentar + Próxima comida + Ha comido */}
        <div className="card-box">
          <div className="row align-items-center">
            <div className="col-4">
              <button className="btn-feed" onClick={() => handleFeedNow(50)}>
                🦴 ALIMENTAR AHORA (50g)
              </button>
              <button className="btn-feed-small" onClick={() => handleFeedNow(25)}>
                🍖 +25g
              </button>
            </div>
            <div className="col-4 text-center">
              <p className="card-label">⏰ Próxima comida</p>
              <h2 className="time-display">{nextMeal}</h2>
              <small className="text-muted">Cuenta regresiva</small>
            </div>
            <div className="col-4 text-center">
              <p className="card-label">🍽️ Ha comido hoy</p>
              <h2 className="amount-display">{Math.floor(consumed)} gr</h2>
              <small className="text-muted">Meta: 800gr/día</small>
            </div>
          </div>
        </div>

        {/* CARD 3 - Programación de comidas */}
        <div className="card-box">
          <div className="d-flex justify-content-between align-items-center">
            <p className="card-label mb-0">📅 Programación de comidas</p>
            <button className="small-btn-add" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✖ Cancelar' : '+ Agregar'}
            </button>
          </div>
          
          {/* Formulario para agregar comida */}
          {showAddForm && (
            <div className="add-form mt-3">
              <div className="row g-2">
                <div className="col-4">
                  <input 
                    type="text" 
                    className="form-control-sm form-control"
                    placeholder="Nombre"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <input 
                    type="time" 
                    className="form-control-sm form-control"
                    value={newMealTime}
                    onChange={(e) => setNewMealTime(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <input 
                    type="number" 
                    className="form-control-sm form-control"
                    placeholder="Gramos"
                    value={newMealAmount}
                    onChange={(e) => setNewMealAmount(parseInt(e.target.value))}
                  />
                </div>
                <div className="col-2">
                  <button className="btn-save" onClick={handleAddSchedule}>💾</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Lista de comidas programadas */}
          <div className="schedule-list mt-3">
            {schedules.length === 0 ? (
              <p className="text-muted text-center">No hay comidas programadas</p>
            ) : (
              schedules.map(schedule => (
                <div key={schedule.id} className="schedule-item">
                  <div className="schedule-info">
                    <span className="schedule-icon">{schedule.icon}</span>
                    <div>
                      <strong>{schedule.name}</strong>
                      <div className="schedule-detail">
                        {schedule.time} • {schedule.amount}g
                      </div>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    ✖ ELIMINAR
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CARD 4 - Acciones rápidas */}
        <div className="card-box">
          <div className="row g-2">
            <div className="col-4">
              <button className="action-btn" onClick={handleAnalisis}>
                📊 ANÁLISIS
              </button>
            </div>
            <div className="col-4">
              <button className="action-btn" onClick={handleSync}>
                🔄 CONTROL
              </button>
            </div>
            <div className="col-4">
              <button className="action-btn" onClick={handleAjustes}>
                ⚙️ AJUSTES
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">
              📡 Última sincronización: {lastSync}
            </small>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App