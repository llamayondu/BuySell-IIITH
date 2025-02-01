import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages([...messages, userMessage]);

        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            console.log('API Key:', apiKey); // Debugging statement

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC63n_VX9_O-uqa4bnSVKqPQTRuNhgaL6Q`,
                {
                    contents: [{
                        parts: [{ text: input }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Gemini API response:', response.data);

            const candidates = response.data?.candidates;
            console.log('Candidates:', candidates); // Debugging statement

            const botMessageText = candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand that.';
            const botMessage = { sender: 'bot', text: botMessageText };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            console.error('Error sending message to Gemini API:', error);
            console.error('Error response:', error.response);
            const botMessage = { sender: 'bot', text: 'Sorry, there was an error processing your request.' };
            setMessages([...messages, userMessage, botMessage]);
        }

        setInput('');
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chatbot-message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Chatbot;

