import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import ActionBox from "../../components/ActionBox/ActionBox";
import axios from "axios";
import { NoAgentNotification } from "../../components/NoAgentNotification";
import { CloseIcon } from "../../components/CloseIcon";
import styles from "./Interview.module.css";
import SignOutPopup from "../../components/SignoutPopup/SignoutPopup";
import { handleSignOut } from "../../components/SignOut/SignOutHelper";
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
import { completeInterview,createInterview, readUserField,getUserId,getUserSubscription,updateUserSubscription,interviewReadUserField } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Popup from "../../components/PaymentBox/Popup";


// Main Page component
function Page(props) {
  const [connectionDetails, updateConnectionDetails] = useState(null);
  const [agentState, setAgentState] = useState("disconnected");
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);
  const { logout, user } = useAuth();
  const [interviewDone, setInterviewDone] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(false);



  const navigate = useNavigate();

  // Check if interview has been completed already
  useEffect(() => {
    const checkInterviewStatus = async () => {
      try {
        const user_id = getUserId();
        if (!user_id) {
          console.error("No user ID found");
          return;
        }
    
        // Fetch all data in parallel
        const [interviewDoneRaw, paymentCompletedRaw, subscription] = await Promise.all([
          interviewReadUserField(user_id, "is_completed"),
          readUserField(user_id, "payment_completed"),
          getUserSubscription({ user_id, field: "attempts" }).catch(() => ({ attempts: 0 })), // Handle 404 error
        ]);
    
        console.log("Payment status from DB:", paymentCompletedRaw);
        console.log("Subscription attempts from DB:", subscription?.attempts);
    
        // Parse boolean values
        const interviewDone = interviewDoneRaw === true || interviewDoneRaw === "true";
        const paymentCompleted = paymentCompletedRaw === true || paymentCompletedRaw === "true";
    
        console.log("Parsed interviewDone:", interviewDone);
        console.log("Parsed paymentCompleted:", paymentCompleted);
    
        // Update state
        setInterviewDone(interviewDone);
        setPaymentCompleted(paymentCompleted);
        setAttemptsLeft(subscription?.attempts || 0);
    
        // Check payment status first
        if (!paymentCompleted) {
          console.log("Payment not completed, redirecting to upload");
          navigate("/upload");
          return;
        }
    
        // Then check interview status and attempts
        if (interviewDone && (subscription?.attempts === 0 || !subscription)) {
          console.log("User has no attempts left and interview is done.");
          setShowSignOutPopup(true);
        }
      } catch (error) {
        console.error("Error checking interview status:", error);
        // If there's an error checking payment status, redirect to upload as fallback
        navigate("/upload");
      }
    };
  
    checkInterviewStatus();
  }, [navigate]);
  

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleInterviewEnd = async (forceEnd = false) => {
    if (timeRemaining > 0 && !forceEnd && timerActive) {
      setShowConfirmDialog(true);
      return;
    }
  
    if (attemptsLeft > 1) {
      const newAttempts = attemptsLeft - 1;
      await updateUserSubscription({ field: "attempts", value: newAttempts });
      console.log("Attempts left:", newAttempts);
      
      setAttemptsLeft(newAttempts);
    } else if (attemptsLeft === 1) {
      await updateUserSubscription({ field: "attempts", value: 0 });
      setAttemptsLeft(0);
  
      if (!interviewDone) {
        setShowSignOutPopup(true);
      }
  
      props?.onDisconnect?.(true);
      props?.onConnectButtonClicked?.();
    }

    setIsDisconnecting(true);
    completeInterview("is_completed", true);
    updateConnectionDetails(null);
  
    // Delay for a smooth transition
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
      const user_id = getUserId();

      // ✅ Check if document is uploaded
    // const documentUploaded = await readUserField(user_id, "document_uploaded");
    const documentUploaded = sessionStorage.getItem('upload_completed');
    if (!documentUploaded) {
      setPopupMessage("Please upload your PDF before starting the interview.");
      setShowPopup(true);
      return;
    }

      

  

      // Fetch user name and questions from the backend API
      const userName = await readUserField(user_id, "name");
      const userQuestions = await sessionStorage.getItem("interview_questions");      
      // using userName and time, generate a unique file path for saving chat history
      // no space allowed in file name. No special characters allowed in file name except underscore
      const sanitizedUserName =
        typeof userName === "string"
          ? userName.replace(/[^a-zA-Z0-9]/g, "_")
          : "unknown_user";

      const chatHistoryPath = `${encodeURIComponent(sanitizedUserName)}_${Date.now()}.txt`;



      // store the chat history path in local storage
      // sessionStorage.setItem("chatHistoryPath", chatHistoryPath);
      sessionStorage.setItem("chatHistoryPath", chatHistoryPath);

      // clear cachedFeedback from local storage if it exists
      sessionStorage.removeItem("cachedFeedback");
      console.log("User name:", userName);
      console.log("User questions:", userQuestions);

      // if REACT_APP_ENV === "local", set the POST URL to http://localhost:5001
      // else set the POST URL to the backend API URL
      const postUrl =
        process.env.REACT_APP_ENV === "local"
          ? "http://localhost:5001"
          : `${process.env.REACT_APP_CHEVENINGBREW_SERVER_URL}/token_service`;

      // Fetch connection details from the backend API
      const response = await axios.post(`${postUrl}`, {
        userName: userName,
        userQuestions: userQuestions,
        chatHistoryPath: chatHistoryPath,
      }); // Make GET request to your endpoint
      console.log("Connection details:", response.data);
      updateConnectionDetails(response.data);
      // Store the connection details in session storage
      sessionStorage.setItem("interview_Id", response.data.roomName); // Store the interview ID in session storage // Update the connection details with the API response
      createInterview(
       response.data.roomName,
        user_id,
        userQuestions
      );
      console.log("Interview created:", response.data.roomName, user_id, userQuestions);

      // Start the timer when connection is established
      setTimerActive(true);
    } catch (error) {
      console.error("Error fetching connection details", error);
      alert("Failed to fetch connection details");
    }
  }, [navigate]);

  const handleSignOutConfirm = () => {
    setShowSignOutPopup(false);
    // navigate("/feedback");
    handleSignOut(logout, navigate, user?.user_id);
  };
  
  const handleSignOutCancel = () => {
    setShowSignOutPopup(false);
    navigate("/feedback");
  };
  
  
  return (
    <MainLayout>
      <ActionBox>
      <SignOutPopup
        isOpen={showSignOutPopup}
        onConfirm={handleSignOutConfirm}
        onCancel={handleSignOutCancel}
        
      />
      {showPopup && (
        <Popup
          message={popupMessage}
          onClose={() => {
            setShowPopup(false);
            navigate("/upload");
          }}
        />
      )}
        <div className={`${styles.interviewContent} customScroll`}>
          {timerActive && (
            <div className="bg-white bg-opacity-80 px-3 py-1 rounded text-black font-mono font-bold inline-block mx-auto">
              {formatTime(timeRemaining)}
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className={styles.confirmDialogOverlay}>
              <div className={styles.confirmDialog}>
                <h3 className={styles.confirmDialogTitle}>
                  End Interview Early?
                </h3>
                <div className={`${styles.confirmDialogContent} customScroll`}>
                  <p className={styles.confirmDialogMessage}>
                    Are you sure you want to end the interview now? You will be
                    assessed only on what you've completed so far and will not
                    be allowed to retake the interview.
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
            </div>
          )}

          <main
            data-lk-theme="default"
            className="h-fit grid content-center w-full"
          >
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
        </div>
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
    <div className="h-[200px] w-fit max-w-[50vw] mx-auto">
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


    const [attemptsLeft, setAttemptsLeft] = useState(null);
  
    useEffect(() => {
      const fetchAttempts = async () => {
        const user_id = getUserId();
        if (!user_id) {
          console.error("No user email found.");
          return;
        }
  
        try {
          const result = await getUserSubscription({ user_id, field: "attempts" });
          setAttemptsLeft(result?.attempts ?? 0); // default to 0 if missing
        } catch (error) {
          console.error("Error fetching attempts:", error);
          setAttemptsLeft(0); // fallback
        }
      };
  
      fetchAttempts();
    }, []);
  


  return (
    
    // <div className="flex justify-center items-center gap-4">
    //   <button
    //   onClick={handleInterviewEnd}
    //   className="startButton"
    //   > Finish Interview ({attemptsLeft} left)</button>
    // </div>
    


    <div className="relative h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="startButton"
            onClick={props.onConnectButtonClicked}
          >
            Start your interview ({attemptsLeft} left)
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