"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Maximize2, Paperclip, Brain, Search, ImageIcon, ArrowRight } from "lucide-react"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [expanded, setExpanded] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: () => {
      if (!chatStarted && messages.length > 0) {
        setChatStarted(true)
      }
    },
  })

  // Auto-focus the input when the chat opens
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

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto"
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: expanded ? "90vw" : "600px",
              height: expanded ? "90vh" : chatStarted ? "80vh" : "auto",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative overflow-hidden rounded-2xl shadow-2xl flex flex-col",
              expanded ? "max-w-7xl" : "max-w-xl",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glassmorphic container with border glow */}
            <div className="absolute inset-0 backdrop-blur-3xl bg-black/60 z-0"></div>

            {/* Border glow effect */}
            <div className="absolute inset-0 rounded-2xl border border-white/15 shadow-[0_0_20px_rgba(120,60,220,0.25)] z-0"></div>

            {/* Noise texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.05] z-0 pointer-events-none"></div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full bg-black/70 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="text-white font-medium">Gemini</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inner container with blue glow */}
              <div className="mx-4 my-4 flex-1 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-black/50 overflow-hidden flex flex-col">
                {/* Welcome message or chat area */}
                {!chatStarted && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <p className="text-white/90 text-lg font-light mb-6 border-l-2 border-blue-500/70 pl-3">
                      All Your Answers In One Place...
                    </p>
                    <div className="flex space-x-4 mt-4">
                      <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <Brain className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Message thread */}
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3",
                              message.role === "user"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-zinc-800/90 backdrop-blur-sm text-white border border-white/10 shadow-md",
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
                                      <code {...props} className="bg-zinc-700 px-1 py-0.5 rounded text-xs" />
                                    ) : (
                                      <code
                                        {...props}
                                        className="block bg-zinc-700/50 p-2 rounded-md text-xs overflow-x-auto"
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
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800/70 backdrop-blur-sm text-white max-w-[80%] rounded-2xl px-4 py-3 border border-white/5">
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

                {/* Input area */}
                <div className="p-3 border-t border-white/10">
                  <form onSubmit={onSubmit} className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleTextareaChange}
                      placeholder="Ask anything..."
                      className="w-full bg-white/10 text-white rounded-xl pl-4 pr-12 py-3 outline-none resize-none min-h-[44px] max-h-[120px] border border-white/15 focus:border-blue-500/70 transition-colors"
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
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "absolute right-2 bottom-2 p-2 rounded-full",
                        input.trim() && !isLoading
                          ? "text-white bg-blue-600 hover:bg-blue-700"
                          : "text-white/50 bg-white/5",
                      )}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer with subscribe button */}
              <div className="flex justify-end p-3">
                <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
