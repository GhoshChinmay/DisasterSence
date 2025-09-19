import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { 
  Users, 
  LogOut, 
  AlertTriangle, 
  FileWarning, 
  Map, 
  Crosshair, 
  Send,
  X
} from 'lucide-react'

const PublicDashboard = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [shelters, setShelters] = useState([])
  const [availableResources, setAvailableResources] = useState([])
  const [coords, setCoords] = useState({ public: null })
  
  const mapPublicRef = useRef(null)
  const mapPublic = useRef(null)

  useEffect(() => {
    initializeMap()
    fetchAllData()
    return () => {
      if (mapPublic.current) {
        try { mapPublic.current.remove() } catch {}
        mapPublic.current = null
      }
    }
  }, [])

  // Fetch alerts, reports, shelters, and available resources from Supabase
  const fetchAllData = async () => {
    try {
      // Government Alerts
      const { data: alertsData } = await supabase
        .from('gov_alerts')
        .select('*')
        .order('created_at', { ascending: false })
      setAlerts(alertsData || [])
      
      // Public Reports (all reports for community awareness)
      const { data: reportsData } = await supabase
        .from('public_reports')
        .select('*')
        .order('created_at', { ascending: false })
      setReports(reportsData || [])
      
      // Shelter Supplies from NGOs
      const { data: sheltersData } = await supabase
        .from('shelter_supplies')
        .select('*')
        .order('created_at', { ascending: false })
      setShelters(sheltersData || [])
      
      // Available/Approved Resources from NGOs
      const { data: resourcesData } = await supabase
        .from('relief_resources')
        .select('*, users(name)')
        .in('status', ['Allocated', 'Available'])
        .order('created_at', { ascending: false })
      setAvailableResources(resourcesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const initializeMap = () => {
    if (mapPublicRef.current && window.L) {
      if (mapPublic.current) return
      if (mapPublicRef.current._leaflet_id) {
        try { mapPublicRef.current._leaflet_id = null } catch {}
      }
      const centerIN = [21.15, 79.09]
      mapPublic.current = window.L.map(mapPublicRef.current, { 
        zoomControl: true 
      }).setView(centerIN, 5)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapPublic.current)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Insert public report into Supabase
  const handleIncident = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      let locationText = formData.get('location')
      
      // If GPS coordinates were obtained, include them in the location
      if (coords.public) {
        const gpsCoords = `GPS: ${coords.public.lat.toFixed(6)}, ${coords.public.lng.toFixed(6)}`
        locationText = locationText.includes(',') && locationText.includes('.') ? 
          locationText : // Already has GPS coordinates
          `${locationText} (${gpsCoords})` // Add GPS coordinates
      }
      
      const report = {
        title: `${formData.get('type')} Incident`,
        description: formData.get('description') || '',
        location: locationText,
        created_by: session?.user?.id || null,
        status: 'Pending'
      }
      
      console.log('Submitting incident report:', report)
      
      const { error } = await supabase.from('public_reports').insert([report])
      if (error) {
        console.error('Error submitting report:', error)
        alert('Error submitting report')
        return
      }
      
      fetchAllData()
      e.target.reset()
      setCoords(prev => ({ ...prev, public: null }))
      document.querySelector('#public-gps-status').textContent = 'Location: unknown'
      alert('Report submitted successfully!')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report')
    }
  }

  const getGPS = (callback, statusElement) => {
    console.log('GPS function called')
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by this browser'
      statusElement.textContent = 'Location: ' + msg
      console.error(msg)
      alert('Your browser does not support location services')
      return
    }
    
    console.log('Geolocation is supported, requesting permission...')
    statusElement.textContent = 'Requesting location permission...'
    
    // Request permission first (for browsers that support it)
    if ('permissions' in navigator) {
      navigator.permissions.query({name: 'geolocation'})
        .then(result => {
          console.log('Permission state:', result.state)
          if (result.state === 'denied') {
            statusElement.textContent = 'Location: permission denied - please enable in browser settings'
            alert('Location access is blocked. Please enable location access in your browser settings and try again.')
            return
          }
          getCurrentPosition()
        })
        .catch(() => {
          console.log('Permission API not supported, trying direct access')
          getCurrentPosition()
        })
    } else {
      getCurrentPosition()
    }
    
    function getCurrentPosition() {
      statusElement.textContent = 'Getting your location...'
      console.log('Calling getCurrentPosition...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location success:', position)
          const { latitude, longitude, accuracy } = position.coords
          const coordsData = { lat: latitude, lng: longitude, accuracy }
          callback(coordsData)
          statusElement.textContent = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Location: '
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Permission denied. Please allow location access and try again.'
              alert('Location access denied. Please:\n1. Click the location icon in your browser address bar\n2. Select "Allow" for location access\n3. Try the "Use my location" button again')
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Position unavailable. Please try again.'
              break
            case error.TIMEOUT:
              errorMessage += 'Request timed out. Please try again.'
              break
            default:
              errorMessage += 'Unknown error occurred.'
              break
          }
          statusElement.textContent = errorMessage
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }

  const handleGPS = () => {
    const statusElement = document.querySelector('#public-gps-status')
    const locationInput = document.querySelector('input[name="location"]')
    
    getGPS((coordsData) => {
      console.log('GPS coordinates received:', coordsData)
      setCoords(prev => ({ ...prev, public: coordsData }))
      
      // Auto-fill the location input with coordinates
      if (locationInput) {
        locationInput.value = `${coordsData.lat.toFixed(6)}, ${coordsData.lng.toFixed(6)}`
        locationInput.style.color = '#10b981' // Green color to indicate GPS location
      }
      
      // Add marker to map if available
      if (mapPublic.current && window.L) {
        try {
          // Clear existing markers
          mapPublic.current.eachLayer((layer) => {
            if (layer instanceof window.L.Marker) {
              mapPublic.current.removeLayer(layer)
            }
          })
          
          // Add new marker
          window.L.marker([coordsData.lat, coordsData.lng])
            .addTo(mapPublic.current)
            .bindPopup(`Your position<br>Accuracy: ±${Math.round(coordsData.accuracy || 0)}m`)
            .openPopup()
          mapPublic.current.setView([coordsData.lat, coordsData.lng], 15)
        } catch (error) {
          console.log('Map marker error (non-critical):', error)
        }
      }
    }, statusElement)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString()
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-300"></div>
            <span className="text-lg font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>Public Portal</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-gray-300">{session?.user?.name || session?.user?.email || 'PUBLIC'}</span>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pb-16">
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>Public Portal</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-300 rounded-md bg-white/5 px-2 py-1 border border-white/10">
                View alerts, camps & report incidents
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Active Alerts */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-indigo-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Active Alerts</h3>
                  </div>
                  <span className="text-xs text-gray-400">From Government</span>
                </div>
                <div className="mt-3 space-y-2">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No active alerts</p>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold">
                              {alert.hazard} — <span className={`${
                                alert.severity === 'Critical' ? 'text-red-300' : 
                                alert.severity === 'High' ? 'text-orange-300' :
                                alert.severity === 'Medium' ? 'text-yellow-300' : 'text-green-300'
                              }`}>{alert.severity}</span>
                            </p>
                            <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{formatTime(alert.created_at)}</p>
                          </div>
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.severity === 'Critical' ? 'text-red-300' : 
                            alert.severity === 'High' ? 'text-orange-300' :
                            alert.severity === 'Medium' ? 'text-yellow-300' : 'text-green-300'
                          }`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Report an Incident */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-indigo-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Report an Incident</h3>
                </div>
                <form onSubmit={handleIncident} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Type</label>
                      <select name="type" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                        <option>Medical</option>
                        <option>Fire</option>
                        <option>Flooded Area</option>
                        <option>Missing Person</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[12.5px] text-gray-300">Location</label>
                      <input name="location" required placeholder="Area / Landmark" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[12.5px] text-gray-300">Contact (optional)</label>
                      <input name="contact" type="tel" placeholder="+91 XXXXX XXXXX" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      type="button" 
                      onClick={handleGPS}
                      className="inline-flex items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 text-[13px] px-3 py-2 border border-white/10"
                    >
                      <Crosshair className="h-4 w-4" />
                      Use my location
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const locationInput = document.querySelector('input[name="location"]')
                        if (locationInput) {
                          locationInput.value = ''
                          locationInput.style.color = ''
                          locationInput.focus()
                        }
                        setCoords(prev => ({ ...prev, public: null }))
                        document.querySelector('#public-gps-status').textContent = 'Location: manual entry'
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 text-[13px] px-2 py-2 border border-white/10"
                      title="Clear GPS and enter manually"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span id="public-gps-status" className="text-xs text-gray-400">Location: unknown</span>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Description</label>
                    <textarea name="description" rows="3" placeholder="Describe what happened, people affected, landmarks..." className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60"></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-black text-[14px] font-semibold px-4 py-2">
                      <Send className="h-4 w-4" />
                      Submit Incident
                    </button>
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400">Your submitted reports:</p>
                  {(() => {
                    const userReports = reports.filter(report => report.created_by === session?.user?.id)
                    return userReports.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No reports submitted yet</p>
                    ) : (
                      userReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-semibold">
                                {report.title} — <span className={`text-xs ${
                                  report.status === 'Resolved' ? 'text-green-300' :
                                  report.status === 'Acknowledged' ? 'text-yellow-300' : 'text-gray-400'
                                }`}>{report.status}</span>
                              </p>
                              <p className="text-xs text-gray-300">
                                {report.location} • {formatTime(report.created_at)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{report.description || ''}</p>
                            </div>
                            <FileWarning className="h-4 w-4 text-indigo-300" />
                          </div>
                        </div>
                      ))
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Right: Camps and Map */}
            <div className="space-y-6">
              {/* Recent Community Reports */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-indigo-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Recent Community Reports</h3>
                  </div>
                  <span className="text-xs text-gray-400">Last 10 reports</span>
                </div>
                <div className="mt-3 space-y-2">
                  {reports.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No recent reports</p>
                  ) : (
                    reports.slice(0, 10).map((report) => (
                      <div key={report.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold">
                              {report.title} — <span className={`text-xs ${
                                report.status === 'Resolved' ? 'text-green-300' :
                                report.status === 'Acknowledged' ? 'text-yellow-300' : 'text-gray-400'
                              }`}>{report.status}</span>
                            </p>
                            <p className="text-xs text-gray-300">
                              {report.location} • {formatTime(report.created_at)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {report.description ? (report.description.length > 60 ? report.description.substring(0, 60) + '...' : report.description) : ''}
                            </p>
                          </div>
                          <FileWarning className={`h-4 w-4 ${
                            report.status === 'Resolved' ? 'text-green-300' :
                            report.status === 'Acknowledged' ? 'text-yellow-300' : 'text-indigo-300'
                          }`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Resources */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Available Resources</h3>
                  </div>
                  <span className="text-xs text-gray-400">Approved by Government</span>
                </div>
                <div className="mt-3 space-y-2">
                  {availableResources.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No resources currently available</p>
                  ) : (
                    availableResources.map((resource) => (
                      <div key={resource.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[13px] font-semibold">{resource.resource_type}</p>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                resource.status === 'Allocated' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {resource.status === 'Allocated' ? '✅ Approved' : '⏳ Available'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              Qty: {resource.quantity} • Location: {resource.location}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              Priority: {resource.priority_level} • From: {resource.users?.name || 'NGO'}
                            </p>
                          </div>
                          <Users className="h-4 w-4 text-indigo-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Helplines & Nearby Shelters */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Helplines & Nearby Shelters</h3>
                  </div>
                  <span className="text-xs text-gray-400">From NGOs</span>
                </div>
                <div className="mt-3 space-y-2">
                  {shelters.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No shelters available</p>
                  ) : (
                    shelters.map((shelter) => (
                      <div key={shelter.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[13px] font-semibold">{shelter.name}</p>
                            <p className="text-xs text-gray-400">{shelter.location}</p>
                            {shelter.capacity && (
                              <p className="text-xs text-gray-300 mt-1">Capacity: {shelter.capacity}</p>
                            )}
                            {shelter.helpline && (
                              <p className="text-xs text-gray-300 mt-1">Helpline: {shelter.helpline}</p>
                            )}
                          </div>
                          <Users className="h-4 w-4 text-indigo-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Public Map */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-indigo-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Public Map</h3>
                  </div>
                  <span className="text-xs text-gray-400">Reports • Shelters • Alert areas</span>
                </div>
                <div ref={mapPublicRef} className="mt-3 h-80 rounded-xl overflow-hidden border border-white/10"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default PublicDashboard