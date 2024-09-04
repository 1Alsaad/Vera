import { useState } from 'react';
import { FaPaperPlane, FaRobot, FaPaperclip, FaComments } from 'react-icons/fa';

function ChatSidebar() {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent dark:bg-gray-800 p-6">
      <div className="flex items-center justify-around w-full h-[40px] p-2 bg-[#F5F5F5] dark:bg-gray-700 bg-opacity-54 rounded-[20px] mb-6">
        <FaRobot className="text-gray-600 dark:text-gray-300 cursor-pointer" title="AI Assistant" />
        <FaPaperclip className="text-gray-600 dark:text-gray-300 cursor-pointer" title="Attach File" />
        <FaComments className="text-gray-600 dark:text-gray-300 cursor-pointer" title="Chat" />
      </div>
      <h2 className="text-xl font-semibold mb-6 dark:text-gray-100">Chat</h2>
      <div className="flex-grow overflow-y-auto mb-6">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg dark:text-gray-100">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-3 p-3 bg-blue-500 text-white rounded-lg"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default ChatSidebar;