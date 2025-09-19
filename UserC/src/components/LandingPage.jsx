import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { 
  Building2, 
  Heart, 
  Shield, 
  Users, 
  ArrowRight, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Send,
  Activity,
  Check
} from 'lucide-react'

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [heroAlertsCount, setHeroAlertsCount] = useState(0)
  const [heroTeamsCount, setHeroTeamsCount] = useState(0)
  const miniChartRef = useRef(null)
  const { session, login, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight))
      setScrollProgress(scrolled * 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch real-time data for hero section
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        console.log('Fetching hero data...')
        
        // Get active alerts count
        const { data: alerts, error: alertError } = await supabase
          .from('gov_alerts')
          .select('id')
        if (alertError) {
          console.error('Error fetching alerts:', alertError)
        } else {
          console.log('Alerts found:', alerts?.length || 0)
          setHeroAlertsCount(alerts?.length || 0)
        }
        
        // Get deployed teams count
        const { data: teams, error: teamError } = await supabase
          .from('volunteer_deployments')
          .select('id')
          .eq('status', 'Active')
        if (teamError) {
          console.error('Error fetching teams:', teamError)
        } else {
          console.log('Active teams found:', teams?.length || 0)
          setHeroTeamsCount(teams?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching hero data:', error)
      }
    }
    
    fetchHeroData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchHeroData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Initialize mini chart - wait for Chart.js to load
    let chartInstance = null
    
    const initChart = () => {
      if (miniChartRef.current && window.Chart) {
        try {
          // Destroy existing chart if it exists
          if (chartInstance) {
            chartInstance.destroy()
          }
          
          const data = Array.from({length: 10}, () => 10 + Math.floor(Math.random()*10))
          chartInstance = new window.Chart(miniChartRef.current, {
            type: 'line',
            data: { 
              labels: data.map((_, i) => i+1), 
              datasets: [{ 
                data, 
                borderColor: '#34d399', 
                backgroundColor: 'rgba(52,211,153,0.2)', 
                fill: true, 
                tension: 0.35, 
                pointRadius: 0 
              }]
            },
            options: { 
              plugins: { legend: { display: false }}, 
              scales: { x: { display: false }, y: { display: false }}, 
              responsive: true, 
              maintainAspectRatio: false 
            }
          })
        } catch (error) {
          console.log('Chart initialization skipped:', error)
        }
      }
    }

    // Try to initialize immediately, or wait for Chart.js to load
    if (window.Chart) {
      initChart()
    } else {
      const checkChart = setInterval(() => {
        if (window.Chart) {
          initChart()
          clearInterval(checkChart)
        }
      }, 100)
      
      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkChart), 5000)
    }
    
    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    }
  }, [])

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleLogin = (role, userData) => {
    login(role, userData)
    const routes = { 
      gov: '/dashboard/gov', 
      ngo: '/dashboard/ngo', 
      fr: '/dashboard/responder', 
      public: '/dashboard/public' 
    }
    navigate(routes[role] || '/')
  }

  const handleLogout = () => {
    logout()
    setSelectedRole(null)
  }

  const AuthForm = ({ role, title, icon: Icon, color, fields, submitText }) => (
    <div className={`bg-black/40 rounded-2xl p-5 border border-white/10 shadow-sm ${selectedRole === role ? 'block' : 'hidden'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="text-[18px] font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const email = (formData.get('email') || '').toString().trim()
        const password = (formData.get('password') || '').toString().trim()
        const responderId = (formData.get('id') || '').toString().trim()
        const phone = (formData.get('phone') || '').toString().trim()
        const otp = (formData.get('otp') || '').toString().trim()

        const credsOK = () => {
          if (role === 'gov') {
            return email.toLowerCase() === 'admin@gov.in' && password === 'password123'
          }
          if (role === 'ngo') {
            return email.toLowerCase() === 'ngo@gov.in' && password === 'help123'
          }
          if (role === 'fr') {
            return responderId.toUpperCase() === 'FX-1111' && password === '123456'
          }
          if (role === 'public') {
            return phone === '+91987654321' && otp === '112233'
          }
          return false
        }

        if (!credsOK()) {
          alert('Incorrect ID or password')
          return
        }

        // Create proper user data object
        let userData = {}
        if (role === 'gov' || role === 'ngo') {
          userData = {
            email: email,
            name: email.split('@')[0], // Extract name from email
          }
        } else if (role === 'fr') {
          userData = {
            email: `${responderId.toLowerCase()}@responder.gov`,
            name: `Responder ${responderId}`,
          }
        } else if (role === 'public') {
          userData = {
            email: `${phone.replace(/[^0-9]/g, '')}@public.temp`,
            name: `User ${phone}`,
          }
        }

        handleLogin(role, userData)
      }} className="space-y-3">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="text-[13px] font-medium text-gray-300">{field.label}</label>
            <input 
              required 
              type={field.type} 
              name={field.name} 
              placeholder={field.placeholder} 
              className={`mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px] placeholder-gray-500 focus:outline-none focus:ring-2 ${field.focusColor}`}
            />
          </div>
        ))}
        <button 
          type="submit" 
          className={`w-full inline-flex items-center justify-center gap-2 rounded-md ${color === 'text-teal-300' ? 'bg-teal-400 hover:bg-teal-300' : color === 'text-emerald-300' ? 'bg-emerald-500 hover:bg-emerald-400' : color === 'text-amber-300' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-indigo-500 hover:bg-indigo-400'} text-black text-[14px] font-semibold py-2.5 transition`}
        >
          <Check className="h-4 w-4" />
          {submitText}
        </button>
      </form>
    </div>
  )

  return (
    <>
      {/* Scroll Progress */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-teal-400 to-cyan-400 z-[60]" 
        style={{width: `${scrollProgress}%`}}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="h-full flex items-center justify-between">
            {/* Brand */}
            <a href="#home" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400"></div>
              <span className="text-lg font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>Disaster Operations</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="group text-sm font-medium text-white transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:100%_2px] transition-[background-size] duration-300">Home</a>
              <a href="#roles" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">Roles</a>
              <a href="#contact" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">Contact</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {session && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-gray-300">{session.user?.name || session.user?.email || session.role.toUpperCase()}</span>
                  <button 
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Panel */}
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`absolute inset-x-0 top-0 bg-gray-950/95 border-b border-white/10 px-4 sm:px-6 pt-20 pb-8 transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-4">
                <a href="#home" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-white/10 transition-colors">
                  <span className="text-base font-medium text-gray-100">Home</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#roles" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-white/10 transition-colors">
                  <span className="text-base font-medium text-gray-100">Roles</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#contact" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-white/10 transition-colors">
                  <span className="text-base font-medium text-gray-100">Contact</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Intro */}
      <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 pb-10 bg-[url('https://images.unsplash.com/photo-1495465798138-718f86fcf1f3?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">Unified Emergency Operations</p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-tight font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
                Coordinate Government, NGOs, First Responders, and the Public
              </h1>
              <p className="mt-6 text-lg text-gray-300 max-w-xl">
                Real-time allocations, alerts, deployments, and incident reporting—centralized in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#roles" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-teal-400 text-black hover:bg-teal-300 transition-all hover:scale-[1.02]">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#roles" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-white/10 text-gray-100 hover:bg-white/15 border border-white/10 transition-all hover:scale-[1.02]">
                  Select Role
                  <LayoutDashboard className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900/40">
                <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80" alt="Operations" className="w-full h-[420px] object-cover" />
                <div className="absolute top-4 right-4 backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/80 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex bg-gray-800 rounded-full items-center justify-center">
                      <Activity className="w-5 h-5 text-gray-200" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Active Alerts</p>
                      <p className="text-lg font-semibold text-white">{heroAlertsCount}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/80 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex bg-gray-800 rounded-full items-center justify-center">
                      <Users className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Teams Deployed</p>
                      <p className="text-lg font-semibold text-white">{heroTeamsCount}</p>
                    </div>
                  </div>
                  <div className="mt-3 w-44 h-16">
                    <canvas ref={miniChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="roles" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-black/40 shadow-sm border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
              Select a Role to Continue
            </h2>
            <p className="mt-3 text-gray-400 text-[15px]">
              Authenticate as a Government Agency, NGO, First Responder, or General Public.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleRoleSelect('gov')}
              className={`role-btn group h-full w-full rounded-xl transition shadow-sm border border-white/10 p-4 text-left ${selectedRole === 'gov' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">Government Agency</p>
                  <p className="text-[12.5px] text-gray-400">Allocate, alert, approve, coordinate</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('ngo')}
              className={`role-btn group h-full w-full rounded-xl transition shadow-sm border border-white/10 p-4 text-left ${selectedRole === 'ngo' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">NGO / Relief Organization</p>
                  <p className="text-[12.5px] text-gray-400">Request, deploy, report, map</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('fr')}
              className={`role-btn group h-full w-full rounded-xl transition shadow-sm border border-white/10 p-4 text-left ${selectedRole === 'fr' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">First Responder</p>
                  <p className="text-[12.5px] text-gray-400">Receive orders and update live</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('public')}
              className={`role-btn group h-full w-full rounded-xl transition shadow-sm border border-white/10 p-4 text-left ${selectedRole === 'public' ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">General Public</p>
                  <p className="text-[12.5px] text-gray-400">Get alerts, report incidents</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Auth Panels */}
      <section id="auth-panels" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AuthForm
          role="gov"
          title="Government Login"
          icon={Building2}
          color="text-teal-300"
          fields={[
            { label: "Official Email", type: "email", name: "email", placeholder: "name@agency.gov.in", focusColor: "focus:ring-teal-500/40" },
            { label: "Password", type: "password", name: "password", placeholder: "••••••••", focusColor: "focus:ring-teal-500/40" }
          ]}
          submitText="Login"
        />

        <AuthForm
          role="ngo"
          title="NGO / Relief Login"
          icon={Heart}
          color="text-emerald-300"
          fields={[
            { label: "Organization Email", type: "email", name: "email", placeholder: "name@organization.org", focusColor: "focus:ring-emerald-500/40" },
            { label: "Password", type: "password", name: "password", placeholder: "••••••••", focusColor: "focus:ring-emerald-500/40" }
          ]}
          submitText="Login"
        />

        <AuthForm
          role="fr"
          title="First Responder Login"
          icon={Shield}
          color="text-amber-300"
          fields={[
            { label: "Responder ID", type: "text", name: "id", placeholder: "FX-1111", focusColor: "focus:ring-amber-500/40" },
            { label: "Password", type: "password", name: "password", placeholder: "••••••••", focusColor: "focus:ring-amber-500/40" }
          ]}
          submitText="Login"
        />

        <AuthForm
          role="public"
          title="Public Portal"
          icon={Users}
          color="text-indigo-300"
          fields={[
            { label: "Mobile Number", type: "tel", name: "phone", placeholder: "+91 XXXXX XXXXX", focusColor: "focus:ring-indigo-500/40" },
            { label: "OTP", type: "text", name: "otp", placeholder: "123456", focusColor: "focus:ring-indigo-500/40" }
          ]}
          submitText="Verify & Enter"
        />
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6 mb-16">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>Contact & Support</h3>
              <p className="mt-2 text-gray-400 text-sm">For integration requests, support, or feedback, reach out to the coordination team.</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4 text-teal-300" />
                  support@disaster-ops.example
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4 text-teal-300" />
                  +91 1800-000-000
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-teal-300" />
                  Coordination Center, New Delhi, IN
                </div>
              </div>
            </div>
            <form className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12.5px] text-gray-300">Name</label>
                  <input name="name" required className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]" />
                </div>
                <div>
                  <label className="text-[12.5px] text-gray-300">Email</label>
                  <input name="email" type="email" required className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]" />
                </div>
              </div>
              <div>
                <label className="text-[12.5px] text-gray-300">Message</label>
                <textarea name="message" rows="4" required className="mt-1 w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-[14px]"></textarea>
              </div>
              <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-md bg-teal-400 hover:bg-teal-300 text-black text-[14px] font-semibold px-4 py-2">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Disaster Operations Platform. For coordination and public awareness purposes.</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <a href="#home" className="hover:text-gray-300">Home</a>
            <span>•</span>
            <a href="#roles" className="hover:text-gray-300">Roles</a>
            <span>•</span>
            <a href="#contact" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default LandingPage
