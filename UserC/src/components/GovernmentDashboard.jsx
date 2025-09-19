import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import {
  Building2,
  LogOut,
  Boxes,
  Inbox,
  Siren,
  Package,
  Map,
  Megaphone,
  Radar,
  Send,
  Plus,
  Check,
  X,
  CheckCircle
} from 'lucide-react'

const GovernmentDashboard = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [resourceAllocations, setResourceAllocations] = useState([])
  const [regionTotals, setRegionTotals] = useState({})
  const [govAlerts, setGovAlerts] = useState([])
  const [reliefResources, setReliefResources] = useState([])
  const [coordinationMsgs, setCoordinationMsgs] = useState([])
  const [coords, setCoords] = useState({})

  const allocChartRef = useRef(null)
  const mapContainerRef = useRef(null)
  const allocChart = useRef(null)
  const mapGov = useRef(null)
  const layersGov = useRef({ allocations: null, incidents: null, camps: null })

  // Fetch data from Supabase on mount
  useEffect(() => {
    initializeChart()
    initializeMap()
    fetchAllData()
    
    // Cleanup function
    return () => {
      if (allocChart.current) {
        try { allocChart.current.destroy() } catch {}
        allocChart.current = null
      }
      if (mapGov.current) {
        try { mapGov.current.remove() } catch {}
        mapGov.current = null
      }
    }
    // eslint-disable-next-line
  }, [])

  // Update chart when regionTotals change
  useEffect(() => {
    updateAllocChart()
  }, [regionTotals])

  // Fetch all dashboard data from Supabase
  const fetchAllData = async () => {
    console.log('Fetching all government dashboard data...')
    try {
      // Resource Allocations
      const { data: allocs, error: allocError } = await supabase.from('resource_allocations').select('*').order('created_at', { ascending: false })
      if (allocError) console.error('Error fetching allocations:', allocError)
      setResourceAllocations(allocs || [])
      // Calculate region totals (if needed - might need to adapt based on actual data structure)
      const totals = {}
      setRegionTotals(totals)

      // Government Alerts
      const { data: alerts, error: alertError } = await supabase.from('gov_alerts').select('*').order('created_at', { ascending: false })
      if (alertError) console.error('Error fetching alerts:', alertError)
      setGovAlerts(alerts || [])

      // Relief Resources from NGOs
      const { data: resources, error: resourceError } = await supabase.from('relief_resources').select('*').order('created_at', { ascending: false })
      if (resourceError) console.error('Error fetching resources:', resourceError)
      console.log('Fetched relief resources:', resources)
      setReliefResources(resources || [])

      // Coordination messages
      const { data: coordination, error: coordError } = await supabase.from('gov_ngo_coordination').select('*').order('created_at', { ascending: false })
      if (coordError) console.error('Error fetching coordination:', coordError)
      setCoordinationMsgs(coordination || [])
      
      console.log('All data fetched successfully')
    } catch (error) {
      console.error('Error fetching government data:', error)
    }
  }

  const initializeChart = () => {
    if (allocChartRef.current && window.Chart && !allocChart.current) {
      try {
        allocChart.current = new window.Chart(allocChartRef.current, {
          type: 'bar',
          data: {
            labels: [],
            datasets: [{
              label: 'Qty',
              data: [],
              backgroundColor: '#2dd4bf'
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
          }
        })
      } catch (error) {
        console.log('Chart initialization skipped:', error)
      }
    }
  }

  const initializeMap = () => {
    if (mapContainerRef.current && window.L && !mapGov.current) {
      try {
        // Clear any existing map container content
        if (mapContainerRef.current._leaflet_id) {
          mapContainerRef.current._leaflet_id = null
        }
        
        const centerIN = [21.15, 79.09]
        mapGov.current = window.L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView(centerIN, 5)

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapGov.current)

        layersGov.current.allocations = window.L.layerGroup().addTo(mapGov.current)
        layersGov.current.incidents = window.L.layerGroup().addTo(mapGov.current)
        layersGov.current.camps = window.L.layerGroup().addTo(mapGov.current)
      } catch (error) {
        console.log('Map initialization skipped:', error)
      }
    }
  }

  const updateAllocChart = () => {
    if (allocChart.current) {
      const labels = Object.keys(regionTotals)
      allocChart.current.data.labels = labels
      allocChart.current.data.datasets[0].data = labels.map(r => regionTotals[r])
      allocChart.current.update()
    }
  }

  const addMarker = (map, group, lat, lng, content) => {
    if (!map || !group || !window.L) return
    window.L.marker([lat, lng]).addTo(group).bindPopup(content)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Allocate resource to NGO
  const handleResourceAllocation = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const resourceId = formData.get('resource_id')
      const ngoId = formData.get('ngo_id')
      const quantity = Number(formData.get('quantity'))
      
      if (!resourceId || !ngoId) {
        alert('Please select both resource and NGO')
        return
      }
      
      const allocation = {
        resource_id: resourceId,
        ngo_id: ngoId,
        quantity: quantity,
        status: 'Allocated',
        created_by: session?.user?.id
      }
      
      const { error } = await supabase.from('resource_allocations').insert([allocation])
      if (error) {
        console.error('Error allocating resource:', error)
        alert('Error allocating resource')
        return
      }
      
      // Update resource status to Allocated
      await supabase
        .from('relief_resources')
        .update({ status: 'Allocated' })
        .eq('id', resourceId)
      
      fetchAllData()
      e.target.reset()
      alert('Resource allocated successfully!')
    } catch (error) {
      console.error('Error allocating resource:', error)
      alert('Error allocating resource')
    }
  }

  // Insert government alert into Supabase
  const handleGovAlert = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const alert = {
        hazard: formData.get('hazard'),
        severity: formData.get('severity'),
        message: formData.get('message'),
        created_by: session?.user?.id
      }
      
      console.log('Creating alert:', alert)
      
      const { data, error } = await supabase.from('gov_alerts').insert([alert])
      if (error) {
        console.error('Error creating alert:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`Error creating alert: ${error.message || JSON.stringify(error)}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Alert sent successfully!')
    } catch (error) {
      console.error('Error creating alert:', error)
      alert(`Error creating alert: ${error.message}`)
    }
  }

  // Handle resource approval/rejection
  const handleResourceApproval = async (resourceId, newStatus) => {
    console.log('Attempting to update resource:', { resourceId, newStatus })
    
    try {
      const { data, error } = await supabase
        .from('relief_resources')
        .update({ status: newStatus })
        .eq('id', resourceId)
        .select()
      
      console.log('Update result:', { data, error })
      
      if (error) {
        console.error('Error updating resource status:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`Error updating resource status: ${error.message || JSON.stringify(error)}`)
        return
      }
      
      console.log('Resource updated successfully:', data)
      fetchAllData()
      alert(`Resource ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Exception updating resource status:', error)
      alert(`Error updating resource status: ${error.message}`)
    }
  }

  // Coordination with NGOs
  const handleNGOCoordination = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const coordination = {
        gov_id: session?.user?.id,
        ngo_id: formData.get('ngo_id'),
        message: formData.get('message')
      }
      
      console.log('Creating coordination:', coordination)
      
      const { data, error } = await supabase.from('gov_ngo_coordination').insert([coordination])
      if (error) {
        console.error('Error sending coordination message:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`Error sending message: ${error.message || JSON.stringify(error)}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Coordination message sent successfully!')
    } catch (error) {
      console.error('Error sending coordination message:', error)
      alert(`Error sending message: ${error.message}`)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      return new Date(timestamp).toLocaleString()
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const totalAllocations = Array.isArray(resourceAllocations) ? resourceAllocations.reduce((sum, alloc) => sum + (Number(alloc?.quantity) || 0), 0) : 0
  const availableResources = Array.isArray(reliefResources) ? reliefResources.filter(res => res?.status === 'Available').length : 0
  const activeAlerts = Array.isArray(govAlerts) ? govAlerts.length : 0
  const coordinationMessages = Array.isArray(coordinationMsgs) ? coordinationMsgs.length : 0

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400"></div>
            <span className="text-lg font-medium tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Government Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-gray-300">{session?.user?.name || session?.user?.email || session?.name || session?.email || 'GOV'}</span>
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
              <div className="h-10 w-10 rounded-md bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-300">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Government Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-300 rounded-md bg-white/5 px-2 py-1 border border-white/10">
                Visible: NGOs, First Responders, Public (alerts)
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Resources Allocated</p>
                <Boxes className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{totalAllocations}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Available NGO Resources</p>
                <Inbox className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{availableResources}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Active Alerts</p>
                <Siren className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{activeAlerts}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Coordination Messages</p>
                <Map className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{coordinationMessages}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Allocate Resources to NGOs */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-teal-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Allocate Resources to NGOs</h3>
                  </div>
                  <span className="text-xs text-gray-400">From available NGO resources</span>
                </div>
                <form onSubmit={handleResourceAllocation} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[12.5px] text-gray-300">Available Resource</label>
                    <select name="resource_id" required className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]">
                      <option value="">Select Resource</option>
                      {reliefResources.map((resource) => (
                        <option key={`resource-${resource.id}`} value={resource.id}>
                          {resource.resource_type} (Qty: {resource.quantity}) - NGO {resource.ngo_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Allocate to NGO</label>
                    <select name="ngo_id" required className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]">
                      <option value="">Select NGO</option>
                      {reliefResources.map((resource) => (
                        <option key={`allocate-ngo-${resource.ngo_id}`} value={resource.ngo_id}>
                          NGO {resource.ngo_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Quantity</label>
                    <input name="quantity" required type="number" min="1" defaultValue="1" className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]" />
                  </div>
                  <div className="flex items-end">
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-teal-400 hover:bg-teal-300 text-black text-[14px] font-semibold py-2.5">
                      <Plus className="h-4 w-4" />
                      Allocate
                    </button>
                  </div>
                </form>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="py-2">Resource</th>
                        <th className="py-2">NGO</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {resourceAllocations.map((alloc) => (
                        <tr key={`allocation-${alloc.id}`}>
                          <td className="py-2">{alloc.relief_resources?.resource_type || alloc.resource_type || 'N/A'}</td>
                          <td className="py-2">{alloc.users?.name || alloc.ngo_id || 'Unknown'}</td>
                          <td className="py-2">{alloc.quantity}</td>
                          <td className="py-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              alloc.status === 'Allocated' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {alloc.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400">{formatTime(alloc.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {resourceAllocations.length === 0 && (
                    <p className="text-xs text-gray-400 p-4 text-center">No allocations made yet</p>
                  )}
                </div>
              </div>

              {/* Map Section */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-teal-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Resource & Incident Tracking Map</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Track resources and incidents across affected regions.</p>
                <div ref={mapContainerRef} className="h-96 rounded-xl overflow-hidden mt-4 border border-white/10"></div>
              </div>

              {/* Chart Section */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-teal-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Allocation by Region</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">Aggregated quantities by target region.</p>
                <div className="mt-4 max-w-xl">
                  <div className="w-full rounded-lg border border-white/10 p-3">
                    <canvas ref={allocChartRef} height="200"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts / Requests / Coordination */}
            <div className="space-y-6">
              {/* Issue Alerts */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-teal-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Issue Alerts</h3>
                  </div>
                  <span className="text-xs text-gray-400">SMS • Broadcast • In-app • Multilingual</span>
                </div>
                <form onSubmit={handleGovAlert} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Hazard Type</label>
                      <select name="hazard" required className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                        <option>Flood</option>
                        <option>Earthquake</option>
                        <option>Cyclone</option>
                        <option>Landslide</option>
                        <option>Fire</option>
                        <option>Industrial Accident</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Severity</label>
                      <select name="severity" required className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Message</label>
                    <textarea name="message" rows="3" required placeholder="Include location, time window, and protective actions." className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60"></textarea>
                  </div>
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-teal-400 hover:bg-teal-300 text-black text-[14px] font-semibold py-2.5">
                    <Megaphone className="h-4 w-4" />
                    Send Alert
                  </button>
                </form>
                <div className="mt-4">
                  <h4 className="text-[13.5px] font-semibold tracking-tight">Recent Alerts</h4>
                  <div className="mt-2 space-y-2">
                    {govAlerts.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No alerts sent yet</p>
                    ) : (
                      govAlerts.map((alert) => (
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
                            <Siren className="h-4 w-4 text-teal-300" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* NGO Resource Requests - Approval System */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Inbox className="h-5 w-5 text-teal-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">NGO Resource Requests</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Review and approve resources submitted by NGOs</p>
                <div className="space-y-3">
                  {reliefResources.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No resource requests pending</p>
                  ) : (
                    reliefResources.map((resource) => (
                      <div key={resource.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-[14px] font-semibold">
                                {resource.resource_type}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                resource.status === 'Available' ? 'bg-green-500/20 text-green-300' :
                                resource.status === 'Allocated' ? 'bg-yellow-500/20 text-yellow-300' :
                                resource.status === 'Used' ? 'bg-gray-500/20 text-gray-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {resource.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-300 mb-2">
                              <div>Quantity: <span className="text-white">{resource.quantity}</span></div>
                              <div>Priority: <span className={`${
                                resource.priority_level === 'Critical' ? 'text-red-300' :
                                resource.priority_level === 'High' ? 'text-orange-300' :
                                resource.priority_level === 'Medium' ? 'text-yellow-300' : 'text-green-300'
                              }`}>{resource.priority_level}</span></div>
                              <div>Location: <span className="text-white">{resource.location}</span></div>
                              <div>From: <span className="text-white">NGO {resource.ngo_id}</span></div>
                            </div>
                            <p className="text-[11px] text-gray-400">Submitted: {formatTime(resource.created_at)}</p>
                          </div>
                          {resource.status === 'Available' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleResourceApproval(resource.id, 'Allocated')}
                                className="inline-flex items-center gap-1 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-300 text-[12px] font-medium px-3 py-1.5 border border-green-500/30"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleResourceApproval(resource.id, 'Rejected')}
                                className="inline-flex items-center gap-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[12px] font-medium px-3 py-1.5 border border-red-500/30"
                              >
                                <X className="h-3 w-3" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Coordinate with NGOs */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Radar className="h-5 w-5 text-teal-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Coordinate with NGOs</h3>
                </div>
                <form onSubmit={handleNGOCoordination} className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[12.5px] text-gray-300">Select NGO</label>
                    <select name="ngo_id" required className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                      <option value="">Choose NGO</option>
                      {reliefResources.map((resource) => (
                        <option key={`coord-ngo-${resource.ngo_id}`} value={resource.ngo_id}>
                          NGO {resource.ngo_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Message</label>
                    <textarea name="message" required rows="3" placeholder="Coordination message, instructions, or requests..." className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60"></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-teal-400 hover:bg-teal-300 text-black text-[14px] font-semibold px-4 py-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  <h4 className="text-[13.5px] font-semibold tracking-tight">Recent Coordination</h4>
                  {coordinationMsgs.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No coordination messages sent yet</p>
                  ) : (
                    coordinationMsgs.map((msg) => (
                      <div key={`coord-msg-${msg.id}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-[13px] font-semibold">
                          To: NGO {msg.ngo_id || 'Unknown'} — <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                        </p>
                        <p className="text-xs text-gray-300 mt-1">{msg.message || 'No message content'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default GovernmentDashboard