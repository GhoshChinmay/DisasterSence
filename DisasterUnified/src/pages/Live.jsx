import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react'

const Live = () => {
  const [alerts, setAlerts] = useState([])
  const [socialFeeds, setSocialFeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API calls
    const fetchLiveData = () => {
      setLoading(true)
      
      // Simulate NDMA alerts
      setTimeout(() => {
        setAlerts([
          {
            id: 1,
            title: 'Cyclone Biparjoy Alert',
            location: 'Gujarat Coast',
            severity: 'High',
            time: '2 minutes ago',
            source: 'NDMA',
            description: 'Very severe cyclonic storm approaching Gujarat coast'
          },
          {
            id: 2,
            title: 'Heavy Rainfall Warning',
            location: 'Mumbai, Maharashtra',
            severity: 'Medium',
            time: '15 minutes ago',
            source: 'IMD',
            description: 'Heavy to very heavy rainfall expected in next 24 hours'
          },
          {
            id: 3,
            title: 'Flash Flood Alert',
            location: 'Uttarakhand',
            severity: 'Critical',
            time: '1 hour ago',
            source: 'NDMA',
            description: 'Flash flood warning issued for hill districts'
          }
        ])
        
        // Simulate social media feeds
        setSocialFeeds([
          {
            id: 1,
            platform: 'Twitter',
            content: 'Emergency services responding to flooding in Sector 15. Avoid the area. #MumbaiRains',
            author: '@MumbaiPolice',
            time: '5 min ago',
            engagement: '234 retweets'
          },
          {
            id: 2,
            platform: 'Twitter',
            content: 'Rescue operations underway in affected areas. Citizens advised to stay indoors.',
            author: '@NDMAIndia',
            time: '12 min ago',
            engagement: '156 retweets'
          },
          {
            id: 3,
            platform: 'Twitter',
            content: 'Power restoration work in progress. Expected to complete by evening.',
            author: '@MaharashtraGov',
            time: '25 min ago',
            engagement: '89 retweets'
          }
        ])
        
        setLoading(false)
      }, 1000)
    }

    fetchLiveData()
    const interval = setInterval(fetchLiveData, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Updates</h2>
          <p className="text-gray-400">Real-time disaster monitoring and social media feeds</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-sm text-gray-400">Active Alerts</p>
              <p className="text-xl font-bold text-white">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-400" />
            <div>
              <p className="text-sm text-gray-400">API Sources</p>
              <p className="text-xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-sm text-gray-400">Affected Areas</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-sm text-gray-400">Last Update</p>
              <p className="text-xl font-bold text-white">2m</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Government Alerts */}
        <div className="bg-black/40 border border-white/10 rounded-xl">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Government Alerts (NDMA/IMD)
            </h3>
            <p className="text-sm text-gray-400 mt-1">Official disaster alerts and warnings</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(alert.severity)} text-white`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </span>
                      <span>{alert.time} • {alert.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Media Feeds */}
        <div className="bg-black/40 border border-white/10 rounded-xl">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Social Media Feeds
            </h3>
            <p className="text-sm text-gray-400 mt-1">Real-time updates from social platforms</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {socialFeeds.map(feed => (
                  <div key={feed.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                        {feed.platform}
                      </span>
                      <button className="text-gray-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{feed.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-medium">{feed.author}</span>
                      <span>{feed.time} • {feed.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Integration Status */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'NDMA API', status: 'Connected', latency: '120ms', color: 'text-green-400' },
            { name: 'IMD Weather API', status: 'Connected', latency: '89ms', color: 'text-green-400' },
            { name: 'Twitter API', status: 'Connected', latency: '245ms', color: 'text-green-400' }
          ].map((api, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white">{api.name}</p>
                <p className="text-xs text-gray-400">Latency: {api.latency}</p>
              </div>
              <span className={`text-sm ${api.color}`}>● {api.status}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * API keys configured via environment variables. Live data refreshes every 30 seconds.
        </p>
      </div>
    </div>
  )
}

export default Live