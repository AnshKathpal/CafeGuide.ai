import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import styled, { keyframes } from "styled-components";
import { FaMicrophone } from "react-icons/fa";
import logo from "../Images/logo.png"

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
        {
          role: "bot",
          content: updatedChatReply,
          images: res.data.image || [],
        },
      ];

      if (res.data.image) {
        if (res.data.image.length > 0) {
          // Check if there are images in the response
          const imageContent = res.data.image.map((imageURL) => (
            <img key={imageURL} src={imageURL} alt="" />
          ));
          setCafeImage({ role: "bot", content: imageContent });
        } else {
          setCafeImage(null);
        }
      } else {
        setCafeImage(null);
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
    <Box h="100vh" display="Flex" className="main" bg="rgb(243,243,243)">
      <Flex w="35%" pos = "relative"  justifyContent = "center" alignItems={"center"} >
        <Box >
        <img  style={{width : "90%", margin : "auto"}} src={logo} alt="" />
        <Text fontSize={"6xl"} color = "rgb(249,113,87)" style={{ textShadow: "2px 2px 0 #000" }} fontFamily = "pacifico" >CafeGuide.ai</Text>
        </Box>
        {/* <Box>
          {cafeImage
            ? cafeImage.content.map((imageURL) => <img src={imageURL} alt="" />)
            : null}
        </Box> */}
      </Flex>
      <Box w="65%" shadow={"rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;"} pos="relative" zIndex={1}>
        <Flex
          w="50%"
          h="80vh"
          pos="absolute"
          left={`${boxPosition}%`}
          top={"10%"}
          bg="rgb(253,100,90)"
          className="recommendedBox"
          transition="left 0.5s ease-in-out"
          zIndex={-1}
          overflow="hidden"
          justifyContent={"center"}
          alignItems="center"
          shadow={
            "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;"
          }
        >
          <Button
            className="slideClick"
            pos={"absolute"}
            left="0"
            onClick={handleSlideClick}
            top="45%"
          ></Button>

          <Flex
            direction={"column"}
            overflowY="scroll"
            maxHeight="90%"
            gap="5"
            p="2"
          >
            {recommend.map((item) => (
              <Flex
                direction={"column"}
                // border="1px solid white"
                w="70%"
                m="auto"
                bg="white"
                shadow={
                  " rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset"
                }
                borderRadius="20px"
              >
                <Box w="100%" p="2">
                  <img
                    style={{ borderRadius: "10px" }}
                    src={item.image}
                    alt=""
                  />
                </Box>
                <Box pb="3">
                  <Text fontSize={"lg"} fontWeight={"bold"}>
                    {item.name}
                  </Text>
                  <Flex
                    m="auto"
                    justifyContent={"center"}
                    alignItems="center"
                    w="10%"
                    h="30px"
                    bg="rgb(92,167,39)"
                    color="white"
                    borderRadius="7px"
                  >
                    {item.rating}
                  </Flex>
                  <Link to={item.location}>
                    <Text fontWeight={"bold"} color={"rgb(89,166,255)"}>
                      Get Directions
                    </Text>
                  </Link>
                  <Text>{item.address}</Text>
                  {/* <Link to={item.booking}> */}
                  <a href={item.booking}>
                    <Text fontWeight={"bold"} color="rgb(253,100,90)">
                      Reserve
                    </Text>
                  </a>
                  {/* </Link> */}
                </Box>
              </Flex>
            ))}
          </Flex>
        </Flex>

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
                  backgroundColor: "rgb(253,100,90)",
                  color: "black",
                  padding: "10px",
                  borderRadius: "30px",
                  boxShadow:
                    "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
                }}
              >
                <strong>{message.role === "user" ? "You" : "Bot"}:</strong>{" "}
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                {message.role === "bot" &&
                  message.images &&
                  message.images.length > 0 && (
                    <Flex p="3" justifyContent={"space-between"}>
                      {message.images.map((imageURL) => (
                        <img
                          style={{
                            width: "32%",
                            height: "150px",
                            borderRadius: "10px",
                          }}
                          key={imageURL}
                          src={imageURL}
                          alt=""
                        />
                      ))}
                    </Flex>
                  )}
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

        <form
          onSubmit={handleSubmitChat}
          action=""
          style={{ padding: "20px", height: "20%", backgroundColor: "white" }}
        >
          <Flex justifyContent={"space-evenly"} alignItems="center">
            <Input
              border="1px solid black"
              h="50px"
              fontSize={"xl"}
              type="text"
              value={userMessage || transcript}
              onChange={(e) => setUserMessage(e.target.value)}
              textAlign="center"
              placeholder="I will help you find what you need.."
              fontWeight={"semibold"}
              w="80%"
            />
            <Button
              onClick={SpeechRecognition.startListening}
              // style={{ marginRight: "10px" }}
              bg="rgb(253,100,90)"
              color={"white"}
              _hover={{ bg: "#d8544b" }}
              h="50px"
            >
              <FaMicrophone />
            </Button>
          </Flex>
          {/* <Button onClick={stopListening} style={{ marginRight: "10px" }}>
            Stop Voice
          </Button>
          <Button onClick={resetTranscript} style={{ marginRight: "10px" }}>
            Reset Voice
          </Button> */}
          <Button
            _hover={{ bg: "#d8544b" }}
            color="white"
            bg="rgb(253,100,90)"
            mt="15px"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Box>
    </Box>
  );
};
