import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Box, Flex, Text, Grid } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import styled, { keyframes } from "styled-components";
import { FaMicrophone } from "react-icons/fa";
import logo from "../Images/logo.png";
import loading from "../Images/loader.gif";
import { Progress } from "@chakra-ui/progress";

const messages = [
  "Don't rush loading; savor your cafe plans instead.",
  "While our app loads, we're brewing up the perfect cafe experience just for you.",
  "I asked my app how it's doing, and it replied, 'Still loading... and searching the best for you.",
  "Slow loading, quick romantic date – that's our promise.",
  "Delay the app, not the romance. Plan your date as we load.",
  "Loading delay: the perfect time to dream of a romantic date.",
  "Loading for your cafe party perfection.",
  "Our app takes time; your party's worth it."
];

export const Chatbot = () => {
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening, // Function to start voice recognition
    stopListening, // Function to stop voice recognition
  } = useSpeechRecognition();

  const [messageIndex, setMessageIndex] = useState(0);
  const [userMessage, setUserMessage] = useState("");
  const [chatResult, setChatResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cafeImage, setCafeImage] = useState(null);
  const [recommend, setRecommendImage] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const [boxPosition, setBoxPosition] = useState(-3);

  const [boxPositiotop, setBoxPositionTop] = useState(-66);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000); 

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSlideClick = () => {
    if (window.innerWidth >= 479) {
      const newPosition = boxPosition === -3 ? -49 : -3;
      setBoxPosition(newPosition);
    } else if (window.innerWidth <= 479) {
      const newPosition = boxPositiotop === -66 ? 2 : -66;
      setBoxPositionTop(newPosition);
    }
  };

  const simulateLoading = () => {
    setProgress(0); // Reset progress to 0

    const interval = 100; // Adjust this interval as needed
    const duration = 143000; // Adjust this duration as needed

    const steps = duration / interval;

    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        const newProgress = (i / steps) * 100;
        setProgress(newProgress);
      }, i * interval);
    }
  };

  const handleSubmitChat = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setUserMessage("");
    resetTranscript();
    simulateLoading();

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
      setIsSubmitting(false);
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

  console.log(isSubmitting, "submitted");

  return (
    <Box
      h="100vh"
      display="Flex"
      className="main"
      bg="rgb(243,243,243)"
      flexDirection={{ base: "column", sm: "row" }}
    >
      <Flex
        w={{ base: "100%", sm: "35%" }}
        pos="relative"
        // border = "1px solid blue"
        justifyContent="center"
        alignItems={"center"}
        bg="rgb(243,243,243)"
        zIndex={{ base: "2", sm: "0" }}
      >
        <Box>
          <LogoImg style={{ width: "90%", margin: "auto" }} src={logo} alt="" />
          <Text
            fontSize={{ base: "5xl", sm: "6xl" }}
            p={{ base: 4, sm: 0 }}
            color="rgb(249,113,87)"
            style={{ textShadow: "2px 2px 0 #000" }}
            fontFamily="pacifico"
          >
            CafeGuide.ai
          </Text>
        </Box>
      </Flex>
      <Box
        w={{ base: "100%", sm: "65%" }}
        top={{ base: "0", sm: "0" }}
        h={{ base: "88vh", sm: "auto" }}
        shadow={
          "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;"
        }
        pos="relative"
        zIndex={1}
      >
        <Flex
          // display="none"
          w={{ base: "85%", sm: "50%" }}
          h={{ base: "60vh", sm: "80vh" }}
          pos="absolute"
          left={{ base: "7%", sm: `${boxPosition}%` }}
          top={{ base: `${boxPositiotop}%`, sm: "10%" }}
          bg="rgb(253,100,90)"
          className="recommendedBox"
          transition={{
            base: "top 0.5s ease-in-out",
            sm: "left 0.5s ease-in-out",
          }}
          zIndex={{ base: "1", sm: "-1" }}
          overflow="hidden"
          justifyContent={"center"}
          alignItems="center"
          shadow={
            "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;"
          }
          borderRadius="10px"
        >
          <Button
            className="slideClick"
            pos={"absolute"}
            left={{ base: "44%", sm: "0" }}
            onClick={handleSlideClick}
            top={{ base: "95%", sm: "45%" }}
            w={{ base: "50px", sm: "10px" }}
            h={{ base: "20px", sm: "40px" }}
          >
            {" "}
          </Button>

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
                w="70%"
                m="auto"
                bg="white"
                shadow={
                  " rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset"
                }
                borderRadius="20px"
              >
                <Box w="100%" p={{ base: "3", sm: "2" }}>
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

        <Box
          h="80%"
          overflowY="scroll"
          backgroundColor={"white"}
          p={{ base: "1", sm: "5" }}
        >
          {chatResult.map((message, index) => (
            <ChatConvo
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
              }}
            >
              <div
                className={`message-container ${
                  message.role === "user" ? "user-message" : "bot-message"
                }`}
                style={{
                  width: `${message.role === "user" ? "50%" : "80%"}`,
                  backgroundColor: "#ece8e8",
                  color: "black",
                  padding: "10px",
                  borderRadius: "30px",
                  fontFamily: "Cabin",
                  boxShadow:
                    "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
                }}
              >
                <strong>{message.role === "user" ? "You" : "Bot"}:</strong>{" "}
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                {message.role === "bot" &&
                  message.images &&
                  message.images.length > 0 && (
                    <Grid
                      templateColumns={{
                        base: "repeat(1,1fr)",
                        sm: "repeat(3,1fr)",
                      }}
                      gap="3"
                      p="3"
                      placeItems={"center"}
                    >
                      {message.images.map((imageURL) => (
                        <img
                          style={{
                            // width: "32%",
                            height: "150px",
                            borderRadius: "10px",
                          }}
                          key={imageURL}
                          src={imageURL}
                          alt=""
                        />
                      ))}
                    </Grid>
                  )}
              </div>
            </ChatConvo>
          ))}

          <Box>
            {isLoading && (
              <div
                className="loader"
                style={{ textAlign: "center", marginTop: "60px" }}
              >
                <LoadingImg
                  style={{
                    mixBlendMode: "multiply",
                    position: "relative",
                  }}
                  src={loading}
                  alt=""
                />
                {/* <div style={{ fontSize: "24px" }}>{Math.round(progress)}%</div> */}
                <Progress
                  w="60%"
                  m="auto"
                  hasStripe
                  value={progress}
                  colorScheme="orange"
                />
                <div>
                  <Text color="rgb(154,0,0)" mt = "10px" fontWeight={"bold"} >{messages[messageIndex]}</Text>
                </div>
              </div>
            )}
          </Box>
        </Box>

        <Form
          onSubmit={handleSubmitChat}
          action=""
          style={{ height: "20%", backgroundColor: "white" }}
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
              isDisabled={isSubmitting}
            />
            <Button
              onClick={SpeechRecognition.startListening}
              // style={{ marginRight: "10px" }}
              bg="rgb(253,100,90)"
              color={"white"}
              _hover={{ bg: "#d8544b" }}
              h="50px"
              isDisabled={isSubmitting}
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
            isDisabled={isSubmitting}
          >
            Submit
          </Button>
        </Form>
      </Box>
    </Box>
  );
};

const Form = styled.form`
  padding: 20px;

  @media screen and (max-width: 479px) {
    padding: 5px;
  }
`;

const LoadingImg = styled.img`
  width: 15%;
  left: 40%;

  @media screen and (max-width: 479px) {
    width: 30%;
    left: 35%;
  }
`;

const ChatConvo = styled.div`
  padding: 10px 30px 10px 30px;

  @media screen and (max-width: 479px) {
    margin-top: 30px;
  }
`;

const LogoImg = styled.img`
  display: inline;

  @media screen and (max-width: 479px) {
    display: none;
  }
`;
