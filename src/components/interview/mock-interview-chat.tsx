"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface MockInterviewChatProps {
  initialMessages?: ChatMessage[];
}

const systemPrompt = `You are an experienced technical interviewer. Ask relevant questions about the candidate's experience, technical skills, and problem-solving abilities. Be professional but friendly.`;

export function MockInterviewChat({ initialMessages = [] }: MockInterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const aiResponses = [
      "That's a great point. Can you tell me more about a challenging project you worked on recently?",
      "Interesting approach. How would you handle this if you had limited resources or time constraints?",
      "I see. What technologies or frameworks would you use to implement this solution?",
      "Good answer. Can you walk me through your thought process when debugging complex issues?",
      "That makes sense. How do you stay updated with the latest developments in your field?",
    ];

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startInterview = () => {
    setIsTyping(true);
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Hello! I'm your AI interviewer today. Let's start with a simple question: Can you tell me about yourself and your experience as a developer?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <Card className="flex h-[600px] flex-col border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="shrink-0 border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          Mock Interview
        </CardTitle>
        <CardDescription>
          Practice your interview skills with our AI interviewer
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0">
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-foreground">
                  Ready to practice?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a mock interview session with AI
                </p>
              </div>
              <Button onClick={startInterview} className="gap-2">
                <Bot data-icon="inline-start" />
                Start Interview
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback
                      className={cn(
                        message.role === "assistant"
                          ? "bg-primary/10 text-primary"
                          : "bg-indigo/10 text-indigo"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "assistant"
                        ? "rounded-tl-sm bg-muted"
                        : "rounded-tr-sm bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        message.role === "assistant"
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <Skeleton className="size-2 rounded-full" />
                    <Skeleton className="size-2 rounded-full" />
                    <Skeleton className="size-2 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        {messages.length > 0 && (
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex gap-3">
              <Textarea
                ref={inputRef}
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
