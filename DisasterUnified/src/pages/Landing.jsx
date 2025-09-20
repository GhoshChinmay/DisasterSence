import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  Globe2, 
  Menu, 
  X, 
  ArrowUpRight, 
  Mail, 
  Flag,
  Map,
  UserX,
  Sparkles,
  Check,
  BrainCircuit,
  Languages,
  Users,
  BellRing,
  Clock,
  Lock,
  ChevronDown,
  Crosshair,
  Send,
  Radar,
  Megaphone,
  Mic
} from 'lucide-react'
import SpeechRecognition from '../components/SpeechRecognition'

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [langPopoverOpen, setLangPopoverOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('English')
  const [showSpeechModal, setShowSpeechModal] = useState(false)
  const miniChartRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight)
      setScrollProgress(Math.max(0, Math.min(1, scrolled)) * 100)
    }
    
    document.addEventListener('scroll', handleScroll, { passive: true })
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Initialize mini chart
    let chartInstance = null
    
    const initChart = () => {
      if (miniChartRef.current && window.Chart) {
        try {
          if (chartInstance) {
            chartInstance.destroy()
          }
          
          const data = [3,5,4,6,5,7,6,8,7,9,8,10]
          chartInstance = new window.Chart(miniChartRef.current, {
            type: 'line',
            data: {
              labels: Array.from({ length: 12 }, (_, i) => i + 1),
              datasets: [{
                data,
                tension: 0.35,
                borderColor: '#34d399',
                fill: true,
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                pointRadius: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: {
                x: { display: false },
                y: { display: false }
              }
            }
          })
        } catch (error) {
          console.log('Chart initialization skipped:', error)
        }
      }
    }

    if (window.Chart) {
      initChart()
    } else {
      const checkChart = setInterval(() => {
        if (window.Chart) {
          initChart()
          clearInterval(checkChart)
        }
      }, 100)
      
      setTimeout(() => clearInterval(checkChart), 5000)
    }
    
    return () => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    }
  }, [])

  const handleGetStarted = () => {
    navigate('/auth')
  }

  const languages = [
    { code: 'auto', name: 'Auto (System)' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'অসমীয়া' },
    { code: 'ur', name: 'اردو' },
    { code: 'ne', name: 'नेपाली' }
  ]

  return (
    <div className="antialiased bg-black text-gray-100 selection:bg-teal-400/20 selection:text-teal-200" style={{fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'}}>
      {/* Scroll Progress */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-teal-400 to-cyan-400 w-0 z-[60]" 
        style={{width: `${scrollProgress}%`}}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b bg-black/70 border-gray-900 transition-transform duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="h-full flex items-center justify-between">
            {/* Brand */}
            <a href="#home" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400"></div>
              <span className="text-lg font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>DisasterSense</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="group text-sm font-medium text-white transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:100%_2px] transition-[background-size] duration-300">
                <span>Home</span>
              </a>
              <a href="#about" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">
                <span>About</span>
              </a>
              <a href="#services" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">
                <span>Features</span>
              </a>
              <a href="#work" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">
                <span>How It Works</span>
              </a>
              <a href="#contact" className="group text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors bg-gradient-to-r from-teal-400 to-teal-400 bg-left-bottom bg-no-repeat bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300">
                <span>Contact</span>
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setLangPopoverOpen(!langPopoverOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-gray-100 hover:bg-white/15 border border-white/10 transition-all hover:scale-[1.02]"
                >
                  <Globe2 className="w-4 h-4" />
                  <span className="text-xs">{currentLang}</span>
                </button>
                {langPopoverOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur p-2 shadow-xl z-[70]">
                    <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-gray-400">Language</div>
                    <div className="grid grid-cols-2 gap-1">
                      {languages.map(lang => (
                        <button 
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang.code === 'auto' ? 'Auto' : lang.name)
                            setLangPopoverOpen(false)
                          }}
                          className="text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gray-200 border border-transparent hover:border-white/10"
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleGetStarted}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-black hover:bg-gray-200 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
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
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 pointer-events-auto opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute top-16 right-2 w-72 bg-gray-950/95 border border-gray-900 rounded-xl shadow-2xl px-4 pt-3 pb-4">
              <div className="grid gap-2">
                <a href="#home" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors">
                  <span className="text-base font-medium text-gray-100">Home</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#about" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors">
                  <span className="text-base font-medium text-gray-100">About</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#services" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors">
                  <span className="text-base font-medium text-gray-100">Features</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#work" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors">
                  <span className="text-base font-medium text-gray-100">How It Works</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#contact" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-colors">
                  <span className="text-base font-medium text-gray-100">Contact</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-teal-400 text-black hover:bg-teal-300 transition-all hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 pb-16 bg-[url('https://source.unsplash.com/1600x900/?storm,disaster')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">DisasterSense</p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-tight font-medium tracking-tight" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
                Predict. Prepare. Protect.
              </h1>
              <p className="mt-6 text-lg text-gray-300 max-w-xl">
                AI-powered predictions for Earthquakes, Floods, Cyclones, Droughts, and Wildfires.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-teal-400 text-black hover:bg-teal-300 transition-all hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-white/10 text-gray-100 hover:bg-white/15 border border-white/10 transition-all hover:scale-[1.02]">
                  <span>Report Incident</span>
                  <Flag className="w-5 h-5" />
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80" alt="Responder" className="w-9 h-9 rounded-full border-2 border-black object-cover" />
                  <img src="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1080&q=80" alt="Responder" className="w-9 h-9 rounded-full border-2 border-black object-cover" />
                  <img src="https://images.unsplash.com/photo-1635151227785-429f420c6b9d?w=1080&q=80" alt="Responder" className="w-9 h-9 rounded-full border-2 border-black object-cover" />
                  <div className="w-9 h-9 rounded-full border-2 border-black bg-teal-400 flex items-center justify-center text-black text-xs font-medium">50+</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-100">Trusted by responders in 50+ regions</p>
                  <p className="text-sm text-gray-400">Across agencies and communities</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900/40">
                <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80" alt="Operational risk map" className="w-full h-[460px] object-cover" />
                {/* Stat Badges */}
                <div className="absolute top-4 right-4 backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/80 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex bg-gray-800 rounded-full items-center justify-center">
                      <Radar className="w-5 h-5 text-gray-200" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Prediction Accuracy</p>
                      <p className="text-lg font-semibold text-white">92%+</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/80 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex bg-gray-800 rounded-full items-center justify-center">
                      <Megaphone className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Reports Today</p>
                      <p className="text-lg font-semibold text-white">+89</p>
                    </div>
                  </div>
                  {/* Mini Chart */}
                  <div className="mt-3 w-44 h-16">
                    <div className="w-full h-full">
                      <canvas ref={miniChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">About</p>
              <h2 className="mt-3 text-3xl lg:text-4xl tracking-tight font-medium text-white" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
                We don't just predict—<br />we help protect
              </h2>
              <p className="mt-6 text-gray-400 text-lg">
                DisasterSense delivers AI-driven forecasts and community reporting to reduce risk and accelerate response when disasters strike.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Map className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-xl font-medium text-white">150+</p>
                      <p className="text-sm text-gray-400">Regions Monitored</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Check className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-xl font-medium text-white">98%</p>
                      <p className="text-sm text-gray-400">Alert Delivery Rate</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a href="#work" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium bg-gray-100 text-black hover:bg-gray-200 transition-all hover:scale-[1.02]">
                  See How It Works
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=600&q=80" alt="Team" className="w-full h-56 sm:h-64 lg:h-72 object-cover border-white/10 border rounded-xl" />
              <img src="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=600&q=80" alt="Workspace" className="w-full h-56 sm:h-64 lg:h-72 object-cover border-white/10 border rounded-xl" />
              <img src="https://images.unsplash.com/photo-1635151227785-429f420c6b9d?w=600&q=80" alt="Sketching concepts" className="w-full h-56 sm:h-64 lg:h-72 object-cover border-white/10 border rounded-xl" />
              <img src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=600&q=80" alt="Collaboration session" className="w-full h-56 sm:h-64 lg:h-72 object-cover border-white/10 border rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-20 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(45,212,191,0.08),transparent_70%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">Features</p>
              <h2 className="mt-3 text-3xl lg:text-4xl tracking-tight font-medium text-white" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
                Essential tools for early warning and response
              </h2>
            </div>
            <button 
              onClick={handleGetStarted}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-gray-100 hover:bg-white/15 border border-white/10 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Prediction */}
            <div className="group relative hover:bg-black/50 transition-colors overflow-hidden bg-black/40 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-teal-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">AI Prediction</h3>
              <p className="mt-2 text-sm text-gray-400">Predict disasters with trained ML models.</p>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Seismic, hydro, and climate models</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Confidence intervals & risk scores</li>
              </ul>
            </div>

            {/* Multilingual Support */}
            <div className="group relative hover:bg-black/50 transition-colors overflow-hidden bg-black/40 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-cyan-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <Languages className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Multilingual Support</h3>
              <p className="mt-2 text-sm text-gray-400">Available in English and major Indian languages.</p>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati...</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Locale-aware CTAs and navigation</li>
              </ul>
            </div>

            {/* Crowdsourced Reports */}
            <div className="group relative hover:bg-black/50 transition-colors overflow-hidden bg-black/40 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-emerald-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Crowdsourced Reports</h3>
              <p className="mt-2 text-sm text-gray-400">Upload incidents with photos, videos, and location.</p>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Photos, videos, GPS metadata</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Verification workflows</li>
              </ul>
            </div>

            {/* Real-Time Alerts */}
            <div className="group relative hover:bg-black/50 transition-colors overflow-hidden bg-black/40 border-white/10 border rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-fuchsia-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Real-Time Alerts</h3>
              <p className="mt-2 text-sm text-gray-400">Get instant alerts for nearby disasters.</p>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Push, SMS, and email</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-300" /> Geofenced warnings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 sm:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">Contact</p>
              <h2 className="mt-3 text-3xl lg:text-4xl tracking-tight font-medium text-white" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>
                Help Us Save Lives – Report Disasters in Your Area.
              </h2>
              <p className="mt-4 text-gray-400">Share incident details or request local forecasts. We'll respond promptly.</p>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-base font-medium">Avg. response</p>
                      <p className="text-sm text-gray-400">~2 min</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-base font-medium">Data secure</p>
                      <p className="text-sm text-gray-400">End‑to‑end encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-gray-950 to-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input type="email" required className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Incident Type</label>
                  <select required className="w-full rounded-lg bg-gray-900/80 border border-white/20 px-3 py-2.5 pr-10 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none cursor-pointer">
                    <option value="">Select an incident</option>
                    <option>Earthquake</option>
                    <option>Flood</option>
                    <option>Cyclone</option>
                    <option>Drought</option>
                    <option>Wildfire</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Location</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" required className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" placeholder="Enter pincode or allow location access" />
                    <button type="button" className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-teal-500 whitespace-nowrap">
                      <Crosshair className="w-4 h-4" />
                      <span className="hidden sm:inline">Locate</span>
                      <span className="sm:hidden">GPS</span>
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Details</label>
                  <textarea rows="4" required className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" placeholder="Describe what happened, affected areas, injuries, road closures, etc."></textarea>
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-teal-400 text-black hover:bg-teal-300 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <Send className="w-4 h-4" />
                    Submit Report
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <a href="#home" className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md">
                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400"></div>
                <span className="text-base font-semibold" style={{fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'}}>DisasterSense</span>
              </a>
              <p className="mt-3 text-sm text-gray-400 max-w-md">
                AI-powered early warnings and community reporting to keep people safe before, during, and after disasters.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} DisasterSense. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <a href="#" className="text-gray-400 hover:text-gray-200">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-gray-200">Terms</a>
              <a href="#home" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200">
                Back to top
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Speech Recognition Button */}
      <button 
        onClick={() => setShowSpeechModal(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
        title="Voice Report"
      >
        <Mic className="w-8 h-8 text-white group-hover:animate-pulse" />
      </button>

      {/* Speech Recognition Modal */}
      {showSpeechModal && (
        <SpeechRecognition 
          isOpen={showSpeechModal} 
          onClose={() => setShowSpeechModal(false)} 
        />
      )}
    </div>
  )
}

export default Landing
