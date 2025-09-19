import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { 
  Heart, 
  LogOut, 
  Inbox, 
  CheckCircle2, 
  Users, 
  Tent, 
  PackagePlus, 
  FileText, 
  MapPin, 
  Send, 
  Upload,
  Plus
} from 'lucide-react'

const NGODashboard = () => {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [ngoRequests, setNgoRequests] = useState([])
  const [ngoReports, setNgoReports] = useState([])
  const [ngoDeployments, setNgoDeployments] = useState([])
  const [camps, setCamps] = useState([])

  useEffect(() => {
    fetchAllData()
    // eslint-disable-next-line
  }, [])

  // Fetch all dashboard data from Supabase
  const fetchAllData = async () => {
    try {
      const ngoId = session?.user?.id
      
      // Relief Resources (submitted by this NGO)
      const { data: reqs } = await supabase
        .from('relief_resources')
        .select('*')
        .eq('ngo_id', ngoId)
        .order('created_at', { ascending: false })
      setNgoRequests(reqs || [])
      
      // Ground Reports (submitted by this NGO)
      const { data: reps } = await supabase
        .from('ground_reports')
        .select('*')
        .eq('ngo_id', ngoId)
        .order('created_at', { ascending: false })
      setNgoReports(reps || [])
      
      // Volunteer Deployments (by this NGO)
      const { data: deps } = await supabase
        .from('volunteer_deployments')
        .select('*')
        .eq('ngo_id', ngoId)
        .order('created_at', { ascending: false })
      setNgoDeployments(deps || [])
      
      // Shelter Supplies (managed by this NGO)
      const { data: campsData } = await supabase
        .from('shelter_supplies')
        .select('*')
        .eq('ngo_id', ngoId)
        .order('created_at', { ascending: false })
      setCamps(campsData || [])
    } catch (error) {
      console.error('Error fetching NGO data:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Continue despite fetch errors so dashboard still loads
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Insert relief resource into Supabase
  const handleRequest = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const resource = {
        resource_type: formData.get('resource'),
        quantity: Number(formData.get('quantity')),
        priority_level: formData.get('urgency'),
        location: formData.get('region'),
        status: 'Available',
        ngo_id: session?.user?.id || null
      }
      
      console.log('Submitting resource:', resource)
      
      const { data, error } = await supabase.from('relief_resources').insert([resource])
      if (error) {
        console.error('Error submitting resource:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`Error submitting resource: ${error.message || JSON.stringify(error)}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Relief resource submitted successfully!')
    } catch (error) {
      console.error('Error submitting resource:', error)
      console.error('Error details:', error.details, error.message)
      alert(`Error submitting resource: ${error.message}`)
    }
  }

  // Insert ground report into Supabase
  const handleReport = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const report = {
        location: formData.get('location'),
        needs_assessment: formData.get('needs'),
        situation_report: formData.get('description'),
        ngo_id: session?.user?.id || null
      }
      
      const { data, error } = await supabase.from('ground_reports').insert([report])
      if (error) {
        console.error('Error submitting report:', error)
        console.error('Error details:', error.details, error.message)
        alert(`Error submitting report: ${error.message}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Ground report submitted successfully!')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report')
    }
  }

  // Insert volunteer deployment into Supabase
  const handleDeploy = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const deployment = {
        team_name: formData.get('team'),
        team_size: Number(formData.get('size')),
        mission_type: formData.get('task'),
        deployment_area: formData.get('area'),
        status: 'Active',
        ngo_id: session?.user?.id || null
      }
      
      const { data, error } = await supabase.from('volunteer_deployments').insert([deployment])
      if (error) {
        console.error('Error creating deployment:', error)
        console.error('Error details:', error.details, error.message)
        alert(`Error creating deployment: ${error.message}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Volunteer deployment created successfully!')
    } catch (error) {
      console.error('Error creating deployment:', error)
      alert('Error creating deployment')
    }
  }

  // Insert shelter supply into Supabase
  const handleCamp = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const shelter = {
        name: formData.get('name'),
        helpline: formData.get('helpline'),
        location: formData.get('location'),
        capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
        status: 'Active',
        ngo_id: session?.user?.id || null
      }
      
      const { data, error } = await supabase.from('shelter_supplies').insert([shelter])
      if (error) {
        console.error('Error adding shelter:', error)
        console.error('Error details:', error.details, error.message)
        alert(`Error adding shelter: ${error.message}`)
        return
      }
      
      fetchAllData()
      e.target.reset()
      alert('Shelter added successfully!')
    } catch (error) {
      console.error('Error adding shelter:', error)
      alert('Error adding shelter')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString()
  }

  const totalRequests = ngoRequests.length
  const availableResources = ngoRequests.filter(req => req.status === 'Available').length
  const totalVolunteers = ngoDeployments.reduce((sum, dep) => sum + (dep.team_size || 0), 0)
  const totalCamps = camps.length

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-300"></div>
            <span className="text-lg font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>NGO / Relief Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-gray-300">{session?.user?.name || session?.user?.email || 'NGO'}</span>
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
              <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                <Heart className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>NGO / Relief Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-300 rounded-md bg-white/5 px-2 py-1 border border-white/10">
                Visible: Government (requests/reports), First Responders (activities), Public (helplines/camps)
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Resources Submitted</p>
                <Inbox className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{totalRequests}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Available</p>
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{availableResources}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Volunteers Deployed</p>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{totalVolunteers}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-gray-400">Camps Open</p>
                <Tent className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight">{totalCamps}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Submit Relief Resources */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Submit Relief Resources</h3>
                </div>
                <form onSubmit={handleRequest} className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-2">
                    <label className="text-[12.5px] text-gray-300">Resource</label>
                    <input name="resource" required placeholder="e.g., Water, Tents, Antibiotics" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Quantity</label>
                    <input name="quantity" required type="number" min="1" defaultValue="100" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Priority</label>
                    <select name="urgency" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Location</label>
                    <input name="region" required placeholder="e.g., Assam / Dibrugarh" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                  </div>
                  <div className="lg:col-span-5">
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-[14px] font-semibold py-2.5">
                      <Send className="h-4 w-4" />
                      Submit Resource
                    </button>
                  </div>
                </form>
                <div className="mt-3">
                  <h4 className="text-[13.5px] font-semibold tracking-tight">Your Relief Resources</h4>
                  <div className="mt-2 space-y-2">
                    {ngoRequests.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3">No resources submitted yet</p>
                    ) : (
                      ngoRequests.map((req, index) => (
                        <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[13px] font-semibold">{req.resource_type} • Qty {req.quantity}</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  req.status === 'Available' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  req.status === 'Allocated' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  req.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  req.status === 'Used' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                }`}>
                                  {req.status === 'Available' ? '⏳ Pending Review' :
                                   req.status === 'Allocated' ? '✅ Approved' :
                                   req.status === 'Rejected' ? '❌ Rejected' :
                                   req.status === 'Used' ? '✅ Completed' : req.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {req.location} • Priority: {req.priority_level}
                              </p>
                              {req.status === 'Available' && (
                                <p className="text-xs text-blue-300 mt-1">⏳ Awaiting government approval...</p>
                              )}
                              {req.status === 'Allocated' && (
                                <p className="text-xs text-green-300 mt-1">✅ Approved by government - ready for distribution</p>
                              )}
                              {req.status === 'Rejected' && (
                                <p className="text-xs text-red-300 mt-1">❌ Request was not approved</p>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">{formatTime(req.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Share Ground Reports */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Share Ground Reports</h3>
                </div>
                <form onSubmit={handleReport} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Location</label>
                      <input name="location" required placeholder="Area / Landmark" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Needs</label>
                      <input name="needs" required placeholder="e.g., 200 blankets, 50 ORS kits" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12.5px] text-gray-300">Description</label>
                    <textarea name="description" rows="3" required placeholder="Situation overview..." className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60"></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-[14px] font-semibold px-4 py-2">
                      <Upload className="h-4 w-4" />
                      Submit Report
                    </button>
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  {ngoReports.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No reports submitted yet</p>
                  ) : (
                    ngoReports.map((rep, index) => (
                      <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-[13px] font-semibold">
                          {rep.location} — <span className="text-xs text-gray-400">{formatTime(rep.created_at)}</span>
                        </p>
                        <p className="text-xs text-gray-300 mt-1">Needs: {rep.needs_assessment}</p>
                        <p className="text-xs text-gray-400 mt-1">{rep.situation_report}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Deploy & Camps */}
            <div className="space-y-6">
              {/* Deploy Volunteers & Aid Teams */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-[16.5px] font-semibold tracking-tight">Deploy Volunteers & Aid Teams</h3>
                </div>
                <form onSubmit={handleDeploy} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Team Name</label>
                      <input name="team" required placeholder="e.g., Relief Team A" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Size</label>
                      <input name="size" required type="number" min="1" defaultValue="10" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Task</label>
                      <input name="task" required placeholder="e.g., Food Distribution" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Target Area</label>
                      <input name="area" required placeholder="e.g., Ward 7 / Shelter-03" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-[14px] font-semibold px-4 py-2">
                      <Send className="h-4 w-4" />
                      Deploy
                    </button>
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  {ngoDeployments.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No deployments yet</p>
                  ) : (
                    ngoDeployments.map((deployment) => (
                      <div key={deployment.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[13px] font-semibold">{deployment.team_name} • {deployment.mission_type}</p>
                            <p className="text-xs text-gray-400">{deployment.deployment_area} • Size {deployment.team_size} • {deployment.status}</p>
                          </div>
                          <p className="text-[11px] text-gray-500">{formatTime(deployment.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Shelters & Supply Depots */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-300" />
                    <h3 className="text-[16.5px] font-semibold tracking-tight">Shelters & Supply Depots</h3>
                  </div>
                  <span className="text-xs text-gray-400">Public sees helplines & shelters</span>
                </div>
                <form onSubmit={handleCamp} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Shelter Name</label>
                      <input name="name" required placeholder="e.g., Community Hall Shelter" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Helpline</label>
                      <input name="helpline" required placeholder="e.g., 1800-xxxx-xxx" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-gray-300">Location</label>
                      <input name="location" required placeholder="Address / Map Link" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-gray-300">Capacity (optional)</label>
                      <input name="capacity" type="number" min="1" placeholder="Max people" className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[14px] bg-black/60" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-[14px] font-semibold px-4 py-2">
                      <Plus className="h-4 w-4" />
                      Add Shelter
                    </button>
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  {camps.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">No shelters added yet</p>
                  ) : (
                    camps.map((shelter) => (
                      <div key={shelter.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-[13px] font-semibold">
                          {shelter.name} — <span className="text-xs text-gray-400">{formatTime(shelter.created_at)}</span>
                        </p>
                        <p className="text-xs text-gray-300">Helpline: {shelter.helpline}</p>
                        <p className="text-xs text-gray-400">{shelter.location}</p>
                        {shelter.capacity && (
                          <p className="text-xs text-gray-300">Capacity: {shelter.capacity} people</p>
                        )}
                        <p className="text-xs text-gray-300">Status: {shelter.status}</p>
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

export default NGODashboard