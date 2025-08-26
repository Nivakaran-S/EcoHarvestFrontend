'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Send from '../images/send.png';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define interface for message object
interface Message {
  type: 'sender' | 'receiver';
  content: string;
  timestamp: number;
}

const Max: React.FC = () => {
  const [max, setMax] = useState<boolean>(false);
  const [messageSubmitted, setMessageSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageCollection, setMessageCollection] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('sessionId');

    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('sessionId', storedSessionId);
      setSessionId(storedSessionId);
    } else {
      setSessionId(storedSessionId);
    }
  }, []);

  const fetchData = async () => {
    if (!sessionId || !message) return;

    const payload = { session_id: sessionId, question: message };

    try {
      const response = await axios.post<{ answer: string }>(
        "http://localhost:5000/ask_question",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      const answer = response.data?.answer || "No response received";

      setMessageCollection((prevMessages) => [
        ...prevMessages,
        { type: "receiver", content: answer, timestamp: Date.now() },
      ]);

      setTyping(false);
    } catch (err) {
      console.error("Error invoking API: ", err);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messageCollection]);

  const onMessageSubmit = (msg: string) => {
    if (msg.trim()) {
      fetchData();
      setMessageSubmitted(true);
      setMessageCollection((prevMessages) => [
        ...prevMessages,
        { type: 'sender', content: msg, timestamp: Date.now() },
      ]);
      setTyping(true);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onMessageSubmit(e.currentTarget.value);
    }
  };

  const handleMax = () => {
    setMax(!max);
  };

  const onMaxFalseClick = () => {
    setMax(false);
  };

  return (
    <div className={`${max ? 'h-[100vh] w-[100vw]' : ''} fixed z-[9999] text-black bottom-[0px] right-[0px]`}>
      <div
        onClick={onMaxFalseClick}
        className={`absolute top-0 left-0 w-screen h-screen bg-black transition-opacity duration-500 opacity-40 ${max ? 'flex' : 'hidden'}`}
      ></div>
      <div
        onClick={handleMax}
        className={`${max ? 'translate-y-[100px]' : 'translate-y-[0px] delay-300'} select-none transition-transform duration-500 ease-in-out absolute bottom-[20px] right-[30px] flex items-center justify-center w-fit bg-[#FDAA1C] rounded-full ring-[0.5px] ring-gray-800 cursor-pointer px-[30px] py-[5px]`}
      >
        <p className="select-none text-[20px]">Max</p>
      </div>

      <div
        className={`${max ? 'scale-[100%] delay-200' : 'scale-0'} absolute bottom-[20px] right-[30px] origin-bottom-right transition-transform duration-500 ease-in-out flex flex-col bg-[#FDAA1C] h-[500px] w-[350px] rounded-[10px] ring-[0.5px] ring-gray-800 justify-center mt-[5px]`}
      >
        <div className="w-[100%] select-none px-[20px] bg-[#101010] text-white flex flex-row justify-between rounded-t-[10px] py-[10px] h-fit items-center">
          <div>
            <p className="text-[20px]">Max</p>
          </div>
          <div onClick={handleMax} className="cursor-pointer">
            <p>Close</p>
          </div>
        </div>

        {messageSubmitted ? (
          <div className="h-[350px] overflow-y-scroll py-[10px]" ref={scrollContainerRef}>
            <div className="flex justify-center mt-[5px]">
              <div className="bg-[#8f8f8f] text-[12px] px-[8px] py-[2px] rounded-[5px] border-[1px] border-gray-500 box-shadow-lg w-fit">
                <p className="text-gray-800">Today</p>
              </div>
            </div>
            {messageCollection
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((msg, index) => (
                <div className={`${msg.type === 'sender' ? 'justify-end' : 'justify-start'} flex`} key={index}>
                  <div
                    className={`${msg.type === 'sender' ? 'border-[1px] border-[#101010] self-end bg-[#101010] text-white' : 'border-[1px] border-gray-500 self-start bg-white text-black'} flex box-shadow-lg max-w-[60%] text-left mt-[5px] mx-[10px] rounded-[5px] py-[5px] px-[13px] text-[14px]`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            {typing ? (
              <div className="flex mt-[5px] mx-[10px] justify-start">
                <div className="w-fit px-[15px] py-[5px] rounded-[5px]">
                  <p className="text-black text-[13px]">Typing...</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="h-[350px]">
            <div className="mx-[30px] my-[20px] text-center">
              <p className="text-[15px]">
                Hello! This is Max, your AI-powered assistant for developed by EcoHarvest.
              </p>
              <p className="text-[15px]">
                I'm here to connect you with expert insights, guide you through our services, and answer all your queries about EcoHarvest.
              </p>
            </div>
          </div>
        )}

        <div className="w-[100%] relative rounded-b-[10px] p-[10px] h-[130px] bg-[#1D1D1D]">
          <textarea
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="w-[100%] focus:outline-none h-[100%] leading-[19px] rounded-[5px] bg-[#101010] text-black py-[5px] px-[8px] bg-white resize-none"
            placeholder="Ask Max"
          />
          <div
            onClick={() => onMessageSubmit(message)}
            className="w-[70px] ring-[0.5px] ring-gray-800 cursor-pointer hover:bg-yellow-400 absolute top-[5px] right-[-20px] h-[70px] rounded-full bg-[#FDAA1C] flex items-center justify-center cursor-pointer mt-[10px]"
          >
            <Image alt="Send" className="ml-[7px]" src={Send} height={35} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Max;