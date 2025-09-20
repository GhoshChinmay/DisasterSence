import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Home, Users, MapPin, AlertTriangle, Settings, LogOut, Activity, TrendingUp, Menu, X } from 'lucide-react'
import Live from './Live'
import Predict from './Predict'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'live', label: 'Live', icon: Activity },
    { id: 'predict', label: 'Predict', icon: TrendingUp },
    { id: 'maps', label: 'Maps', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return <Live />
      case 'predict':
        return <Predict />
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Alerts</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Deployed Teams</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <Users className="w-8 h-8 text-teal-400" />
                </div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Reports Today</p>
                    <p className="text-2xl font-bold text-white">89</p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Regions Monitored</p>
                    <p className="text-2xl font-bold text-white">150+</p>
                  </div>
                  <MapPin className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Earthquake', location: 'Mumbai, Maharashtra', time: '2 min ago', severity: 'High' },
                    { type: 'Flood', location: 'Chennai, Tamil Nadu', time: '15 min ago', severity: 'Medium' },
                    { type: 'Cyclone', location: 'Bhubaneswar, Odisha', time: '1 hour ago', severity: 'Critical' }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{alert.type}</p>
                        <p className="text-sm text-gray-400">{alert.location}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs px-2 py-1 rounded ${alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'} text-white`}>
                          {alert.severity}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveTab('live')}
                    className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-colors"
                  >
                    <Activity className="w-6 h-6 text-teal-400 mb-2" />
                    <p className="text-sm font-medium text-white">Live Updates</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('predict')}
                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
                  >
                    <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
                    <p className="text-sm font-medium text-white">Predictions</p>
                  </button>
                  <button className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <Users className="w-6 h-6 text-emerald-400 mb-2" />
                    <p className="text-sm font-medium text-white">Deploy Team</p>
                  </button>
                  <button className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
                    <p className="text-sm font-medium text-white">Send Alert</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">Feature coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-white/10 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-teal-500 to-cyan-400"></div>
            <span className="text-lg font-semibold">DisasterSense</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-white/5 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role} Access</p>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-950 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-white capitalize">
                {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Dashboard