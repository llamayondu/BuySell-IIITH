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

    const handlePlaceOrder = () => {
        const token = localStorage.getItem('authToken');
        const itemIds = cartItems.map(item => item.itemId);
        const sellerIds = [...new Set(cartItems.map(item => item.sellerId))]; // Collect sellerIds from cart items
        axios.post('/api/orders/place-order', { itemIds, sellerIds }, { headers: { Authorization: token } })
            .then(response => {
                alert('Order placed successfully.\nHere is your otp, keep it safe until the order arrives: ' + response.data.unhashedOtp);
                console.log('Unhashed OTPs:', response.data.unhashedOtp);
                setCartItems([]);
                // Clear the user's cart
                axios.put('/api/users/me/cart/clear', {}, { headers: { Authorization: token } })
                    .then(() => {
                        console.log('Cart cleared successfully');
                        // Create a completed dummy order
                        axios.post('/api/orders/completed', { itemIds, sellerIds }, { headers: { Authorization: token } })
                            .then(() => {
                                console.log('Completed dummy order created successfully');
                            })
                            .catch(err => {
                                console.error('Error creating completed dummy order:', err);
                            });
                    })
                    .catch(err => {
                        console.error('Error clearing cart:', err);
                    });
            })
            .catch(err => {
                console.error('Error placing order:', err);
                alert('Failed to place order');
            });
    };

    return (
        <div>
            <h1>My Cart</h1>
            <ul className="items-list">
                {cartItems.length > 0 ? (
                    cartItems.map(item => (
                        <li key={item.itemId} className="item-box">
                            <p>Name: {item.name}</p>
                            <p>Price: {item.price}</p>
                            <Link to={`/search-items/${item._id}`}>View Item</Link>
                            <button onClick={() => handleRemoveFromCart(item.itemId)}>Remove</button>
                        </li>
                    ))
                ) : (
                    <p>No items in cart.</p>
                )}
            </ul>
            {cartItems.length > 0 && <button onClick={handlePlaceOrder}>Place Order</button>}
        </div>
    );
};

export default MyCart;