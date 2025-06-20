// ============================
// 📁 /pages/index.js (Chat Page with Sound Notification)
// ============================
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Clock,
  Mic,
  Moon,
  Send,
  Sun,
  User,
  Wifi,
  WifiOff,
  MessageCircle,
} from "lucide-react";

let socket;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [nickname, setNickname] = useState("Guest");
  const [theme, setTheme] = useState("light");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const connectedRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const savedNick = localStorage.getItem("nickname") || "Guest";
    const savedTheme = localStorage.getItem("theme") || "light";
    setNickname(savedNick);
    setTheme(savedTheme);

    if (!connectedRef.current) {
      fetch("/api/socket");
      socket = io({ path: "/api/socket_io" });

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));

      socket.on("init", (msgs) => setMessages(msgs));
      socket.on("newMessage", (msg) => {
        setMessages((prev) => [...prev.slice(-19), msg]);
        const sender = msg.text.split(":"[0]);
        if (!msg.text.startsWith(nickname + ":")) {
          audioRef.current?.play().catch(() => {});
        }
      });

      connectedRef.current = true;
    }

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const onSendMessage = () => {
    if (input.trim()) {
      socket.emit("sendMessage", `${nickname}: ${input}`);
      setInput("");
    }
  };

  const onNicknameChange = (value) => {
    setNickname(value);
    localStorage.setItem("nickname", value);
  };

  const onInputChange = (value) => {
    setInput(value);
  };

  const onToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
      <div className="flex flex-col h-screen dark:bg-gray-900 dark:text-white">
        {/* Header */}
        <header className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LAN Chat</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  {isConnected ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all duration-200 active:scale-95"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
        </header>

        {/* Nickname Input */}
        <div
          className={`p-4 border-b transition-colors duration-200 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-sm mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder="Enter your nickname"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              maxLength={20}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="max-w-2xl mx-auto">
            {messages.map((message, i) => {
              const isOwn = message.text.startsWith(nickname + ":");
              const cleanText = message.text.replace(nickname + ":", "").trim();
              return (
                <div
                  key={i}
                  className={`flex ${
                    isOwn ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwn
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : theme === "dark"
                        ? "bg-gray-700 text-white rounded-bl-sm"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span
                          className={`text-xs font-medium ${
                            theme === "dark" ? "text-blue-300" : "text-blue-600"
                          }`}
                        >
                          {message.ip}
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed break-words">
                      {cleanText}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-2 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Clock
                        className={`w-3 h-3 ${
                          isOwn
                            ? "text-blue-200"
                            : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isOwn
                            ? "text-blue-200"
                            : theme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`border-t transition-colors duration-200 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="p-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl border resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
                <button
                  className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
                      : "text-gray-500 hover:text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={onSendMessage}
                disabled={!input.trim()}
                className={`p-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                  input.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-500"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
