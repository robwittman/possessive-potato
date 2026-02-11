import { useEffect, useRef, useState } from 'react';
import { useMessagesStore } from '../../stores/messages';
import { useServersStore } from '../../stores/servers';
import { wsClient } from '../../api/ws';
import type { Message, GatewayEvent } from '../../types';

export function MessageView() {
  const { activeChannelId } = useServersStore();
  const { messages, loading, fetchMessages, sendMessage, addMessage, updateMessage, removeMessage, clear } =
    useMessagesStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChannelId) {
      clear();
      return;
    }

    fetchMessages(activeChannelId);
    wsClient.subscribe(activeChannelId);

    const unsub = wsClient.onEvent((event: GatewayEvent) => {
      switch (event.t) {
        case 'MESSAGE_CREATE':
          addMessage(event.d as Message);
          break;
        case 'MESSAGE_UPDATE': {
          const data = event.d as { id: string; content: string };
          updateMessage(data.id, data.content);
          break;
        }
        case 'MESSAGE_DELETE': {
          const data = event.d as { id: string };
          removeMessage(data.id);
          break;
        }
      }
    });

    return () => {
      wsClient.unsubscribe(activeChannelId);
      unsub();
    };
  }, [activeChannelId, fetchMessages, addMessage, updateMessage, removeMessage, clear]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;
    const content = input.trim();
    setInput('');
    await sendMessage(activeChannelId, content);
  };

  if (!activeChannelId) {
    return (
      <div className="flex-1 bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-700 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading && (
          <p className="text-gray-500 text-center">Loading messages...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-gray-500 text-center">No messages yet. Say something!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group hover:bg-gray-600/30 px-2 py-1 rounded">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-white text-sm">
                {msg.author_id}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
              {msg.edited_at && (
                <span className="text-xs text-gray-600">(edited)</span>
              )}
            </div>
            <p className="text-gray-300 text-sm">{msg.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 pt-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>
    </div>
  );
}
