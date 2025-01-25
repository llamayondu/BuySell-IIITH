import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyCart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
            return;
        }
        axios.get('/api/auth-check', { headers: { Authorization: token } })
            .then(() => {
                axios.get('/api/users/me', { headers: { Authorization: token } })
                    .then(response => {
                        const itemIds = response.data.itemsInCart;
                        axios.post('/api/items/cart-items', { itemIds }, { headers: { Authorization: token } })
                            .then(res => {
                                setCartItems(res.data);
                            })
                            .catch(err => {
                                console.error('Error fetching cart items:', err);
                            });
                    })
                    .catch(() => {
                        window.location.href = '/';
                    });
            })
            .catch(() => {
                window.location.href = '/';
            });
    }, []);

    const handleRemoveFromCart = (itemId) => {
        const token = localStorage.getItem('authToken');
        axios.put('/api/users/me/cart/remove', { itemId }, { headers: { Authorization: token } })
            .then(() => {
                setCartItems(cartItems.filter(item => item.itemId !== itemId));
            })
            .catch(err => {
                console.error('Error removing item from cart:', err);
                alert('Failed to remove item from cart');
            });
    };

    return (
        <div>
            <h1>My Cart</h1>
            <ul>
                {cartItems.map(item => (
                    <li key={item.itemId}>
                        <p>Name: {item.name}</p>
                        <p>Price: {item.price}</p>
                        <Link to={`/search-items/${item._id}`}>View Item</Link>
                        <button onClick={() => handleRemoveFromCart(item.itemId)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyCart;