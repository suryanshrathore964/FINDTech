import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { getChatbotReply } from '@/lib/analytics-utils'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content:
    "Hi! I'm FINDtech AI Assistant. Ask me about pricing, GPU workloads, compatibility scores, future-proof ratings, or how to get recommendations.",
}

export function AnalyticsChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = getChatbotReply(text)
      setMessages((m) => [
        ...m,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ])
      setTyping(false)
    }, 600 + Math.random() * 400)
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-xl shadow-primary-500/40',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'fixed z-50 flex flex-col overflow-hidden',
                'inset-x-4 bottom-4 top-auto h-[min(520px,75vh)] rounded-2xl',
                'lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[380px] lg:h-[520px]',
                'dash-card border border-primary-500/20 shadow-2xl'
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-inherit bg-primary-500/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm dash-text-primary">FINDtech Assistant</p>
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg dash-text-muted hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        msg.role === 'user' ? 'bg-primary-500/20 text-primary-600' : 'bg-cyan-500/15 text-cyan-600'
                      )}
                    >
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm max-w-[85%] leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'dash-card dash-text-muted rounded-tl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <div className="flex gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
                      <Bot className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div className="dash-card rounded-2xl px-4 py-3 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary-400"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-inherit flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask about analytics..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm dash-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white disabled:opacity-40 hover:bg-primary-700 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
