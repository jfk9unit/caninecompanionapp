import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Coins,
  Bot,
  User,
  X,
  Loader2,
  Sparkles,
  HelpCircle,
  PawPrint
} from "lucide-react";

export const AIChatSupport = ({ tokens = 0, onTokenUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "🐕 Woof! I'm your 24/7 K9 Training Assistant! Ask me anything about dog training, behavior, health tips, or how to use CanineCompass. Each message costs 5 tokens.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  
  const COST_PER_MESSAGE = 5;
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const sendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    if (tokens < COST_PER_MESSAGE) {
      toast.error(`Not enough tokens! You need ${COST_PER_MESSAGE} tokens per message. Visit Token Shop.`);
      return;
    }
    
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/chat/support`, {
        message: userMessage.content
      }, { withCredentials: true });
      
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update tokens
      if (onTokenUpdate) {
        onTokenUpdate(response.data.remaining_tokens);
      }
      
      toast.success(`-${COST_PER_MESSAGE} tokens used`);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Failed to send message";
      toast.error(errorMsg);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again or check your token balance.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const quickQuestions = [
    "How do I teach my dog to sit?",
    "Why does my dog bark at strangers?",
    "Best treats for training?",
    "How to stop leash pulling?"
  ];
  
  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg z-50 p-0"
        data-testid="chat-support-btn"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      
      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-lg">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">K9 Support Chat</p>
                  <p className="text-xs text-green-100 font-normal">24/7 AI Assistant</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Coins className="w-3 h-3 mr-1" />
                {tokens} tokens
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-md"
                        : msg.isError
                        ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === "assistant" && (
                        <PawPrint className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Cost Notice */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-700 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {COST_PER_MESSAGE} tokens per message • Your balance: {tokens} tokens
            </p>
          </div>
          
          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about dog training..."
                className="rounded-full"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-green-500 hover:bg-green-600 flex-shrink-0"
                disabled={isLoading || !inputMessage.trim() || tokens < COST_PER_MESSAGE}
                data-testid="chat-send-btn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIChatSupport;
