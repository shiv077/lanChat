import { useState } from "react";

export default function ClearPage() {
  const [status, setStatus] = useState(null);

  const clearChat = async () => {
    const res = await fetch("/api/clear", { method: "POST" });
    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-2xl font-bold mb-4">🧹 Clear Chat</h1>
      <button
        onClick={clearChat}
        className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600"
      >
        Clear All Messages
      </button>
      {status && <p className="mt-4 text-green-700 font-medium">{status}</p>}
    </div>
  );
}
