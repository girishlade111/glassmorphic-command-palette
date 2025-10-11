"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Maximize2, ChevronDown, Brain, ArrowUp, Plus, Sparkles } from "lucide-react"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface UnifiedInterfaceProps {
  initiallyOpen?: boolean
}

export function UnifiedInterface({ initiallyOpen = false }: UnifiedInterfaceProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with ⌘K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Handle clicks outside the command palette to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e)

    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = "auto"
    // Set the height to the scrollHeight
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  // Handle chat form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
      // Reset textarea height
      if (chatInputRef.current) {
        chatInputRef.current.style.height = "auto"
      }
    }
  }

  // Handle input blur to minimize command palette
  const handleInputBlur = () => {
    // Small timeout to allow for clicks on dropdown items
    setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center">
      {/* Command Palette - Always visible in minimized form */}
      <div
        ref={paletteRef}
        className={cn("w-full max-w-2xl transition-all duration-300 ease-in-out", isOpen ? "mb-4" : "mb-0")}
      >
        <div
          className="relative mx-auto overflow-hidden rounded-full shadow-lg cursor-pointer"
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {/* Glassmorphic container */}
          <div className="absolute inset-0 backdrop-blur-2xl bg-black/40 z-0"></div>

          {/* Border glow effect */}
          <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_10px_rgba(120,60,220,0.15)] z-0"></div>

          {/* Noise texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.02] z-0 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 flex items-center px-4 py-3">
            <Search className="h-4 w-4 text-white/70 mr-2" />

            {isOpen ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={handleInputBlur}
                  placeholder="Ask Gemini anything..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 font-medium"
                />
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white ml-2">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <span className="text-white/50">Press ⌘K to search...</span>
            )}
          </div>
        </div>

        {/* Dropdown results - Only showing chat as placeholder */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="relative">
                {/* Background blur */}
                <div className="absolute inset-0 backdrop-blur-2xl bg-black/40 z-0"></div>

                {/* Border glow */}
                <div className="absolute inset-0 rounded-xl border border-white/10 shadow-[0_0_10px_rgba(120,60,220,0.15)] z-0"></div>

                {/* Content - Only chat placeholder */}
                <div className="relative z-10 py-2 max-h-[60vh] overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      chatInputRef.current?.focus()
                    }}
                  >
                    <Brain className="h-4 w-4 text-white/70 mr-3" />
                    <span className="text-sm text-white">Chat with Gemini</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Interface - Added more top margin */}
      <div className={cn("w-full max-w-2xl transition-all duration-300 mt-8", isExpanded ? "max-w-4xl" : "max-w-2xl")}>
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          {/* Background blur */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/60 z-0"></div>

          {/* Border glow */}
          <div className="absolute inset-0 rounded-xl border border-white/15 shadow-[0_0_15px_rgba(120,60,220,0.2)] z-0"></div>

          {/* Noise texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] z-0 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-medium">Gemini</h2>
                  <div className="flex items-center">
                    <span className="text-xs text-white/50">Free plan</span>
                    <span className="mx-1 text-white/30">•</span>
                    <span className="text-xs text-blue-400 hover:underline cursor-pointer">Upgrade</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Welcome or Messages */}
            <div
              className={cn(
                "overflow-y-auto transition-all duration-300",
                isExpanded ? "max-h-[70vh]" : "max-h-[50vh]",
                messages.length === 0 ? "flex items-center justify-center" : "",
              )}
            >
              {messages.length === 0 ? (
                <div className="py-16 px-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Good evening</h1>
                  <p className="text-white/60 max-w-md mx-auto mb-8">How can I help you today?</p>

                  {/* Feature cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl cursor-pointer border border-white/5">
                      <Search className="w-5 h-5 text-blue-400 mb-2" />
                      <h3 className="text-white text-sm font-medium mb-1">Search</h3>
                      <p className="text-white/60 text-xs">Get detailed answers to your questions</p>
                    </div>
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl cursor-pointer border border-white/5">
                      <Brain className="w-5 h-5 text-purple-400 mb-2" />
                      <h3 className="text-white text-sm font-medium mb-1">Think</h3>
                      <p className="text-white/60 text-xs">Solve complex problems in math and science</p>
                    </div>
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl cursor-pointer border border-white/5">
                      <Sparkles className="w-5 h-5 text-green-400 mb-2" />
                      <h3 className="text-white text-sm font-medium mb-1">Create</h3>
                      <p className="text-white/60 text-xs">Generate creative content and ideas</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 backdrop-blur-sm text-white border border-white/10",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-invert prose-sm max-w-none"
                            components={{
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  className="text-blue-400 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                              code: ({ node, inline, ...props }) =>
                                inline ? (
                                  <code {...props} className="bg-white/10 px-1 py-0.5 rounded text-xs" />
                                ) : (
                                  <code
                                    {...props}
                                    className="block bg-white/10 p-2 rounded-md text-xs overflow-x-auto"
                                  />
                                ),
                              ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 space-y-1" />,
                              ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 space-y-1" />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 backdrop-blur-sm text-white max-w-[80%] rounded-2xl px-4 py-3 border border-white/10">
                        <div className="flex space-x-2">
                          <div
                            className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                            style={{ animationDelay: "600ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <form onSubmit={onSubmit} className="relative">
                <textarea
                  ref={chatInputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  placeholder="Message Gemini..."
                  className="w-full bg-white/5 text-white rounded-xl pl-10 pr-12 py-3 outline-none resize-none min-h-[44px] max-h-[120px] border border-white/10 focus:border-blue-500/50 transition-colors"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim()) {
                        onSubmit(e as any)
                      }
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="absolute right-3 bottom-3 flex items-center space-x-1">
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "p-1.5 rounded-full",
                      input.trim() && !isLoading
                        ? "text-white bg-blue-600 hover:bg-blue-700"
                        : "text-white/50 bg-white/5",
                    )}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-2 flex justify-between items-center text-xs">
                <div className="text-white/40">Gemini may display inaccurate info, including about people</div>
                <div className="relative group">
                  <div className="flex items-center cursor-pointer">
                    <span className="text-white/70 mr-2">Gemini 1.5 Flash</span>
                    <ChevronDown className="w-3 h-3 text-white/40" />
                  </div>

                  {/* Model dropdown */}
                  <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg overflow-hidden shadow-lg hidden group-hover:block">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-1 rounded-lg">
                      {/* Current model */}
                      <div className="px-3 py-2 text-white/90 text-xs rounded hover:bg-white/10 cursor-pointer flex items-center justify-between">
                        <span>Gemini 1.5 Flash</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      </div>

                      {/* Locked models */}
                      <div className="px-3 py-2 text-white/30 text-xs rounded flex items-center justify-between cursor-not-allowed">
                        <span>Claude 3.5 Sonnet</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/30"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <div className="px-3 py-2 text-white/30 text-xs rounded flex items-center justify-between cursor-not-allowed">
                        <span>GPT-4o</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/30"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
