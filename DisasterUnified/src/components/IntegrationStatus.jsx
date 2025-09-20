import React from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

const IntegrationStatus = () => {
  const integrations = [
    { 
      name: 'DisasterSense Landing Page', 
      status: 'complete', 
      description: 'Converted to React with speech-to-text button',
      features: ['Modern landing page', 'Speech recognition button', 'Get Started flow']
    },
    { 
      name: 'UserC Authentication', 
      status: 'complete', 
      description: 'Multi-role auth system integrated',
      features: ['Role selection', 'Demo credentials', 'Supabase integration']
    },
    { 
      name: 'Dashboard with Sidebar', 
      status: 'complete', 
      description: 'Extended sidebar with Live and Predict tabs',
      features: ['Role-based dashboard', 'Live menu item', 'Predict menu item']
    },
    { 
      name: 'LivePage (IndiaRelief)', 
      status: 'complete', 
      description: 'Real-time monitoring and alerts',
      features: ['NDMA/IMD integration', 'Social media feeds', 'API status']
    },
    { 
      name: 'PredictionPage (IndiaRisk)', 
      status: 'complete', 
      description: 'AI-powered disaster predictions',
      features: ['Multiple AI models', 'Regional analysis', 'OpenAI integration']
    },
    { 
      name: 'Speech Recognition', 
      status: 'complete', 
      description: 'Voice-to-text emergency reporting',
      features: ['Web Speech API', 'OpenAI Whisper', 'Modal interface']
    },
    { 
      name: 'React Router Setup', 
      status: 'complete', 
      description: 'Navigation flow implemented',
      features: ['Landing → Auth → Dashboard', 'Protected routes', 'Error boundaries']
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />
    }
  }

  const completedCount = integrations.filter(i => i.status === 'complete').length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">🎉 Integration Complete!</h1>
        <div className="text-6xl mb-4">
          {completedCount}/{integrations.length}
        </div>
        <p className="text-gray-400">All components successfully unified into a single React application</p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration, index) => (
          <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              {getStatusIcon(integration.status)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
                <p className="text-gray-400 mb-3">{integration.description}</p>
                <div className="flex flex-wrap gap-2">
                  {integration.features.map((feature, fIndex) => (
                    <span key={fIndex} className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-3">🚀 Ready to Launch</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-teal-300 mb-2">Quick Start:</h4>
            <code className="block bg-black/50 p-2 rounded text-gray-300">
              npm install && npm start
            </code>
          </div>
          <div>
            <h4 className="font-medium text-teal-300 mb-2">Environment:</h4>
            <p className="text-gray-400">Configure .env file with your API keys</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationStatus