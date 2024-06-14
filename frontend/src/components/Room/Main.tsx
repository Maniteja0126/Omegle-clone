import React from 'react';
import VideoShower from './MainSection/VideoShower';
import { ChatSection } from './MainSection/ChatSectionn';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

interface MainProps {
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  name : string;
  socket : Socket<DefaultEventsMap, DefaultEventsMap> | null;
}

export const Main: React.FC<MainProps> = ({ remoteVideoRef, localVideoRef , name  , socket}) => {
  return (
    <div className='flex gap-5 px-4 px-2 sm:px-6 lg:px-8'>
      <VideoShower remoteVideoRef={remoteVideoRef} localVideoRef={localVideoRef} />
      <ChatSection name={name} socket={socket} />
    </div>
  );
};


