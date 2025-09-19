"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, AlertTriangle, Heart, Zap, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface TranscriptionResult {
  id: string
  text: string
  timestamp: Date
  sentiment: "positive" | "negative" | "neutral"
  urgency: "low" | "medium" | "high" | "critical"
  category: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue"
  confidence: number
}

export function SpeechToTextDashboard() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [results, setResults] = useState<TranscriptionResult[]>([])
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any | null>(null)
  const [interimTranscript, setInterimTranscript] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimText = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimText += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript)
          setInterimTranscript("")

          // Analyze the final transcript
          const analysis = analyzeEmergencyText(finalTranscript)
          const newResult: TranscriptionResult = {
            id: Date.now().toString(),
            text: finalTranscript.trim(),
            timestamp: new Date(),
            sentiment: analysis.sentiment,
            urgency: analysis.urgency,
            category: analysis.category,
            confidence: event.results[event.results.length - 1][0].confidence || 0.8,
          }

          setResults((prev) => [newResult, ...prev])
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
        setInterimTranscript("")
      }

      recognitionRef.current = recognition
    }
  }, [])

  const analyzeEmergencyText = (
    text: string,
  ): {
    sentiment: "positive" | "negative" | "neutral"
    urgency: "low" | "medium" | "high" | "critical"
    category: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue"
  } => {
    const lowerText = text.toLowerCase()

    // Urgency keywords
    const criticalKeywords = ["emergency", "urgent", "help", "dying", "critical", "immediate", "now", "asap"]
    const highKeywords = ["injured", "trapped", "fire", "flood", "earthquake", "accident", "serious"]
    const mediumKeywords = ["problem", "issue", "concern", "damage", "broken"]

    // Category keywords
    const medicalKeywords = ["injured", "hurt", "bleeding", "unconscious", "medical", "ambulance", "hospital", "pain"]
    const fireKeywords = ["fire", "smoke", "burning", "flames", "explosion"]
    const floodKeywords = ["flood", "water", "drowning", "river", "rain", "overflow"]
    const earthquakeKeywords = ["earthquake", "shaking", "collapsed", "building", "structure"]
    const rescueKeywords = ["trapped", "stuck", "rescue", "buried", "missing"]

    // Sentiment analysis (basic)
    const negativeKeywords = ["bad", "terrible", "awful", "disaster", "emergency", "problem"]
    const positiveKeywords = ["safe", "okay", "good", "fine", "rescued", "helped"]

    // Determine urgency
    let urgency: "low" | "medium" | "high" | "critical" = "low"
    if (criticalKeywords.some((keyword) => lowerText.includes(keyword))) {
      urgency = "critical"
    } else if (highKeywords.some((keyword) => lowerText.includes(keyword))) {
      urgency = "high"
    } else if (mediumKeywords.some((keyword) => lowerText.includes(keyword))) {
      urgency = "medium"
    }

    // Determine category
    let category: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue" = "general"
    if (medicalKeywords.some((keyword) => lowerText.includes(keyword))) {
      category = "medical"
    } else if (fireKeywords.some((keyword) => lowerText.includes(keyword))) {
      category = "fire"
    } else if (floodKeywords.some((keyword) => lowerText.includes(keyword))) {
      category = "flood"
    } else if (earthquakeKeywords.some((keyword) => lowerText.includes(keyword))) {
      category = "earthquake"
    } else if (rescueKeywords.some((keyword) => lowerText.includes(keyword))) {
      category = "rescue"
    }

    // Determine sentiment
    let sentiment: "positive" | "negative" | "neutral" = "neutral"
    const negativeCount = negativeKeywords.filter((keyword) => lowerText.includes(keyword)).length
    const positiveCount = positiveKeywords.filter((keyword) => lowerText.includes(keyword)).length

    if (negativeCount > positiveCount) {
      sentiment = "negative"
    } else if (positiveCount > negativeCount) {
      sentiment = "positive"
    }

    return { sentiment, urgency, category }
  }

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

  const clearTranscript = () => {
    setTranscript("")
    setInterimTranscript("")
    setResults([])
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return <Heart className="w-4 h-4" />
      case "fire":
        return <Zap className="w-4 h-4" />
      case "flood":
        return <MapPin className="w-4 h-4" />
      case "earthquake":
        return <AlertTriangle className="w-4 h-4" />
      case "rescue":
        return <Users className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (!isSupported) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best
            experience.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-balance">Disaster Management Speech-to-Text</h1>
        <p className="text-muted-foreground text-pretty">
          Real-time emergency reporting with intelligent analysis and categorization
        </p>
      </div>

      {error && (
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Speech Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Input
            </CardTitle>
            <CardDescription>Click to start recording emergency reports or incidents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                className="flex-1"
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button onClick={clearTranscript} variant="outline">
                Clear
              </Button>
            </div>

            {isListening && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening...
              </div>
            )}

            <Textarea
              value={transcript + interimTranscript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transcript will appear here... You can also type directly."
              className="min-h-32"
            />

            {interimTranscript && (
              <div className="text-sm text-muted-foreground italic">Processing: {interimTranscript}</div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Analysis</CardTitle>
            <CardDescription>AI-powered categorization and urgency assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No emergency reports recorded yet</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div key={result.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(result.category)}
                        <span className="font-medium capitalize">{result.category}</span>
                      </div>
                      <Badge className={cn("text-xs", getUrgencyColor(result.urgency))}>
                        {result.urgency.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-pretty">{result.text}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{result.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.sentiment}
                        </Badge>
                        <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {results.filter((r) => r.urgency === "critical").length}
                </div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {results.filter((r) => r.urgency === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {results.filter((r) => r.category === "medical").length}
                </div>
                <div className="text-sm text-muted-foreground">Medical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.length}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
