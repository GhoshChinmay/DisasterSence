"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, AlertTriangle, Heart, Zap, Users, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  type: "user" | "system"
  text: string
  timestamp: Date
  sentiment?: "positive" | "negative" | "neutral"
  emotion?: "fear" | "anger" | "sadness" | "joy" | "surprise" | "disgust" | "neutral"
  urgency?: "low" | "medium" | "high" | "critical"
  category?: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue"
  confidence?: number
  language?: "en" | "hi"
}

interface DisasterChatbotProps {
  onClose?: () => void
}

export function DisasterChatbot({ onClose }: DisasterChatbotProps) {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "system",
      text: "Hello! I'm your disaster management assistant. Tap the microphone to report emergencies in English or Hindi. I'll analyze your message and categorize it for emergency response.",
      timestamp: new Date(),
    },
  ])
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "hi">("en")
  const [interimText, setInterimText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showWaveform, setShowWaveform] = useState(false)

  const recognitionRef = useRef<any | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isListening) {
      setShowWaveform(true)
    } else {
      setShowWaveform(false)
    }
  }, [isListening])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setInterimText("")
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setInterimText(interimTranscript)

        if (finalTranscript.trim()) {
          setIsTyping(true)

          const analysis = analyzeEmergencyText(finalTranscript, currentLanguage)

          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "user",
            text: finalTranscript.trim(),
            timestamp: new Date(),
            sentiment: analysis.sentiment,
            emotion: analysis.emotion,
            urgency: analysis.urgency,
            category: analysis.category,
            confidence: event.results[event.results.length - 1][0].confidence || 0.8,
            language: currentLanguage,
          }

          setMessages((prev) => [...prev, userMessage])

          setTimeout(() => {
            const systemResponse = generateSystemResponse(analysis)
            setMessages((prev) => [...prev, systemResponse])
            setIsTyping(false)
          }, 1500)

          setInterimText("")
        }
      }

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
        setInterimText("")
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimText("")
      }

      recognitionRef.current = recognition
    }
  }, [currentLanguage])

  const analyzeEmergencyText = (
    text: string,
    language: "en" | "hi",
  ): {
    sentiment: "positive" | "negative" | "neutral"
    emotion: "fear" | "anger" | "sadness" | "joy" | "surprise" | "disgust" | "neutral"
    urgency: "low" | "medium" | "high" | "critical"
    category: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue"
  } => {
    const lowerText = text.toLowerCase()

    const keywords = {
      en: {
        critical: [
          "emergency",
          "urgent",
          "help",
          "dying",
          "critical",
          "immediate",
          "now",
          "asap",
          "911",
          "life threatening",
          "severe",
          "fatal",
          "collapse",
          "explosion",
          "massive",
          "disaster",
        ],
        high: [
          "injured",
          "trapped",
          "fire",
          "flood",
          "earthquake",
          "accident",
          "serious",
          "bleeding",
          "unconscious",
          "broken bones",
          "chest pain",
          "difficulty breathing",
          "severe pain",
          "major damage",
          "structural damage",
          "gas leak",
          "electrical hazard",
        ],
        medium: [
          "problem",
          "issue",
          "concern",
          "damage",
          "broken",
          "hurt",
          "minor injury",
          "property damage",
          "power outage",
          "water damage",
          "road blocked",
        ],
        medical: [
          "injured",
          "hurt",
          "bleeding",
          "unconscious",
          "medical",
          "ambulance",
          "hospital",
          "pain",
          "sick",
          "heart attack",
          "stroke",
          "seizure",
          "allergic reaction",
          "overdose",
          "pregnancy",
          "diabetic",
          "asthma",
          "broken bone",
          "burn",
          "cut",
          "wound",
          "fever",
          "vomiting",
          "chest pain",
        ],
        fire: [
          "fire",
          "smoke",
          "burning",
          "flames",
          "explosion",
          "gas leak",
          "electrical fire",
          "forest fire",
          "building fire",
          "smoke inhalation",
          "burn",
          "hot",
          "melting",
        ],
        flood: [
          "flood",
          "water",
          "drowning",
          "river",
          "rain",
          "overflow",
          "tsunami",
          "dam break",
          "flash flood",
          "storm surge",
          "waterlogged",
          "submerged",
          "rising water",
          "evacuation",
        ],
        earthquake: [
          "earthquake",
          "shaking",
          "collapsed",
          "building",
          "structure",
          "tremor",
          "aftershock",
          "landslide",
          "rubble",
          "debris",
          "foundation",
          "cracks",
          "unstable",
        ],
        rescue: [
          "trapped",
          "stuck",
          "rescue",
          "buried",
          "missing",
          "lost",
          "stranded",
          "isolated",
          "can't move",
          "pinned down",
          "under debris",
          "need extraction",
        ],
        fear: [
          "scared",
          "terrified",
          "afraid",
          "panic",
          "frightened",
          "worried",
          "anxious",
          "nervous",
          "shaking",
          "trembling",
          "helpless",
          "desperate",
          "overwhelmed",
        ],
        anger: [
          "angry",
          "furious",
          "mad",
          "frustrated",
          "annoyed",
          "outraged",
          "livid",
          "pissed",
          "irritated",
          "fed up",
          "hate",
          "disgusted with response",
        ],
        sadness: [
          "sad",
          "crying",
          "devastated",
          "heartbroken",
          "depressed",
          "grief",
          "loss",
          "mourning",
          "hopeless",
          "despair",
          "broken",
          "destroyed",
          "ruined",
        ],
        joy: [
          "happy",
          "relieved",
          "safe",
          "rescued",
          "okay",
          "fine",
          "grateful",
          "thankful",
          "blessed",
          "survived",
          "made it",
          "all clear",
          "recovered",
        ],
        surprise: [
          "shocked",
          "surprised",
          "unexpected",
          "sudden",
          "can't believe",
          "stunned",
          "amazed",
          "astonished",
          "didn't expect",
          "out of nowhere",
        ],
        disgust: [
          "disgusting",
          "awful",
          "terrible",
          "horrible",
          "revolting",
          "sickening",
          "appalling",
          "repulsive",
          "gross",
          "nasty",
        ],
      },
      hi: {
        critical: [
          "आपातकाल",
          "तुरंत",
          "मदद",
          "बचाओ",
          "जल्दी",
          "अभी",
          "खतरा",
          "गंभीर",
          "जान का खतरा",
          "मौत",
          "घातक",
          "विनाश",
          "तबाही",
          "आपदा",
        ],
        high: [
          "घायल",
          "फंसा",
          "आग",
          "बाढ़",
          "भूकंप",
          "दुर्घटना",
          "गंभीर",
          "खून",
          "बेहोश",
          "हड्डी टूटी",
          "सांस लेने में तकलीफ",
          "तेज दर्द",
          "बड़ा नुकसान",
        ],
        medium: [
          "समस्या",
          "परेशानी",
          "चिंता",
          "नुकसान",
          "टूटा",
          "दर्द",
          "छोटी चोट",
          "संपत्ति का नुकसान",
          "बिजली गुल",
          "पानी का नुकसान",
          "रास्ता बंद",
        ],
        medical: [
          "घायल",
          "दर्द",
          "खून",
          "बेहोश",
          "डॉक्टर",
          "अस्पताल",
          "एम्बुलेंस",
          "बीमार",
          "दिल का दौरा",
          "लकवा",
          "दौरा",
          "एलर्जी",
          "ओवरडोज",
          "गर्भावस्था",
          "मधुमेह",
          "दमा",
          "हड्डी टूटी",
          "जलना",
          "कटना",
          "घाव",
          "बुखार",
          "उल्टी",
          "सीने में दर्द",
        ],
        fire: [
          "आग",
          "धुआं",
          "जल",
          "धमाका",
          "गैस",
          "बिजली की आग",
          "जंगल की आग",
          "इमारत में आग",
          "धुएं से दम घुटना",
          "जलना",
          "गर्म",
          "पिघलना",
        ],
        flood: [
          "बाढ़",
          "पानी",
          "डूब",
          "नदी",
          "बारिश",
          "तूफान",
          "बांध टूटना",
          "अचानक बाढ़",
          "पानी का तेज बहाव",
          "जलमग्न",
          "डूबा हुआ",
          "पानी बढ़ रहा",
        ],
        earthquake: ["भूकंप", "हिल", "गिर", "इमारत", "दरार", "भूस्खलन", "मलबा", "नींव", "दरारें", "अस्थिर", "झटके"],
        rescue: ["फंसा", "बचाव", "दबा", "गुम", "खो", "अकेला", "हिल नहीं सकता", "मलबे के नीचे", "निकालना", "अलग-थलग"],
        fear: ["डर", "घबरा", "परेशान", "चिंतित", "बेचैन", "कांप रहा", "हिल रहा", "असहाय", "निराश", "अभिभूत", "भयभीत"],
        anger: ["गुस्सा", "नाराज", "परेशान", "क्रोधित", "चिढ़", "गुस्से में", "झुंझला", "तंग", "नफरत", "घृणा"],
        sadness: ["दुखी", "रो", "परेशान", "उदास", "शोक", "हानि", "विलाप", "निराश", "टूटा", "बर्बाद", "नष्ट"],
        joy: ["खुश", "राहत", "सुरक्षित", "ठीक", "कृतज्ञ", "धन्यवाद", "आशीर्वाद", "बच गया", "सब ठीक", "स्वस्थ", "बरामद"],
        surprise: ["हैरान", "अचानक", "अनपेक्षित", "चौंक", "आश्चर्य", "विस्मित", "यकीन नहीं", "अचानक से", "कहीं से भी नहीं"],
        disgust: ["घिन", "बुरा", "भयानक", "घृणित", "गंदा", "बीमार करने वाला", "डरावना", "विकर्षक", "गंदा"],
      },
    }

    const currentKeywords = keywords[language]

    let urgencyScore = 0
    let urgency: "low" | "medium" | "high" | "critical" = "low"

    // Critical keywords get highest weight
    currentKeywords.critical.forEach((keyword) => {
      if (lowerText.includes(keyword)) urgencyScore += 10
    })

    // High priority keywords
    currentKeywords.high.forEach((keyword) => {
      if (lowerText.includes(keyword)) urgencyScore += 5
    })

    // Medium priority keywords
    currentKeywords.medium.forEach((keyword) => {
      if (lowerText.includes(keyword)) urgencyScore += 2
    })

    // Determine urgency based on score
    if (urgencyScore >= 10) urgency = "critical"
    else if (urgencyScore >= 5) urgency = "high"
    else if (urgencyScore >= 2) urgency = "medium"

    const categoryScores = {
      medical: 0,
      fire: 0,
      flood: 0,
      earthquake: 0,
      rescue: 0,
      general: 0,
    }

    // Score each category based on keyword matches
    Object.keys(categoryScores).forEach((cat) => {
      if (cat !== "general" && currentKeywords[cat as keyof typeof currentKeywords]) {
        currentKeywords[cat as keyof typeof currentKeywords].forEach((keyword: string) => {
          if (lowerText.includes(keyword)) {
            categoryScores[cat as keyof typeof categoryScores] += 1
          }
        })
      }
    })

    // Find the category with highest score
    let category: "medical" | "fire" | "flood" | "earthquake" | "general" | "rescue" = "general"
    let maxScore = 0
    Object.entries(categoryScores).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score
        category = cat as typeof category
      }
    })

    const emotionScores = {
      fear: 0,
      anger: 0,
      sadness: 0,
      joy: 0,
      surprise: 0,
      disgust: 0,
      neutral: 0,
    }

    // Calculate emotion scores with context weighting
    Object.keys(emotionScores).forEach((emotion) => {
      if (emotion !== "neutral" && currentKeywords[emotion as keyof typeof currentKeywords]) {
        currentKeywords[emotion as keyof typeof currentKeywords].forEach((keyword: string) => {
          if (lowerText.includes(keyword)) {
            emotionScores[emotion as keyof typeof emotionScores] += 1

            if (urgency === "critical" && (emotion === "fear" || emotion === "sadness")) {
              emotionScores[emotion as keyof typeof emotionScores] += 2
            }
            if (category !== "general" && emotion === "fear") {
              emotionScores[emotion as keyof typeof emotionScores] += 1
            }
          }
        })
      }
    })

    // Find dominant emotion
    let emotion: "fear" | "anger" | "sadness" | "joy" | "surprise" | "disgust" | "neutral" = "neutral"
    let maxEmotionScore = 0
    Object.entries(emotionScores).forEach(([emo, score]) => {
      if (score > maxEmotionScore) {
        maxEmotionScore = score
        emotion = emo as typeof emotion
      }
    })

    let sentiment: "positive" | "negative" | "neutral" = "neutral"

    // Positive indicators
    const positiveScore = emotionScores.joy + (urgency === "low" ? 2 : 0)

    // Negative indicators
    const negativeScore =
      emotionScores.fear +
      emotionScores.anger +
      emotionScores.sadness +
      emotionScores.disgust +
      (urgency === "critical" ? 3 : urgency === "high" ? 2 : 0) +
      (category !== "general" ? 1 : 0)

    if (positiveScore > negativeScore && positiveScore > 0) {
      sentiment = "positive"
    } else if (negativeScore > positiveScore && negativeScore > 0) {
      sentiment = "negative"
    }

    console.log("[v0] Analysis results:", {
      text: text.substring(0, 50),
      urgencyScore,
      categoryScores,
      emotionScores,
      sentiment,
      emotion,
      urgency,
      category,
    })

    return { sentiment, emotion, urgency, category }
  }

  const generateSystemResponse = (analysis: any): ChatMessage => {
    const responses = {
      en: {
        critical: {
          medical:
            "🚨 MEDICAL EMERGENCY! Ambulance dispatched. If conscious, stay still. If bleeding, apply pressure. Help arriving soon!",
          fire: "🚨 FIRE EMERGENCY! Fire department notified. Evacuate immediately if safe. Stay low, cover nose/mouth. Help coming!",
          flood:
            "🚨 FLOOD EMERGENCY! Rescue teams alerted. Move to higher ground immediately. Avoid walking/driving through water!",
          earthquake:
            "🚨 EARTHQUAKE EMERGENCY! Search & rescue notified. If trapped, tap/shout periodically. Conserve energy. Help coming!",
          rescue:
            "🚨 RESCUE NEEDED! Emergency teams dispatched. Stay calm, conserve energy. Make noise periodically. Help is coming!",
          general: "🚨 CRITICAL EMERGENCY! All emergency services notified. Stay safe, help is on the way!",
        },
        high: {
          medical:
            "⚠️ Medical emergency logged. Ambulance en route. Stay conscious, keep breathing steady. Help coming!",
          fire: "⚠️ Fire incident reported. Fire department responding. Evacuate safely if possible. Avoid smoke inhalation!",
          flood: "⚠️ Flood situation reported. Rescue teams alerted. Seek higher ground. Avoid flood waters!",
          earthquake:
            "⚠️ Earthquake damage reported. Assessment team dispatched. Check for injuries, avoid damaged structures!",
          rescue: "⚠️ Rescue situation logged. Teams are responding. Stay visible, make noise if safe to do so!",
          general: "⚠️ High priority emergency logged. Appropriate teams have been notified. Stay safe!",
        },
        medium: "📋 Incident recorded and logged. Local authorities will assess and respond appropriately.",
        low: "✅ Report received and documented. Thank you for the information. Monitoring the situation.",
      },
      hi: {
        critical: {
          medical: "🚨 मेडिकल इमरजेंसी! एम्बुलेंस भेजी गई। होश में हैं तो हिलें नहीं। खून बह रहा हो तो दबाएं। मदद आ रही है!",
          fire: "🚨 आग की इमरजेंसी! फायर ब्रिगेड को सूचित किया गया। तुरंत निकलें। नीचे रहें, नाक-मुंह ढकें!",
          flood: "🚨 बाढ़ की इमरजेंसी! रेस्क्यू टीम भेजी गई। ऊंची जगह जाएं। पानी में न चलें!",
          earthquake: "🚨 भूकंप इमरजेंसी! सर्च एंड रेस्क्यू को सूचित किया गया। फंसे हैं तो आवाज करें। मदद आ रही है!",
          rescue: "🚨 रेस्क्यू की जरूरत! इमरजेंसी टीम भेजी गई। शांत रहें, आवाज करते रहें। मदद आ रही है!",
          general: "🚨 गंभीर आपातकाल! सभी इमरजेंसी सेवाओं को सूचित किया गया। सुरक्षित रहें!",
        },
        high: {
          medical: "⚠️ मेडिकल इमरजेंसी दर्ज की गई। एम्बुलेंस आ रही है। होश में रहें, सांस लेते रहें!",
          fire: "⚠️ आग की घटना दर्ज की गई। फायर ब्रिगेड आ रही है। सुरक्षित तरीके से निकलें!",
          flood: "⚠️ बाढ़ की स्थिति दर्ज की गई। रेस्क्यू टीम आ रही है। ऊंची जगह जाएं!",
          earthquake: "⚠️ भूकंप का नुकसान दर्ज किया गया। टीम आ रही है। चोटों की जांच करें!",
          rescue: "⚠️ रेस्क्यू स्थिति दर्ज की गई। टीम आ रही है। दिखाई दें, आवाज करें!",
          general: "⚠️ उच्च प्राथमिकता की इमरजेंसी दर्ज की गई। उपयुक्त टीमों को सूचित किया गया!",
        },
        medium: "📋 घटना दर्ज की गई। स्थानीय अधिकारी जांच करेंगे और उचित कार्रवाई करेंगे।",
        low: "✅ रिपोर्ट प्राप्त हुई और दर्ज की गई। जानकारी के लिए धन्यवाद। स्थिति पर नजर रख रहे हैं।",
      },
    }

    const currentResponses = responses[currentLanguage]
    let responseText = currentResponses.low

    if (analysis.urgency === "critical" || analysis.urgency === "high") {
      const urgencyLevel = analysis.urgency as "critical" | "high"
      const categoryResponse =
        currentResponses[urgencyLevel][analysis.category as keyof (typeof currentResponses)[typeof urgencyLevel]]
      responseText = categoryResponse || currentResponses[urgencyLevel].general
    } else if (analysis.urgency === "medium") {
      responseText = currentResponses.medium
    }

    return {
      id: Date.now().toString() + "_system",
      type: "system",
      text: responseText,
      timestamp: new Date(),
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
      setHasPermission(true)
      setError(null)
    } catch (err) {
      setHasPermission(false)
      setError("Microphone permission denied. Please allow microphone access to use voice input.")
    }
  }

  const startListening = async () => {
    if (hasPermission === null) {
      await requestMicrophonePermission()
      return
    }

    if (hasPermission === false) {
      setError("Microphone permission is required. Please refresh and allow microphone access.")
      return
    }

    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = currentLanguage === "hi" ? "hi-IN" : "en-US"
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "fear":
        return "bg-purple-500 text-white"
      case "anger":
        return "bg-red-500 text-white"
      case "sadness":
        return "bg-blue-500 text-white"
      case "joy":
        return "bg-green-500 text-white"
      case "surprise":
        return "bg-yellow-500 text-black"
      case "disgust":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
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
      <div className="container mx-auto p-6 max-w-2xl">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Header with close button for modal */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold animate-fade-in">Disaster Management Assistant</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              variant={currentLanguage === "en" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentLanguage("en")}
              className="transition-all duration-300 hover:scale-105 text-xs"
            >
              English
            </Button>
            <Button
              variant={currentLanguage === "hi" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentLanguage("hi")}
              className="transition-all duration-300 hover:scale-105 text-xs"
            >
              हिंदी
            </Button>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {error && (
        <Alert className="m-4 animate-slide-down">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn("flex animate-message-appear", message.type === "user" ? "justify-end" : "justify-start")}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card
              className={cn(
                "max-w-[80%] transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]",
                message.type === "user" ? "bg-blue-500 text-white" : "bg-white shadow-sm",
              )}
            >
              <CardContent className="p-3">
                <p className="text-sm text-pretty">{message.text}</p>

                {message.type === "user" && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.emotion && (
                      <Badge className={cn("text-xs animate-badge-bounce", getEmotionColor(message.emotion))}>
                        {message.emotion}
                      </Badge>
                    )}
                    {message.urgency && (
                      <Badge className={cn("text-xs animate-badge-bounce", getUrgencyColor(message.urgency))}>
                        {message.urgency}
                      </Badge>
                    )}
                    {message.category && message.category !== "general" && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 animate-badge-bounce bg-white/20"
                      >
                        {getCategoryIcon(message.category)}
                        {message.category}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
              </CardContent>
            </Card>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] bg-white shadow-sm animate-typing-indicator">
              <CardContent className="p-3">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">Analyzing...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interim text display */}
        {interimText && (
          <div className="flex justify-end">
            <Card className="max-w-[80%] bg-blue-400 text-white opacity-70 animate-pulse">
              <CardContent className="p-3">
                <p className="text-sm italic">{interimText}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showWaveform && (
        <div className="flex justify-center py-2 bg-gray-50">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-waveform"
                style={{
                  animationDelay: `${i * 100}ms`,
                  height: "20px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-t bg-white p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            size="lg"
            className={cn(
              "rounded-full w-16 h-16 transition-all duration-300 transform hover:scale-110 active:scale-95",
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50"
                : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
            )}
          >
            {isListening ? <MicOff className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>

        <div className="text-center mt-2">
          <p
            className={cn(
              "text-sm text-muted-foreground transition-all duration-300",
              isListening && "animate-pulse text-blue-500",
            )}
          >
            {isListening
              ? currentLanguage === "hi"
                ? "सुन रहा हूं..."
                : "Listening..."
              : currentLanguage === "hi"
                ? "माइक दबाएं"
                : "Tap microphone to speak"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes message-appear {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes badge-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes typing-indicator {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes waveform {
          0%, 100% { height: 20px; }
          50% { height: 40px; }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
        .animate-message-appear { animation: message-appear 0.5s ease-out; }
        .animate-badge-bounce { animation: badge-bounce 0.6s ease-in-out; }
        .animate-typing-indicator { animation: typing-indicator 0.3s ease-out; }
        .animate-waveform { animation: waveform 1s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
