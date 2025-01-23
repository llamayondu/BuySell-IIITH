import React, { useEffect } from 'react';
import axios from 'axios';

const MyCart = () => {
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
            <h1>My Cart</h1>
        </div>
    );
};

export default MyCart;
