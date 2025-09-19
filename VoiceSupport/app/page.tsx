"use client"

import { useState } from "react"
import { DisasterChatbot } from "@/components/disaster-chatbot"
import { Button } from "@/components/ui/button"
import { Mic, Shield, AlertTriangle, Users } from "lucide-react"

export default function Home() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Main Dashboard */}
      

      <Button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-40"
      >
        <Mic className="w-6 h-6" />
      </Button>

      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-lg w-full max-w-md h-[600px] relative animate-in slide-in-from-bottom duration-300">
            <DisasterChatbot onClose={() => setIsChatbotOpen(false)} />
          </div>
        </div>
      )}
    </main>
  )
}
