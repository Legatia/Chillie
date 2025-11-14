import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Users, Smile } from "lucide-react";
import { Message } from "@/hooks/usePeerConnection";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

const ChatPanel = ({ messages, onSendMessage }: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageAvatar = (senderName: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = senderName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <motion.div
        className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </div>
            <h2 className="font-semibold text-foreground">Chat</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{new Set(messages.map(m => m.senderName)).size} participants</span>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            className="text-center text-muted-foreground py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
            <h3 className="font-medium mb-2">Start the conversation</h3>
            <p className="text-sm">Be the first to say hello! 👋</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex flex-col ${
                  message.senderName === "You" ? "items-end" : "items-start"
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {message.senderName !== "You" && (
                    <motion.div
                      className={`w-8 h-8 rounded-full ${getMessageAvatar(message.senderName)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {message.senderName[0].toUpperCase()}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-1">
                    {message.senderName !== "You" && (
                      <p className="text-xs text-muted-foreground font-medium px-1">
                        {message.senderName}
                      </p>
                    )}

                    <motion.div
                      className={`rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow ${
                        message.senderName === "You"
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground ml-auto"
                          : "bg-muted/80 text-foreground backdrop-blur-sm"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    </motion.div>

                    <div className={`flex items-center gap-2 text-xs text-muted-foreground px-1 ${
                      message.senderName === "You" ? "justify-end" : "justify-start"
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.senderName === "You" && (
                        <motion.div
                          className="w-1 h-1 bg-blue-500 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="bg-muted/80 backdrop-blur-sm rounded-2xl px-4 py-2">
                <div className="flex items-center gap-1">
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.2
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.4
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end gap-2">
          <motion.div
            className="flex-1 relative"
            whileFocus={{ scale: 1.02 }}
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Enter to send)"
              className="pr-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
            />
            {inputValue.trim() && (
              <motion.div
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Smile className="w-4 h-4" />
              </motion.div>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <motion.div
                animate={{
                  rotate: inputValue.trim() ? [0, -10, 10, 0] : 0
                }}
                transition={{
                  duration: 0.5,
                  repeat: inputValue.trim() ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                <Send className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPanel;
