import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import axios from "axios";
import { NoAgentNotification } from "../../components/NoAgentNotification";
import { CloseIcon } from "../../components/CloseIcon";
import {
  AgentState,
  BarVisualizer,
  DisconnectButton,
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  useParticipant,
  useRoom,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { AnimatePresence, motion } from "framer-motion";
import { MediaDeviceFailure } from "livekit-client";
import { useNavigate } from "react-router-dom";
import styles from "./Interview.module.css";
// Main Page component
function Page() {
  const [connectionDetails, updateConnectionDetails] = useState(null);
  const [agentState, setAgentState] = useState("disconnected");
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const navigate = useNavigate();

  // Check if interview has been completed already
  useEffect(() => {
    const interviewDone = localStorage.getItem("interviewDone") === "true";
    const paymentCompleted = localStorage.getItem("paymentCompleted") === "true";
    if (interviewDone) {
      navigate("/feedback");
    } else if (!paymentCompleted) {
      navigate("/upload");
    }
  }, [navigate]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Time's up - end interview and redirect
      handleInterviewEnd();
    }

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInterviewEnd = (forceEnd = false) => {
    // If timer hasn't expired and not forcing end, show confirmation
    if (timeRemaining > 0 && !forceEnd && timerActive) {
      setShowConfirmDialog(true);
      return;
    }

    setIsDisconnecting(true);
    localStorage.setItem("interviewDone", "true");
    updateConnectionDetails(null);


    setTimeout(() => {
      navigate("/feedback");
    }, 1000);

  };

  const handleRoomDisconnect = () => {
    // Only handle the disconnection if we're not already showing the confirmation
    if (!showConfirmDialog && timeRemaining > 0 && timerActive) {
      setShowConfirmDialog(true);
    }
  };

  const confirmEndInterview = () => {
    setShowConfirmDialog(false);
    // Force end the interview
    handleInterviewEnd(true);
  };

  const cancelEndInterview = () => {
    setShowConfirmDialog(false);
  };


  const onConnectButtonClicked = useCallback(async () => {
    try {
      const userName = localStorage.getItem("userName");
      const userQuestions = localStorage.getItem("interviewQuestions");
      // using userName and time, generate a unique file path for saving chat history
      // no space allowed in file name. No special characters allowed in file name except underscore
      const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      const chatHistoryPath = `${sanitizedUserName}_${Date.now()}.txt`;

      // store the chat history path in local storage
      localStorage.setItem("chatHistoryPath", chatHistoryPath);

      // clear cachedFeedback from local storage if it exists
      localStorage.removeItem("cachedFeedback");
      console.log("User name:", userName);
      console.log("User questions:", userQuestions);


      // if REACT_APP_ENV === "local", set the POST URL to http://localhost:5001
      // else set the POST URL to the backend API URL
      const postUrl = process.env.REACT_APP_ENV === "local" ? "http://localhost:5001" : `${process.env.REACT_APP_CHEVENINGBREW_SERVER_URL}/token_service`;

      // Fetch connection details from the backend API
      const response = await axios.post(
        `${postUrl}`,
        {
          userName: userName,
          userQuestions: userQuestions,
          chatHistoryPath: chatHistoryPath,
        }
      ); // Make GET request to your endpoint
      console.log("Connection details:", response.data);
      updateConnectionDetails(response.data); // Update the connection details with the API response

      // Start the timer when connection is established
      setTimerActive(true);
    } catch (error) {
      console.error("Error fetching connection details", error);
      alert("Failed to fetch connection details");
    }
  }, []);

  return (
    <MainLayout>
      {/* Logo positioned at the top-left corner */}

      <ActionBox>
        {/* Timer display */}
        {timerActive && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded text-black font-mono font-bold">
            {formatTime(timeRemaining)}
          </div>
        )}


        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className={styles.confirmDialogOverlay}>
            <div className={styles.confirmDialog}>
              <h3 className={styles.confirmDialogTitle}>End Interview Early?</h3>
              <p className={styles.confirmDialogMessage}>
                Are you sure you want to end the interview now? You will be assessed only on what you've completed so far and will not be allowed to retake the interview.
              </p>
              <div className={styles.confirmDialogButtons}>
                <button
                  onClick={cancelEndInterview}
                  className={styles.confirmDialogCancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndInterview}
                  className={styles.confirmDialogEndButton}
                >
                  End Interview
                </button>
              </div>
            </div>
          </div>
        )}

        <main data-lk-theme="default" className="h-full grid content-center">
          <LiveKitRoom
            token={connectionDetails?.participantToken}
            serverUrl={connectionDetails?.serverUrl}
            connect={connectionDetails !== undefined}
            audio={true}
            video={false}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={handleRoomDisconnect}
            className="grid grid-rows-[2fr_1fr] items-center"
          >
            <SimpleVoiceAssistant onStateChange={setAgentState} />
            <ControlBar
              onConnectButtonClicked={onConnectButtonClicked}
              agentState={agentState}
              onDisconnect={handleInterviewEnd}
            />
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </LiveKitRoom>
        </main>
      </ActionBox>
    </MainLayout>
  );
}

// SimpleVoiceAssistant component
function SimpleVoiceAssistant(props) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

  return (
    <div className="h-[300px] max-w-[50vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

// ControlBar component
function ControlBar(props) {
  const krisp = useKrispNoiseFilter();

  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  // Custom disconnect handler to trigger parent component's disconnect logic
  const handleDisconnect = () => {
    if (props.onDisconnect) {
      props.onDisconnect();
    }
  };

  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={props.onConnectButtonClicked}
          >
            Start your interview
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, top: "10px" }}
              animate={{ opacity: 1, top: 0 }}
              exit={{ opacity: 0, top: "-10px" }}
              transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
              className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton onClick={handleDisconnect}>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

// Device failure handler
function onDeviceFailure(error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please grant the necessary permissions in your browser."
  );
}

export default Page;