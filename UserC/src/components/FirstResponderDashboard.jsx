import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { 
  Shield, 
  LogOut, 
  Inbox, 
  Activity, 
  MapPin, 
  ClipboardList, 
  Crosshair, 
  Save,
  Check,
  CheckCircle2
} from 'lucide-react'

const FirstResponderDashboard = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [publicReports, setPublicReports] = useState([])
  const [groundReports, setGroundReports] = useState([])
  const [responderUpdates, setResponderUpdates] = useState([])
  const [resourceAllocations, setResourceAllocations] = useState([])
  const [gpsStatus, setGpsStatus] = useState('Location: Click "Get Precise GPS" for exact coordinates')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isWatchingLocation, setIsWatchingLocation] = useState(false)
  const [watchId, setWatchId] = useState(null)
  
  const mapFRRef = useRef(null)

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchAllData()
    return () => {
      // Clean up continuous location tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Fetch reports, updates, and resource allocations from Supabase
  const fetchAllData = async () => {
    try {
      const responderId = session?.user?.id
      
      // Public Reports (incidents that need response)
      const { data: reports } = await supabase
        .from('public_reports')
        .select('*')
        .in('status', ['Pending', 'Acknowledged'])
        .order('created_at', { ascending: false })
      setPublicReports(reports || [])
      
      // Ground Reports from NGOs (for situational awareness)
      const { data: groundReports } = await supabase
        .from('ground_reports')
        .select(`
          *,
          users (*)
        `)
        .order('created_at', { ascending: false })
      setGroundReports(groundReports || [])
      
      // My Responder Updates
      const { data: updates } = await supabase
        .from('responder_updates')
        .select(`
          *,
          public_reports (*)
        `)
        .eq('responder_id', responderId)
        .order('created_at', { ascending: false })
      setResponderUpdates(updates || [])
      
      // Approved Resource Allocations
      const { data: allocations } = await supabase
        .from('resource_allocations')
        .select(`
          *,
          relief_resources (*),
          users (*)
        `)
        .eq('status', 'Allocated')
        .order('created_at', { ascending: false })
      setResourceAllocations(allocations || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Insert responder update into Supabase
  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const incidentId = formData.get('incident_id')
      const status = formData.get('status')
      
      if (!incidentId) {
        alert('Please select an incident to update')
        return
      }
      
      const update = {
        incident_id: incidentId,
        status: status,
        responder_id: session?.user?.id
      }
      
      const { error } = await supabase.from('responder_updates').insert([update])
      if (error) {
        console.error('Error submitting update:', error)
        alert('Error submitting update')
        return
      }
      
      // Update the public report status
      if (status === 'Resolved') {
        await supabase
          .from('public_reports')
          .update({ status: 'Resolved' })
          .eq('id', incidentId)
      } else {
        await supabase
          .from('public_reports')
          .update({ status: 'Acknowledged' })
          .eq('id', incidentId)
      }
      
      fetchAllData()
      e.target.reset()
      alert('Status update submitted successfully!')
    } catch (error) {
      console.error('Error submitting update:', error)
      alert('Error submitting update')
    }
  }

  // Acknowledge incident (mark as being handled)
  const handleAcknowledgeIncident = async (incidentId) => {
    try {
      await supabase
        .from('public_reports')
        .update({ status: 'Acknowledged' })
        .eq('id', incidentId)
      
      fetchAllData()
      alert('Incident acknowledged!')
    } catch (error) {
      console.error('Error acknowledging incident:', error)
      alert('Error acknowledging incident')
    }
  }

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Location: GPS not supported by this browser')
      alert('GPS is not supported by your browser')
      return
    }

    setIsLoadingLocation(true)
    setGpsStatus('Location: Acquiring high-precision GPS signal...')

    // Ultra-high precision GPS options
    const highPrecisionOptions = {
      enableHighAccuracy: true,
      timeout: 120000, // 2 minutes for maximum precision
      maximumAge: 0 // Never use cached location
    }

    // Try multiple times to get the best accuracy
    let attempts = 0
    const maxAttempts = 5
    let bestPosition = null
    let bestAccuracy = Infinity

    const attemptHighPrecisionGPS = () => {
      attempts++
      setGpsStatus(`Location: Attempt ${attempts}/${maxAttempts} - Getting precise GPS...`)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const accuracy = position.coords.accuracy
          
          console.log(`GPS Attempt ${attempts}: Accuracy = ${accuracy}m`, position.coords)
          
          // Only keep positions with reasonable accuracy (under 100m)
          if (accuracy < bestAccuracy && accuracy <= 100) {
            bestAccuracy = accuracy
            bestPosition = position
            setGpsStatus(`Location: Found better accuracy: ±${Math.round(accuracy)}m`)
          }
          
          // If we have good accuracy (under 20m) or tried enough times, use best position
          if (accuracy <= 20 || attempts >= maxAttempts) {
            if (bestPosition && bestAccuracy <= 100) {
              showPreciseLocation(bestPosition)
            } else {
              // If no good accuracy found, try with different options
              retryWithDifferentSettings()
            }
          } else {
            // Wait a bit and try again for better accuracy
            setTimeout(attemptHighPrecisionGPS, 2000)
          }
        },
        (error) => {
          console.error(`GPS Attempt ${attempts} failed:`, error)
          
          if (attempts < maxAttempts) {
            // Try again with shorter timeout
            setTimeout(attemptHighPrecisionGPS, 1000)
          } else {
            handleGPSError(error)
          }
        },
        highPrecisionOptions
      )
    }

    const retryWithDifferentSettings = () => {
      setGpsStatus('Location: Trying alternative GPS settings...')
      
      // Try with different settings if high precision fails
      const alternativeOptions = {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 1000 // Allow very recent cache
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.accuracy <= 1000) { // Accept up to 1km as last resort
            showPreciseLocation(position)
          } else {
            setIsLoadingLocation(false)
            setGpsStatus('Location: Unable to get precise GPS signal')
            alert('Unable to get precise location. Please:\n\n1. Enable Location Services on your device\n2. Allow high-accuracy location in browser\n3. Move to an area with better GPS signal\n4. Try again outdoors')
          }
        },
        (error) => {
          handleGPSError(error)
        },
        alternativeOptions
      )
    }

    const showPreciseLocation = (position) => {
      const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords
      const timestamp = new Date(position.timestamp)
      
      setGpsStatus(`Location: ${latitude.toFixed(8)}, ${longitude.toFixed(8)} (±${Math.round(accuracy)}m)`)
      setIsLoadingLocation(false)
      
      console.log('Final GPS Location:', {
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        timestamp: timestamp.toISOString(),
        attempts: attempts
      })
      
      // Show success message with coordinates
      const accuracyText = accuracy <= 10 ? 'Excellent' : accuracy <= 50 ? 'Good' : 'Fair'
      alert(`📍 GPS Location Found!

Coordinates:
Latitude: ${latitude.toFixed(8)}
Longitude: ${longitude.toFixed(8)}

Accuracy: ±${Math.round(accuracy)}m (${accuracyText})
Time: ${timestamp.toLocaleTimeString()}
Attempts: ${attempts}

Note: Check the Google Maps above to see Pillai College area.`)
    }

    const handleGPSError = (error) => {
      setIsLoadingLocation(false)
      let errorMessage = 'Location: GPS Error'
      
      console.error('GPS Error:', error)
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location: Permission denied'
          alert('Location access denied!\n\nTo get precise location:\n1. Click the 🔒 icon in your browser address bar\n2. Set Location to "Allow"\n3. Refresh the page and try again')
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location: GPS signal unavailable'
          alert('GPS signal not available!\n\nFor better accuracy:\n1. Go outside or near a window\n2. Enable Location Services in device settings\n3. Wait for clear sky view\n4. Try again in a few minutes')
          break
        case error.TIMEOUT:
          errorMessage = 'Location: GPS timeout'
          alert('GPS took too long to respond!\n\nTry:\n1. Moving to an area with better signal\n2. Enabling high-accuracy location mode\n3. Restarting location services')
          break
        default:
          errorMessage = 'Location: Unknown GPS error'
          alert('GPS error occurred. Please check your device location settings and try again.')
          break
      }
      
      setGpsStatus(errorMessage)
    }

    // Start the high-precision GPS process
    attemptHighPrecisionGPS()
  }

  const toggleLocationTracking = () => {
    if (isWatchingLocation) {
      // Stop watching
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        setWatchId(null)
      }
      setIsWatchingLocation(false)
      setGpsStatus('Location: Live tracking stopped')
    } else {
      // Start watching
      if (!navigator.geolocation) {
        alert('GPS is not supported by your browser')
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0 // Always get fresh location for live tracking
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const timestamp = new Date(position.timestamp)
          
          setGpsStatus(`Live: ${latitude.toFixed(8)}, ${longitude.toFixed(8)} (±${Math.round(accuracy)}m)`)
          
          console.log('Live GPS Update:', {
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
            timestamp: timestamp.toISOString()
          })
        },
        (error) => {
          console.error('Live location error:', error)
          setGpsStatus(`Live tracking error: ${error.message}`)
          // Auto-stop on persistent errors
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
            setIsWatchingLocation(false)
          }
        },
        options
      )
      
      setWatchId(id)
      setIsWatchingLocation(true)
      setGpsStatus('Location: Starting live tracking...')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString()
  }

  const totalIncidents = publicReports.length
  const acknowledgedIncidents = publicReports.filter(report => report.status === 'Acknowledged').length
  const resolvedIncidents = publicReports.filter(report => report.status === 'Resolved').length

  return (
    <>
      {/* Add custom CSS for marker animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .custom-user-marker {
          animation: pulse 2s infinite;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-300"></div>
            <span className="text-lg font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>First Responder Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-gray-300">{session?.user?.name || session?.user?.email || 'RESPONDER'}</span>
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
              <div className="h-10 w-10 rounded-md bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>First Responder Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-300 rounded-md bg-white/5 px-2 py-1 border border-white/10">
                Visible: Government & NGOs see your updates
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Incident Reports & Ground Information */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-amber-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Incident Reports & Ground Information</h3>
                  </div>
                  <span className="text-xs text-gray-400">From Public & NGOs</span>
                </div>
                
                {/* Public Incident Reports */}
                <div className="mt-3">
                  <h4 className="text-[14px] font-medium text-amber-300 mb-2">Public Incident Reports</h4>
                  <div className="space-y-2">
                    {publicReports.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No pending incidents</p>
                    ) : (
                      publicReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-semibold">{report.title}</p>
                              <p className="text-xs text-gray-400">
                                {report.location} • Status: <span className={`${
                                  report.status === 'Resolved' ? 'text-emerald-300' : 
                                  report.status === 'Acknowledged' ? 'text-amber-300' : 'text-red-300'
                                }`}>{report.status}</span>
                              </p>
                              <p className="text-xs text-gray-300 mt-1">{report.description || 'No description'}</p>
                              <p className="text-[11px] text-gray-500">{formatTime(report.created_at)}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {report.status === 'Pending' && (
                                <button 
                                  onClick={() => handleAcknowledgeIncident(report.id)}
                                  className="inline-flex items-center gap-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[12px] font-semibold px-2 py-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Acknowledge
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* NGO Ground Reports */}
                <div className="mt-4">
                  <h4 className="text-[14px] font-medium text-emerald-300 mb-2">NGO Ground Reports</h4>
                  <div className="space-y-2">
                    {groundReports.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No ground reports available</p>
                    ) : (
                      groundReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <p className="text-[13px] font-semibold">
                            {report.location} — <span className="text-xs text-gray-400">by {report.users?.name || 'NGO'}</span>
                          </p>
                          <p className="text-xs text-gray-300 mt-1">Needs: {report.needs}</p>
                          <p className="text-xs text-gray-400 mt-1">{report.description || ''}</p>
                          <p className="text-[11px] text-gray-500">{formatTime(report.created_at)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-3">Acknowledge incidents to confirm you're responding, then update status to resolved when complete.</p>
              </div>

              {/* Status & Activity Update */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Submit Status Update</h3>
                </div>
                <form onSubmit={handleStatusUpdate} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Select Incident</label>
                      <select name="incident_id" required className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                        <option value="">Choose incident to update</option>
                        {publicReports.filter(r => r.status !== 'Resolved').map((report) => (
                          <option key={report.id} value={report.id}>
                            {report.title} - {report.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Update Status</label>
                      <select name="status" required className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                        <option>In-progress</option>
                        <option>Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={handleGPS}
                        disabled={isLoadingLocation || isWatchingLocation}
                        className={`inline-flex items-center gap-2 rounded-md text-[13px] px-3 py-2 border border-white/10 transition-colors ${
                          isLoadingLocation || isWatchingLocation
                            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                      >
                        <Crosshair className={`h-4 w-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                        {isLoadingLocation ? 'Getting Location...' : 'Get Precise GPS'}
                      </button>
                      <button 
                        type="button" 
                        onClick={toggleLocationTracking}
                        disabled={isLoadingLocation}
                        className={`inline-flex items-center gap-2 rounded-md text-[13px] px-3 py-2 border border-white/10 transition-colors ${
                          isWatchingLocation
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : isLoadingLocation
                            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                      >
                        <div className={`h-2 w-2 rounded-full ${isWatchingLocation ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                        {isWatchingLocation ? 'Stop Live GPS' : 'Live GPS'}
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 max-w-xs">{gpsStatus}</span>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[14px] font-semibold px-4 py-2">
                      <Save className="h-4 w-4" />
                      Submit Update
                    </button>
                  </div>
                </form>
                
                <div className="mt-4">
                  <h4 className="text-[13.5px] font-semibold tracking-tight">My Recent Updates</h4>
                  <div className="mt-2 space-y-2">
                    {responderUpdates.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No updates submitted yet</p>
                    ) : (
                      responderUpdates.slice(0, 5).map((update) => (
                        <div key={update.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <p className="text-[13px] font-semibold">
                            {update.status} — <span className="text-xs text-gray-400">{formatTime(update.created_at)}</span>
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            Incident: {update.public_reports?.title || 'Unknown'} at {update.public_reports?.location || 'Unknown location'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* My Map & Location */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">My Map & Location</h3>
                  </div>
                  <span className="text-xs text-gray-400">Pillai College Area</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 mb-3">Showing Pillai College of Engineering, New Panvel area</p>
                <div className="mt-3 h-80 rounded-xl overflow-hidden border border-white/10">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57368.288656561206!2d73.02537454848667!3d19.012601387581306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e866de88667f%3A0xc1c5d5badc610f5f!2sPillai%20College%20of%20Engineering%2C%20New%20Panvel%20(Autonomous)!5e1!3m2!1sen!2sin!4v1758287797786!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{border: 0}} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pillai College Area Map"
                  ></iframe>
                </div>
              </div>

              {/* Approved Resource Allocations */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-amber-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Approved Resource Allocations</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Resources allocated by government for distribution</p>
                <div className="mt-3 space-y-2">
                  {resourceAllocations.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No resource allocations available</p>
                  ) : (
                    resourceAllocations.slice(0, 5).map((allocation) => (
                      <div key={allocation.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold">
                              {allocation.relief_resources?.resource_type || 'Unknown Resource'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Qty: {allocation.quantity} • Status: <span className="text-green-300">{allocation.status}</span>
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              From NGO: {allocation.users?.name || 'Unknown'}
                            </p>
                            <p className="text-[11px] text-gray-500">{formatTime(allocation.created_at)}</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Response Summary */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-amber-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Response Summary</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-[12px] text-gray-400">Total</p>
                    <p className="text-lg font-semibold">{totalIncidents}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-[12px] text-gray-400">Active</p>
                    <p className="text-lg font-semibold">{acknowledgedIncidents}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-[12px] text-gray-400">Resolved</p>
                    <p className="text-lg font-semibold">{resolvedIncidents}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default FirstResponderDashboard
