import React, { useState, useEffect } from 'react';
import  { Socket } from 'socket.io-client';
import { LeftChat } from './LeftChat';
import { RightChat } from './RightChat';
import { DefaultEventsMap } from '@socket.io/component-emitter';



interface ChatSectionProps {
  socket : Socket<DefaultEventsMap, DefaultEventsMap> | null;
  name: string;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ name , socket }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState({
    message: '',
  });
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (socket) { 
      socket.on('connect', () => {
        setSocketId(socket.id || null);
      });
      
      socket.on('receiveMessage', (message) => {
        
        setData((prevState) => [...prevState, message]);
      });
  
      return () => {
        socket.off('receiveMessage');
        socket.off('connect');
      };
    }
  }, [socket]); 

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage({ message: e.target.value });
  };

  const onSendHandler = () => {
    if(socket){
      const messageData = {
        ...currentMessage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        name,
        status:   "delivered" ,
        senderId: socketId,
      };
    
    socket.emit('sendMessage', messageData);
    setCurrentMessage({ message: '' }); 
  }
  };
  

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="border flex-1 self-stretch rounded-lg shadow flex flex-col p-4">
      <div className="max-h-[78vh] flex-1 flex flex-col overflow-y-auto">
        {data.map((msg, idx) => (
          <div
            key={idx}
            className={classNames(
              msg.senderId === socketId ? 'self-end' : 'self-start'
            )}
          >
            {msg.senderId === socketId ? (
              <RightChat
                name={msg.name}
                message={msg.message}
                time={msg.time}
                status={msg.status}
              />
            ) : (
              <LeftChat
                name={msg.name}
                message={msg.message}
                time={msg.time}
                status={msg.status}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          name="text"
          id="text"
          value={currentMessage.message}
          className="shadow-sm p-2 border border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm rounded-md"
          placeholder="Type your message here!"
          onChange={onChangeHandler}
        />
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={onSendHandler}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
