/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState, useRef } from "react";
import { Socket,io } from "socket.io-client";
import { Navbar } from "./Room/Navbar";
import { Main } from "./Room/Main";
import toast, {Toaster} from 'react-hot-toast';
import { DefaultEventsMap } from '@socket.io/component-emitter';

const URL =   import.meta.env.VITE_URL;



export const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [_sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [_receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
  const [_remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [_remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [_remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const socket = io(URL);
    
    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();

      setSendingPc(pc);
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("offer", async ({ roomId, sdp: remoteSdp }: {roomId : string , sdp  : string}) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      //@ts-ignore
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);
      setReceivingPc(pc);
      window.pcr = pc;



      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;

        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };
      
      
      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        if (track1.kind === "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
      }, 5000);
    });

    socket.on("answer", ({ sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });
    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type == "sender") {
        setReceivingPc((pc) => {
          if (!pc) {
            console.error("receiving pc not found");
          } 
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (!pc) {
            console.error("sending pc not found");
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });


    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  useEffect(()=>{
    if(lobby){
      toast.loading("Waiting to connect you to someone");
    }else{
      toast.dismiss()
    }
  })

  return (
    <div className='flex flex-col gap-12'>
      <Navbar/>
      <Main remoteVideoRef={remoteVideoRef} localVideoRef={localVideoRef} name={name} socket={socket}/>
      <Toaster/>
    </div>
  );
};
