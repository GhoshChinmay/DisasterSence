import React, { useState, useEffect } from 'react'
import { TrendingUp, Brain, Cloud, Activity, AlertTriangle, MapPin, Calendar } from 'lucide-react'

const Predict = () => {
  const [predictions, setPredictions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('mumbai')
  const [timeframe, setTimeframe] = useState('7days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI prediction API calls
    const fetchPredictions = () => {
      setLoading(true)
      
      setTimeout(() => {
        setPredictions([
          {
            id: 1,
            type: 'Heavy Rainfall',
            region: 'Mumbai, Maharashtra',
            probability: 85,
            severity: 'High',
            timeframe: 'Next 3 days',
            confidence: 92,
            description: 'Monsoon system likely to cause heavy rainfall',
            aiModel: 'Weather-GPT v3.2'
          },
          {
            id: 2,
            type: 'Cyclone Formation',
            region: 'Bay of Bengal',
            probability: 67,
            severity: 'Medium',
            timeframe: 'Next 7 days',
            confidence: 78,
            description: 'Conditions favorable for cyclonic activity',
            aiModel: 'Cyclone-AI v2.1'
          },
          {
            id: 3,
            type: 'Flash Flood',
            region: 'Uttarakhand Hills',
            probability: 43,
            severity: 'Medium',
            timeframe: 'Next 5 days',
            confidence: 71,
            description: 'River levels may rise due to upstream rainfall',
            aiModel: 'Flood-Predict v1.8'
          },
          {
            id: 4,
            type: 'Heat Wave',
            region: 'Rajasthan Plains',
            probability: 91,
            severity: 'High',
            timeframe: 'Next 10 days',
            confidence: 95,
            description: 'Temperature expected to exceed 45°C',
            aiModel: 'Climate-AI v4.0'
          }
        ])
        setLoading(false)
      }, 1500)
    }

    fetchPredictions()
  }, [selectedRegion, timeframe])

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-red-400'
    if (probability >= 60) return 'text-orange-400'
    if (probability >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-orange-500'
      case 'Low': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Disaster Predictions</h2>
          <p className="text-gray-400">Machine learning powered disaster forecasting and risk analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="mumbai">Mumbai Region</option>
            <option value="delhi">Delhi NCR</option>
            <option value="chennai">Chennai Region</option>
            <option value="kolkata">Kolkata Region</option>
            <option value="bangalore">Bangalore Region</option>
          </select>
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="24hours">Next 24 Hours</option>
            <option value="7days">Next 7 Days</option>
            <option value="30days">Next 30 Days</option>
            <option value="90days">Next 90 Days</option>
          </select>
        </div>
      </div>

      {/* AI Models Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: 'Weather AI', status: 'Active', accuracy: '94%', icon: Cloud, color: 'text-blue-400' },
          { name: 'Seismic AI', status: 'Active', accuracy: '87%', icon: Activity, color: 'text-green-400' },
          { name: 'Flood AI', status: 'Training', accuracy: '91%', icon: MapPin, color: 'text-amber-400' },
          { name: 'Climate AI', status: 'Active', accuracy: '96%', icon: TrendingUp, color: 'text-purple-400' }
        ].map((model, index) => (
          <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <model.icon className={`w-8 h-8 ${model.color}`} />
              <div>
                <p className="font-medium text-white">{model.name}</p>
                <p className="text-sm text-gray-400">{model.status} • {model.accuracy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          predictions.map(prediction => (
            <div key={prediction.id} className="bg-black/40 border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{prediction.type}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {prediction.region}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded ${getSeverityColor(prediction.severity)} text-white`}>
                  {prediction.severity} Risk
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Probability</span>
                  <span className={`text-lg font-bold ${getProbabilityColor(prediction.probability)}`}>
                    {prediction.probability}%
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${prediction.probability >= 80 ? 'bg-red-500' : prediction.probability >= 60 ? 'bg-orange-500' : prediction.probability >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${prediction.probability}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Confidence</span>
                  <span className="text-white">{prediction.confidence}%</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Timeframe
                  </span>
                  <span className="text-white">{prediction.timeframe}</span>
                </div>

                <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                  {prediction.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {prediction.aiModel}
                  </span>
                  <span>Updated 5 min ago</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Risk Analysis */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Regional Risk Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-white">High Risk Areas</h4>
            <div className="space-y-2">
              {['Mumbai Coastal', 'Uttarakhand Hills', 'Rajasthan Desert'].map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
                  <span className="text-sm text-white">{area}</span>
                  <span className="text-xs text-red-400">Critical</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white">Medium Risk Areas</h4>
            <div className="space-y-2">
              {['Chennai Urban', 'Delhi NCR', 'Bangalore Tech'].map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-500/10 rounded border border-orange-500/20">
                  <span className="text-sm text-white">{area}</span>
                  <span className="text-xs text-orange-400">Moderate</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white">AI Model Performance</h4>
            <div className="space-y-2">
              {[
                { model: 'Weather Prediction', accuracy: '94%' },
                { model: 'Flood Forecasting', accuracy: '91%' },
                { model: 'Seismic Analysis', accuracy: '87%' }
              ].map((model, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-sm text-white">{model.model}</span>
                  <span className="text-xs text-green-400">{model.accuracy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Powered by OpenAI GPT-4 and specialized weather AI models. Predictions updated every 6 hours.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Predict