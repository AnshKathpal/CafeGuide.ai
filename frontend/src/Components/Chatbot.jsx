import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Box } from "@chakra-ui/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import styled, { keyframes } from "styled-components";

export const Chatbot = () => {
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening, // Function to start voice recognition
    stopListening, // Function to stop voice recognition
  } = useSpeechRecognition();

  const [userMessage, setUserMessage] = useState("");
  const [chatResult, setChatResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cafeImage, setCafeImage] = useState(null);
  const [recommend, setRecommendImage] = useState([]);

  const [boxPosition, setBoxPosition] = useState(-3);

  const handleSlideClick = () => {
    const newPosition = boxPosition === -3 ? -49 : -3;
    setBoxPosition(newPosition);
  };

  const handleSubmitChat = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setUserMessage("");
    resetTranscript();

    try {
      let res = await axios.post("http://127.0.0.1:5000/chat", {
        question: userMessage || transcript,
      });
      console.log("Response from server:", res);
      const chatReply = await res.data.answer_from_chat;
      const chatRecommended = await res.data.recommended;
      console.log("Chat Reply:", chatReply);

      const updatedChatReply = formatLinksAsHTML(chatReply);

      const updatedConversation = [
        ...chatResult,
        { role: "user", content: userMessage || transcript },
        { role: "bot", content: updatedChatReply },
      ];

      if (res.data.image) {
        // Include the "image" key in the response
        // updatedConversation.push({ role: "bot", content: res.data.image });
        setCafeImage({ role: "bot", content: res.data.image });
      }

      setChatResult(updatedConversation);
      setRecommendImage(chatRecommended);
      console.log("Updated Chat Reply:", updatedConversation);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const formatLinksAsHTML = (text) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Replace URLs in the text with clickable links
    const formattedText = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });

    return formattedText;
  };

  // const isLink = (text) => {
  //   const urlPattern = /^(https?:\/\/[^\s]+)/;
  //   return urlPattern.test(text);
  // };

  console.log(chatResult, "result");

  console.log(cafeImage, "image");

  console.log(recommend, "recommend");

  return (
    <Box h="100vh" display="Flex" className="main" bg="pink">
      <Box w="35%" border="1px solid red">
        <Box>
          {cafeImage
            ? cafeImage.content.map((imageURL) => <img src={imageURL} alt="" />)
            : null}
        </Box>
      </Box>
      <Box w="65%" border="1px solid black" pos="relative" zIndex={1}>
        <Box
          border="2px solid green"
          w="50%"
          h="80vh"
          pos="absolute"
          left={`${boxPosition}%`}
          top={"10%"}
          bg="red"
          className="recommendedBox"
          transition="left 0.5s ease-in-out"
          zIndex={-1}
        >
          <Button
            className="slideClick"
            pos={"absolute"}
            left="0"
            onClick={handleSlideClick}
            top="45%"
          ></Button>

          <Box>
          </Box>
        </Box>

        <form
          onSubmit={handleSubmitChat}
          action=""
          style={{ padding: "20px", height: "20%", backgroundColor: "white" }}
        >
          <Button
            onClick={SpeechRecognition.startListening}
            style={{ marginRight: "10px" }}
          >
            Start Voice
          </Button>
          <Button onClick={stopListening} style={{ marginRight: "10px" }}>
            Stop Voice
          </Button>
          <Button onClick={resetTranscript} style={{ marginRight: "10px" }}>
            Reset Voice
          </Button>
          <Input
            border="1px solid black"
            h="50px"
            fontSize={"xl"}
            type="text"
            value={userMessage || transcript}
            onChange={(e) => setUserMessage(e.target.value)}
            textAlign="center"
            placeholder="Ask Questions from your PDF here.."
            fontWeight={"semibold"}
          />
          <Button
            _hover={{ bg: "#0F2C59" }}
            color="white"
            bg="#0F2C59"
            mt="15px"
            type="submit"
          >
            Submit
          </Button>
        </form>

        <Box h="80%" overflowY="scroll" backgroundColor={"white"}>
          {chatResult.map((message, index) => (
            <div
              key={index}
              className={`message-container ${
                message.role === "user" ? "user-message" : "bot-message"
              }`}
              style={{
                display: "flex",
                justifyContent: `${
                  message.role === "user" ? "flex-end" : "flex-start"
                }`,
                width: "100%",
                padding: "10px 30px 10px 30px",
              }}
            >
              <div
                className={`message-container ${
                  message.role === "user" ? "user-message" : "bot-message"
                }`}
                style={{
                  width: `${message.role === "user" ? "30%" : "70%"}`,
                  backgroundColor: "#0F2C59",
                  color: "white",
                  padding: "10px",
                  borderRadius: "30px",
                  boxShadow:
                    "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
                }}
              >
                <strong>{message.role === "user" ? "You" : "Bot"}:</strong>{" "}
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              </div>
            </div>
          ))}

          <Box>
            {/* {isLoading && (
            <div className="loader" style={{ textAlign: "center"}}>
              <img
                style={{ mixBlendMode: "multiply", width: "15%", position : "relative", left : "20px" }}
                src={loading}
                alt=""
              />
            </div>
          )} */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
