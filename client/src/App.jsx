import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [oneTyping, setOneTyping] = useState(false);
  let typingTimeout = null;

  useEffect(() => {
    const newSocket = io("http://localhost:4000/");
    setSocket(newSocket);

    newSocket.on("send-message-from-server", (message) => {
      setChats((prev) => [...prev, message]);
      setOneTyping(false); // Reset typing status when receiving a message
    });
    newSocket.on("isTyping", ({ selectedRoom, isTyping }) => {
      console.log("room", selectedRoom);
      // console.log("isTyping", isTyping);
      setOneTyping(isTyping);

      // Reset typing status after 3 seconds of inactivity
      clearTimeout(typingTimeout);
      if (isTyping) {
        typingTimeout = setTimeout(() => {
          setOneTyping(false);
        }, 3000);
      }
    });
    newSocket.on("joinRoom", (message) => {
      setChats((prev) => [...prev, message]);
      setOneTyping(false); // Reset typing status when receiving a message
    });

    // Clean up socket connection when component unmounts
    return () => {
      newSocket.disconnect();
      clearTimeout(typingTimeout);
    };
  }, []);

  useEffect(() => {
    // Generate rooms with UUIDs
    const newRooms = [
      { id: 1, name: "Room 1" },
      { id: 2, name: "Room 2" },
    ];
    setRooms(newRooms);
  }, []);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
    console.log("selectedRoom", selectedRoom);
    socket.emit("typing", { room: selectedRoom, isTyping: true });
  };

  const sendMessage = () => {
    if (socket && message.trim() !== "" && selectedRoom) {
      // Emit message to the server with selected room
      socket.emit("send-message", { room: selectedRoom, message });
      console.log("Message sent:", message);
      setMessage(""); // Clear input field
    } else {
      console.log("Please select a room and enter a message.");
    }
  };

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  useEffect(() => {
    // Perform actions whenever selectedRoom changes
    console.log("selectedRoom", selectedRoom);
    if (socket && selectedRoom) {
      socket.emit("joinRoom", selectedRoom);
    }
  }, [selectedRoom, socket]);

  return (
    <div>
      {oneTyping && <p>Someone is typing...</p>}
      <div>
        <select value={selectedRoom} onChange={handleRoomChange}>
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={message}
        onChange={handleMessageChange}
        placeholder="Type your message..."
      />
      <div>
        {chats.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
