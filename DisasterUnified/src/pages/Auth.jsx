import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Building2, Heart, Shield, Users, Check, ArrowLeft } from 'lucide-react'

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (role, userData) => {
    login(role, userData)
    navigate('/dashboard')
  }

  const AuthForm = ({ role, title, icon: Icon, color, fields, submitText }) => (
    <div className={`bg-black/40 rounded-2xl p-6 border border-white/10 shadow-sm ${selectedRole === role ? 'block' : 'hidden'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`h-6 w-6 ${color}`} />
        <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const email = formData.get('email')?.toString().trim() || ''
        const password = formData.get('password')?.toString().trim() || ''
        
        let userData = { role }
        if (role === 'gov') userData = { ...userData, email: 'admin@gov.in', name: 'Government Admin' }
        else if (role === 'ngo') userData = { ...userData, email: 'ngo@gov.in', name: 'NGO Coordinator' }
        else if (role === 'fr') userData = { ...userData, email: 'responder@gov.in', name: 'First Responder' }
        else userData = { ...userData, email: 'public@temp.com', name: 'Public User' }

        handleLogin(role, userData)
      }} className="space-y-4">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="text-sm font-medium text-gray-300">{field.label}</label>
            <input 
              required 
              type={field.type} 
              name={field.name} 
              placeholder={field.placeholder} 
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}
        <button 
          type="submit" 
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-black text-sm font-semibold py-3 transition"
        >
          <Check className="h-4 w-4" />
          {submitText}
        </button>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />Back to Home
          </button>
          <h2 className="text-3xl font-medium text-white">Choose Your Role</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { role: 'gov', icon: Building2, title: 'Government' },
            { role: 'ngo', icon: Heart, title: 'NGO' },
            { role: 'fr', icon: Shield, title: 'First Responder' },
            { role: 'public', icon: Users, title: 'Public' }
          ].map(({ role, icon: Icon, title }) => (
            <button key={role} onClick={() => setSelectedRole(role)} className={`rounded-xl border border-white/10 p-6 ${selectedRole === role ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
              <div className="flex flex-col items-center gap-4">
                <Icon className="h-8 w-8 text-teal-300" />
                <p className="font-semibold">{title}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AuthForm role="gov" title="Government Login" icon={Building2} color="text-teal-300" fields={[{label: "Email", type: "email", name: "email", placeholder: "admin@gov.in"}]} submitText="Login" />
          <AuthForm role="ngo" title="NGO Login" icon={Heart} color="text-emerald-300" fields={[{label: "Email", type: "email", name: "email", placeholder: "ngo@gov.in"}]} submitText="Login" />
          <AuthForm role="fr" title="Responder Login" icon={Shield} color="text-amber-300" fields={[{label: "ID", type: "text", name: "id", placeholder: "FX-1111"}]} submitText="Login" />
          <AuthForm role="public" title="Public Access" icon={Users} color="text-indigo-300" fields={[{label: "Phone", type: "tel", name: "phone", placeholder: "+91987654321"}]} submitText="Enter" />
        </div>
      </div>
    </div>
  )
}

export default Auth