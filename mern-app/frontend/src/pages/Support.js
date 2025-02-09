import React, { useEffect } from 'react';
import axios from 'axios';
import Chatbot from '../components/Chatbot';

const Support = () => {
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
        } else {
            axios.get('/api/auth-check', { headers: { Authorization: token } })
                .catch(() => { window.location.href = '/'; });
        }
    }, []);

    return (
        <div>
            <h1>Support</h1>
            <Chatbot />
        </div>
    );
};

export default Support;
