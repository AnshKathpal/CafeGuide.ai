import React, { useState } from 'react'
import axios from "axios"
import {Input,Button,Box} from "@chakra-ui/react"

export const Chatbot = () => {

    const [userMessage, setUserMessage] = useState("");
    const [chatResult, setChatResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitChat = async (e) => {
        e.preventDefault();
    
        setIsLoading(true);
        setUserMessage("")
    
        try {
          let res = await axios.post("http://127.0.0.1:5000/chat", {
            question: userMessage,
          });
          console.log("Response from server:", res);
          const chatReply = await res.data.answer_from_chat;
          console.log("Chat Reply:", chatReply);
    
          const updatedChatReply = formatLinksAsHTML(chatReply);
          
          const updatedConversation = [
            ...chatResult,
            { role: "user", content: userMessage },
            { role: "bot", content: updatedChatReply },
          ];
    
          setChatResult(updatedConversation);
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

  return (
    <>
    
    <form
            onSubmit={handleSubmitChat}
            action=""
            style={{ padding: "20px", height: "20%" }}
          >
            <Input
              border="1px solid black"
              h="50px"
              fontSize={"xl"}
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              textAlign="center"
              placeholder="Ask Questions from your PDF here.."
              fontWeight={"semibold"}c
            />
            <Button _hover={{bg : "#0F2C59"}} color = "white" bg = "#0F2C59" mt="15px" type="submit">
              Submit
            </Button>
          </form>
    

          <Box h="80%" overflowY="scroll">
        {chatResult.map((message, index) => (
          <div
            key={index}
            className={`message-container ${message.role === "user" ? "user-message" : "bot-message"}`}
            style={{
              display: "flex",
              justifyContent: `${message.role === "user" ? "flex-end" : "flex-start"}`,
              width: "100%",
              padding: "10px 30px 10px 30px",
            }}
          >
            <div
              className={`message-container ${message.role === "user" ? "user-message" : "bot-message"}`}
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
    </>
  )
}
