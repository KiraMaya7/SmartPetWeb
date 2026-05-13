import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { db, realtimeDb, ref, set } from './firebase'
import { 
  doc, onSnapshot, updateDoc, 
  getDoc, setDoc
} from 'firebase/firestore'

function App() {
  const [battery, setBattery] = useState(85)
  const [hopper, setHopper] = useState(75)
  const [nextMeal, setNextMeal] = useState('--:--:--')
  const [consumed, setConsumed] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
  const [lastSync, setLastSync] = useState('conectado')
  const [cargando, setCargando] = useState(true)
  
  const [schedules, setSchedules] = useState([])
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [newMealTime, setNewMealTime] = useState('12:00')
  const [newMealAmount, setNewMealAmount] = useState(100)
  const [tipoProgramacion, setTipoProgramacion] = useState('recurrente')
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  
  const [notification, setNotification] = useState(null)

  const dispositivoId = 'smartpet_001'

  const diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const getToday = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Cargar datos desde Firestore
  useEffect(() => {
    const dispositivoRef = doc(db, 'dispositivos', dispositivoId)
    
    const cargarDatos = async () => {
      try {
        const docSnap = await getDoc(dispositivoRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          setBattery(data.bateria || 85)
          setHopper(data.tolva || 75)
          setConsumed(data.consumidoHoy || 0)
          
          if (data.horarios && Array.isArray(data.horarios)) {
            setSchedules(data.horarios)
          }
        } else {
          await setDoc(dispositivoRef, {
            bateria: 85,
            tolva: 75,
            consumidoHoy: 0,
            limiteDiario: 500,
            horarios: [],
            creadoEn: new Date()
          })
        }
      } catch (error) {
        console.error('Error:', error)
        showNotification('Error conectando a Firebase', 'error')
      }
      setCargando(false)
    }
    
    cargarDatos()
    
    const unsubscribe = onSnapshot(dispositivoRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setBattery(data.bateria || 85)
        setHopper(data.tolva || 75)
        setConsumed(data.consumidoHoy || 0)
        if (data.horarios && Array.isArray(data.horarios)) {
          setSchedules(data.horarios)
        }
      }
    })
    
    return () => unsubscribe()
  }, [])

  const guardarHorarios = async (nuevosHorarios) => {
    try {
      const dispositivoRef = doc(db, 'dispositivos', dispositivoId)
      await updateDoc(dispositivoRef, { horarios: nuevosHorarios })
      showNotification('✅ Guardado en la nube', 'success')
      return true
    } catch (error) {
      showNotification('❌ Error al guardar', 'error')
      return false
    }
  }

  const actualizarEstado = async (nuevoConsumido, nuevaTolva, nuevaBateria) => {
    try {
      const dispositivoRef = doc(db, 'dispositivos', dispositivoId)
      await updateDoc(dispositivoRef, {
        consumidoHoy: nuevoConsumido,
        tolva: nuevaTolva,
        bateria: nuevaBateria,
        ultimaComida: new Date()
      })
      return true
    } catch (error) {
      return false
    }
  }

  // Calcular próxima comida
  useEffect(() => {
    const updateNextMeal = () => {
      const now = new Date()
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
      } else {
        setNextMeal('--:--:--')
      }
    }
    
    updateNextMeal()
    const interval = setInterval(updateNextMeal, 1000)
    return () => clearInterval(interval)
  }, [schedules])

  // ========== FUNCIÓN PRINCIPAL: ALIMENTAR AHORA ==========
  const handleFeedNow = async (grams = 50) => {
    try {
      // 1. Enviar ORDEN a Realtime Database (para que ESP32 la vea INMEDIATAMENTE)
      await set(ref(realtimeDb, `dispositivos/${dispositivoId}/alimentarAhora`), true)
      await set(ref(realtimeDb, `dispositivos/${dispositivoId}/gramosSolicitados`), grams)
      await set(ref(realtimeDb, `dispositivos/${dispositivoId}/timestampOrden`), Date.now())
      
      console.log("📡 Orden enviada a Realtime Database")

      // 2. Actualizar Firestore (para el dashboard)
      const newConsumed = consumed + grams
      const newHopper = Math.max(0, hopper - (grams / 5))
      const newBattery = Math.max(0, battery - 0.5)

      setConsumed(newConsumed)
      setHopper(newHopper)
      setBattery(newBattery)

      await actualizarEstado(newConsumed, newHopper, newBattery)

      showNotification(`🦴 Orden enviada: ${grams}g`, 'success')

    } catch (error) {
      console.error("Error en handleFeedNow:", error)
      showNotification('❌ Error enviando orden', 'error')
    }
  }
  
  const handleResetHopper = async () => {
    setHopper(100)
    await actualizarEstado(consumed, 100, battery)
    showNotification('✅ Tolva reabastecida', 'success')
  }
  
  const handleAddSchedule = async () => {
    if (!newMealName.trim()) {
      showNotification('❌ Ingresa un nombre', 'error')
      return
    }
    
    if (tipoProgramacion === 'recurrente' && selectedDays.length === 0) {
      showNotification('❌ Selecciona al menos un día', 'error')
      return
    }
    
    if (tipoProgramacion === 'fecha' && !selectedDate) {
      showNotification('❌ Selecciona una fecha', 'error')
      return
    }
    
    const newSchedule = {
      id: Date.now(),
      name: newMealName.toUpperCase(),
      time: newMealTime,
      amount: newMealAmount,
      tipo: tipoProgramacion,
      days: tipoProgramacion === 'recurrente' ? selectedDays : [],
      fecha: tipoProgramacion === 'fecha' ? selectedDate : null,
      icon: newMealName.toLowerCase().includes('desayuno') ? '☀️' : 
            newMealName.toLowerCase().includes('cena') ? '🌙' : '🍽️',
      active: true,
      created: new Date().toISOString()
    }
    
    const nuevosHorarios = [...schedules, newSchedule]
    setSchedules(nuevosHorarios)
    
    const guardado = await guardarHorarios(nuevosHorarios)
    
    if (guardado) {
      setNewMealName('')
      setNewMealTime('12:00')
      setNewMealAmount(100)
      setSelectedDays([])
      setSelectedDate('')
      setShowAddForm(false)
      showNotification(`✅ ${newSchedule.name} agregada`, 'success')
    }
  }
  
  const handleDeleteSchedule = async (id) => {
    const nuevosHorarios = schedules.filter(schedule => schedule.id !== id)
    setSchedules(nuevosHorarios)
    await guardarHorarios(nuevosHorarios)
    showNotification('🗑️ Horario eliminado', 'success')
  }

  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex))
    } else {
      setSelectedDays([...selectedDays, dayIndex])
    }
  }

  const handleSync = () => {
    showNotification('🔄 Sincronizado con la nube', 'success')
    setLastSync('ahora mismo')
  }

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p>Cargando datos de Firebase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="sidebar">
        <div className="logo">🐾</div>
        <div className="menu-item active">🏠</div>
        <div className="menu-item">📊</div>
        <div className="menu-item">⚙️</div>
        <div className="menu-item" onClick={handleSync}>🔄</div>
      </div>

      <div className="content">
        
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

        <div className="card-box">
          <div className="row align-items-center">
            <div className="col-6">
              <p className="card-label">🔋 Estado del dispositivo</p>
              <div className="progress-bar-custom">
                <div className="progress-fill" style={{ width: `${battery}%`, background: battery > 20 ? '#28a745' : '#dc3545' }}></div>
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
                {hopper > 70 ? '✅ Todo perfecto!' : hopper > 30 ? '⚠️ Precaución' : '🔴 ¡Urgente!'}
              </p>
              <button className="small-btn-outline" onClick={handleResetHopper}>
                🔄 Reabastecer
              </button>
            </div>
          </div>
        </div>

        <div className="card-box">
          <div className="row align-items-center">
            <div className="col-4">
              <button className="btn-feed" onClick={() => handleFeedNow(50)}>
                🍖 ALIMENTAR AHORA (50g)
              </button>
              <button className="btn-feed-small" onClick={() => handleFeedNow(25)}>
                ➕ +25g
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

        <div className="card-box">
          <div className="d-flex justify-content-between align-items-center">
            <p className="card-label mb-0">📅 Programación de comidas</p>
            <button className="small-btn-add" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✖ Cancelar' : '+ Agregar'}
            </button>
          </div>
          
          {showAddForm && (
            <div className="add-form mt-3">
              <div className="mb-2">
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Nombre de la comida (ej: DESAYUNO)"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <input 
                    type="time" 
                    className="form-control"
                    value={newMealTime}
                    onChange={(e) => setNewMealTime(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="Gramos"
                    value={newMealAmount}
                    onChange={(e) => setNewMealAmount(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <div className="btn-group w-100" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`btn ${tipoProgramacion === 'recurrente' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTipoProgramacion('recurrente')}
                    style={{ flex: 1, background: tipoProgramacion === 'recurrente' ? '#667eea' : '#6c757d' }}
                  >
                    🔁 Recurrente
                  </button>
                  <button 
                    className={`btn ${tipoProgramacion === 'fecha' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTipoProgramacion('fecha')}
                    style={{ flex: 1, background: tipoProgramacion === 'fecha' ? '#667eea' : '#6c757d' }}
                  >
                    📅 Fecha específica
                  </button>
                </div>
              </div>
              
              {tipoProgramacion === 'recurrente' && (
                <div className="mb-3">
                  <label>Días de la semana:</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {diasSemana.map((dia, index) => (
                      <button
                        key={index}
                        onClick={() => toggleDay(index)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          background: selectedDays.includes(index) ? '#667eea' : 'white',
                          color: selectedDays.includes(index) ? 'white' : '#333'
                        }}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {tipoProgramacion === 'fecha' && (
                <div className="mb-3">
                  <label>Fecha:</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={selectedDate}
                    min={getToday()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}
              
              <button 
                onClick={handleAddSchedule}
                style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
              >
                💾 Guardar comida programada
              </button>
            </div>
          )}
          
          <div className="schedule-list mt-3">
            {schedules.length === 0 ? (
              <p className="text-muted text-center">No hay comidas programadas</p>
            ) : (
              schedules.map(schedule => (
                <div key={schedule.id} className="schedule-item">
                  <div className="schedule-info">
                    <span className="schedule-icon">{schedule.icon || '🍽️'}</span>
                    <div>
                      <strong>{schedule.name}</strong>
                      <div className="schedule-detail">
                        {schedule.time} • {schedule.amount}g
                        {schedule.tipo === 'recurrente' && schedule.days && schedule.days.length > 0 && (
                          <span> 📅 {schedule.days.map(d => diasSemana[d]).join(', ')}</span>
                        )}
                        {schedule.tipo === 'fecha' && schedule.fecha && (
                          <span> 📆 {schedule.fecha}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-box">
          <div className="row g-2">
            <div className="col-4">
              <button className="action-btn">📊 ANÁLISIS</button>
            </div>
            <div className="col-4">
              <button className="action-btn" onClick={handleSync}>🎮 CONTROL</button>
            </div>
            <div className="col-4">
              <button className="action-btn">⚙️ AJUSTES</button>
            </div>
          </div>
          <div className="text-center mt-3">
            <small>🕐 Última sincronización: {lastSync}</small>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App