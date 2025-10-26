"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
// Ref for the MediaRecorder object
const mediaRecorderRef = useRef<MediaRecorder | null>(null);

// Ref to store the audio "chunks" (pieces)
const audioChunksRef = useRef<Blob[]>([]);

const handleStartRecording = async () => {
  try {
    // 1. Ask for permission and get the audio stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    setIsRecording(true);
    audioChunksRef.current = []; // Clear previous chunks

    // 2. Create the MediaRecorder instance
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // 3. Save chunks as they become available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    // 4. When recording stops, combine the chunks
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      setAudioBlob(blob);

      // Stop the microphone tracks (turns off the "recording" light)
      stream.getTracks().forEach((track) => track.stop());
    };

    // 5. Start recording
    mediaRecorder.start();

  } catch (error) {
    console.error("Error accessing the microphone:", error);
  }
};

const handleStopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

// ... inside the AudioRecorder component

const handleSendAudio = async () => {
  if (!audioBlob) return;

  // 1. Create FormData
  const formData = new FormData();

  // 2. Append the Blob (the audio) as a file
  // "audio" is the field name the backend will read
  formData.append("audio", audioBlob, "recording.wav");

  try {
    // 3. Send it to the backend (API Route)
    const response = await fetch("/api/upload-audio", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Audio uploaded successfully!");
    } else {
      alert("Error uploading the audio.");
    }
  } catch (error) {
    console.error("Error in fetch:", error);
  }
};


  return (

    <div className="flex flex-col justify-center items-center h-screen text-white">
        <p className="animate-bounce text-[90px] font-regular pb-1"> 
          cookingLola 
        </p>
    <div className="w-full max-w-lg">
      <button className="w-full py-4 px-4 bg-[#fe9907] hover:bg-[#e1b474] hover:scale-110 rounded-lg transition-all font-sans"
        onClick={isRecording ? handleStopRecording : handleStartRecording}
      >
        {isRecording ? "Listening..." : "How can Lola help?"}
      </button>
    </div>

    {/* Show the recorded audio and the send button */}
    {audioBlob && (
      <div className="flex flex-col items-center space-y-4">
        <audio src={URL.createObjectURL(audioBlob)} controls />
        <button className="py-4 px-4 bg-[#fe9907] hover:bg-[#e1b474] hover:scale-110 rounded-lg transition-all font-sans" onClick={handleSendAudio}>Send to Lola</button>
      </div>
    )}

    <CameraCapture />
    </div>

    
  );

}
