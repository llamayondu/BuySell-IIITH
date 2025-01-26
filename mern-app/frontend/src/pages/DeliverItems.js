import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import

const DeliverItems = () => {
    const [items, setItems] = useState([]);
    const [otp, setOtp] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;
            console.log('User ID:', userId); // Debugging statement

            if (!userId) {
                console.error('User ID is undefined');
                window.location.href = '/';
                return;
            }

            axios.get('/api/orders/seller-orders', { headers: { Authorization: token } })
                .then(response => {
                    const sellerOrders = response.data.filter(order => order.pending); // Filter only pending orders
                    const itemIds = sellerOrders.flatMap(order => order.itemIds);
                    const buyerIds = [...new Set(sellerOrders.map(order => order.buyerId))];

                    if (itemIds.length > 0) {
                        axios.post('/api/items/cart-items', { itemIds }, { headers: { Authorization: token } })
                            .then(itemsResponse => {
                                const itemsMap = itemsResponse.data.reduce((acc, item) => {
                                    acc[item.itemId] = item;
                                    return acc;
                                }, {});

                                axios.post('/api/users/buyers', { buyerIds }, { headers: { Authorization: token } })
                                    .then(buyersResponse => {
                                        const buyersMap = buyersResponse.data.reduce((acc, buyer) => {
                                            acc[buyer._id] = `${buyer.firstName} ${buyer.lastName}`;
                                            return acc;
                                        }, {});

                                        const itemsWithBuyers = sellerOrders.flatMap(order => {
                                            console.log("Order Seller IDs:", order.sellerIds); // Debug statement
                                            if (!order.sellerIds.includes(userId)) {
                                                console.log("wrong order")
                                                return []; // Skip orders where the logged-in user is not a seller
                                            }
                                            return order.itemIds.map(itemId => {
                                                const item = itemsMap[itemId];
                                                if (item && item.sellerId === userId) {
                                                    return {
                                                        ...item,
                                                        buyer: buyersMap[order.buyerId],
                                                        orderId: order._id // Add orderId to each item
                                                    };
                                                }
                                                return null;
                                            }).filter(item => item !== null);
                                        });

                                        setItems(itemsWithBuyers);
                                    })
                                    .catch(err => {
                                        console.error('Error fetching buyers:', err);
                                        window.location.href = '/';
                                    });
                            })
                            .catch(err => {
                                console.error('Error fetching items:', err);
                                window.location.href = '/';
                            });
                    } else {
                        setItems([]);
                    }
                })
                .catch(err => {
                    console.error('Error fetching seller orders:', err);
                    window.location.href = '/';
                });
        } catch (error) {
            console.error('Error decoding token:', error);
            window.location.href = '/';
        }
    }, []);

    const handleCompleteOrder = (orderId) => {
        setSelectedOrderId(orderId);
    };

    const handleVerifyOtp = () => {
        const token = localStorage.getItem('authToken');
        axios.post('/api/orders/verify-otp', { orderId: selectedOrderId, otp }, { headers: { Authorization: token } })
            .then(response => {
                alert('OTP verified successfully');
                setOtp('');
                setSelectedOrderId(null);
                // Refresh the items list
                const updatedItems = items.filter(item => item.orderId !== selectedOrderId);
                setItems(updatedItems);
            })
            .catch(err => {
                console.error('Error verifying OTP:', err);
                alert('Failed to verify OTP');
            });
    };

    return (
        <div>
            <h1>Deliver Items</h1>
            <div className="items-list">
                {items.map(item => (
                    <div key={item.itemId} className="item-box">
                        <p>Name: {item.name}</p>
                        <p>Price: {item.price}</p>
                        <p>Buyer: {item.buyer}</p>
                        <button onClick={() => handleCompleteOrder(item.orderId)}>Complete Order</button>
                    </div>
                ))}
            </div>
            {selectedOrderId && (
                <div>
                    <h2>Enter OTP to Complete Order</h2>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                    />
                    <button onClick={handleVerifyOtp}>Verify OTP</button>
                </div>
            )}
        </div>
    );
};

export default DeliverItems;