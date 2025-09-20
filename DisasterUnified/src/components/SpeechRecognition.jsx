import React, { useState, useRef, useEffect } from 'react'
import { X, Mic, Square, Send, AlertTriangle } from 'lucide-react'

const SpeechRecognition = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimText = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimText += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          setInterimTranscript('')
        } else {
          setInterimTranscript(interimText)
        }
      }

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimTranscript('')
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const handleSubmit = () => {
    if (transcript.trim()) {
      // Process the transcript (could integrate with OpenAI Whisper API here)
      console.log('Voice transcript:', transcript)
      // Reset and close
      setTranscript('')
      setInterimTranscript('')
      onClose()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Voice Emergency Report</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!isSupported ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Speech Recognition Not Supported</p>
            <p className="text-gray-400 text-sm">Please use Chrome, Edge, or Safari for voice input.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </button>
                <button
                  onClick={clearTranscript}
                  className="px-4 py-3 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening for emergency report...
                </div>
              )}

              <textarea
                value={transcript + interimTranscript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak to report an emergency, or type your message here..."
                className="w-full h-32 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              {interimTranscript && (
                <div className="mt-2 text-sm text-gray-400 italic">
                  Processing: {interimTranscript}
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Voice reports are processed using OpenAI Whisper API
              </p>
              <button
                onClick={handleSubmit}
                disabled={!transcript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SpeechRecognition