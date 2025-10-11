"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Search,
  Folder,
  File,
  Hash,
  Tag,
  ChevronRight,
  X,
  Layers,
  ImageIcon,
  Zap,
  PenTool,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInterface } from "./chat-interface"

type CommandItem = {
  id: string
  icon: React.ReactNode
  title: string
  description?: string
  shortcut?: string
  action?: () => void
  type: "recent" | "action" | "result" | "category"
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Sample data
  const recentItems: CommandItem[] = [
    {
      id: "recent-1",
      icon: <Folder className="h-4 w-4" />,
      title: "Project / Wireframe Design Studio",
      type: "recent",
    },
    {
      id: "recent-2",
      icon: <Folder className="h-4 w-4" />,
      title: "Project / Tailwind CSS",
      type: "recent",
      description: "Jump to...",
    },
  ]

  const actionItems: CommandItem[] = [
    {
      id: "action-1",
      icon: <File className="h-4 w-4" />,
      title: "Add new file...",
      shortcut: "⌘N",
      type: "action",
      action: () => console.log("Add new file"),
    },
    {
      id: "action-2",
      icon: <Folder className="h-4 w-4" />,
      title: "Add new folder...",
      shortcut: "⌘F",
      type: "action",
      action: () => console.log("Add new folder"),
    },
    {
      id: "action-3",
      icon: <Hash className="h-4 w-4" />,
      title: "Add application...",
      shortcut: "⌘H",
      type: "action",
      action: () => console.log("Add hashtag"),
    },
    {
      id: "action-4",
      icon: <Tag className="h-4 w-4" />,
      title: "Add label...",
      shortcut: "⌘L",
      type: "action",
      action: () => console.log("Add label"),
    },
    {
      id: "action-5",
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Open Chat with Gemini...",
      shortcut: "⌘C",
      type: "action",
      action: () => {
        setIsChatOpen(true)
        setIsOpen(false)
      },
    },
  ]

  const categoryItems: CommandItem[] = [
    {
      id: "category-1",
      icon: <Layers className="h-5 w-5 text-indigo-500" />,
      title: "Interface",
      description: "Control options, input fields and table buttons.",
      type: "category",
    },
    {
      id: "category-2",
      icon: <ImageIcon className="h-5 w-5 text-blue-500" />,
      title: "Media",
      description: "A collection of stock video, images and content.",
      type: "category",
    },
    {
      id: "category-3",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      title: "Interactive",
      description: "Interactive components that are great for prototyping.",
      type: "category",
    },
    {
      id: "category-4",
      icon: <PenTool className="h-5 w-5 text-teal-500" />,
      title: "Graphics",
      description: "Choose from a selection of graphics to be used on the web, print or screen.",
      type: "category",
    },
  ]

  // Filter items based on search query
  const filteredItems = query
    ? [...recentItems, ...actionItems, ...categoryItems].filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : query === ""
      ? [...recentItems, ...actionItems]
      : []

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if chat is open
      if (isChatOpen) return

      // Open command palette with ⌘K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        if (!isOpen) {
          setQuery("")
        }
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }

      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setActiveIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
        } else if (e.key === "Enter") {
          e.preventDefault()

          // Check if query is "chat" to open chat interface
          if (query.toLowerCase() === "chat") {
            setIsChatOpen(true)
            setIsOpen(false)
            return
          }

          const selectedItem = filteredItems[activeIndex]
          if (selectedItem?.action) {
            selectedItem.action()
            setIsOpen(false)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isChatOpen, activeIndex, filteredItems, query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const activeItem = listRef.current.querySelector(`[data-index="${activeIndex}"]`)
      if (activeItem) {
        activeItem.scrollIntoView({
          block: "nearest",
        })
      }
    }
  }, [activeIndex])

  // Determine which items to show based on query
  const itemsToShow =
    query.length > 0
      ? filteredItems
      : query === "" && isOpen
        ? query.startsWith("@")
          ? categoryItems
          : [...recentItems, ...actionItems]
        : []

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                duration: 0.2,
                scale: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              }}
              className="w-full max-w-xl overflow-hidden rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glassmorphic container with enhanced background blur */}
              <div className="relative overflow-hidden rounded-xl">
                {/* Background blur layer */}
                <div className="absolute inset-0 backdrop-blur-2xl bg-black/10 z-0"></div>
                {/* Content container with proper transparency */}
                <div className="relative z-10 bg-gradient-to-b from-white/20 to-white/10 dark:from-black/30 dark:to-black/20 border border-white/20 shadow-2xl overflow-hidden rounded-xl glass-noise">
                  {/* Light effect to enhance depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 shadow-inner pointer-events-none rounded-xl" />
                  {/* Search input */}
                  <div className="relative flex items-center px-4 py-3 border-b border-white/10 bg-white/5">
                    <Search className="h-4 w-4 text-white/70 mr-2" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setActiveIndex(0)
                      }}
                      placeholder="Search projects..."
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 font-medium"
                    />
                    {query && (
                      <button onClick={() => setQuery("")} className="text-white/50 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2 relative z-10">
                    {/* Recent searches section */}
                    {itemsToShow.length > 0 && query === "" && (
                      <div className="px-3 pb-2">
                        <h3 className="text-xs font-medium text-white/50 mb-1">Recent searches</h3>
                      </div>
                    )}

                    {/* Items list */}
                    {itemsToShow.map((item, index) => (
                      <div
                        key={item.id}
                        data-index={index}
                        onClick={() => {
                          if (item.action) {
                            item.action()
                            setIsOpen(false)
                          }
                        }}
                        className={cn(
                          "px-3 py-2 flex items-center cursor-pointer group",
                          activeIndex === index ? "bg-white/15 shadow-sm" : "hover:bg-white/5",
                          item.type === "category" ? "py-3" : "",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex-shrink-0 mr-3 flex items-center justify-center",
                            item.type === "category"
                              ? "w-8 h-8 rounded-md bg-white/10 backdrop-blur-sm shadow-sm p-1.5"
                              : "",
                          )}
                        >
                          {item.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white truncate">{item.title}</span>
                            {item.shortcut && (
                              <span className="ml-2 text-xs text-white/70 bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
                                {item.shortcut}
                              </span>
                            )}
                          </div>
                          {item.description && <p className="text-xs text-white/60 truncate">{item.description}</p>}
                        </div>

                        {/* Action indicator */}
                        {item.type === "recent" && item.description && (
                          <ChevronRight className="h-4 w-4 text-white/50 ml-2" />
                        )}
                      </div>
                    ))}

                    {/* Empty state */}
                    {query && itemsToShow.length === 0 && (
                      <div className="px-3 py-6 text-center">
                        <p className="text-sm text-white/60">No results found for "{query}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Trigger button */}
      <button
        onClick={() => {
          setIsOpen(true)
          setQuery("")
        }}
        className="mt-8 px-4 py-2 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition-colors relative group overflow-hidden shadow-lg"
      >
        {/* Subtle highlight effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Open Command Palette
        </span>
      </button>
    </>
  )
}
