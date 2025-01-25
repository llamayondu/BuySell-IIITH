import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersHistory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingOrders, setPendingOrders] = useState([]);
    const [boughtItems, setBoughtItems] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [items, setItems] = useState({});
    const [sellers, setSellers] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
            return;
        }
        axios.get('/api/auth-check', { headers: { Authorization: token } })
            .then(() => {
                axios.get('/api/orders/buyer-orders', { headers: { Authorization: token } })
                    .then(response => {
                        setPendingOrders(response.data.filter(order => order.pending));
                        setBoughtItems(response.data.filter(order => !order.pending));
                    })
                    .catch(err => {
                        console.error('Error fetching buyer orders:', err);
                    });
                axios.get('/api/orders/seller-orders', { headers: { Authorization: token } })
                    .then(response => {
                        setSoldItems(response.data);
                    })
                    .catch(err => {
                        console.error('Error fetching seller orders:', err);
                    });
            })
            .catch(() => {
                window.location.href = '/';
            });
    }, []);

    useEffect(() => {
        const fetchItemsAndSellers = async () => {
            const token = localStorage.getItem('authToken');
            const allItemIds = [
                ...new Set([
                    ...pendingOrders.flatMap(order => order.itemIds),
                    ...boughtItems.flatMap(order => order.itemIds),
                    ...soldItems.flatMap(order => order.itemIds)
                ])
            ];
            if (allItemIds.length > 0) {
                try {
                    const response = await axios.post('/api/items/cart-items', { itemIds: allItemIds }, { headers: { Authorization: token } });
                    const itemsMap = response.data.reduce((acc, item) => {
                        acc[item.itemId] = item;
                        return acc;
                    }, {});
                    setItems(itemsMap);

                    const sellerIds = [...new Set(response.data.map(item => item.sellerId))];
                    const sellersResponse = await axios.post('/api/users/sellers', { sellerIds }, { headers: { Authorization: token } });
                    const sellersMap = sellersResponse.data.reduce((acc, seller) => {
                        acc[seller._id] = `${seller.firstName} ${seller.lastName}`;
                        return acc;
                    }, {});
                    setSellers(sellersMap);
                } catch (err) {
                    console.error('Error fetching items or sellers:', err);
                }
            }
        };
        fetchItemsAndSellers();
    }, [pendingOrders, boughtItems, soldItems]);

    const renderOrders = (orders) => (
        orders.map(order => (
            <div key={order.transactionId} className="order-box">
                <h3>Order ID: {order.transactionId}</h3>
                <p>Amount: {order.amount}</p>
                <div className="items-box">
                    {order.itemIds.map(itemId => {
                        const item = items[itemId];
                        if (!item) return null;
                        return (
                            <div key={item.itemId} className="item-box">
                                <p>Name: {item.name}</p>
                                <p>Price: {item.price}</p>
                                <p>Seller: {sellers[item.sellerId]}</p>
                            </div>
                        );
                    })}
                </div>
                <hr />
            </div>
        ))
    );

    return (
        <div>
            <h1>Orders History</h1>
            <div className="sub-navbar">
                <button onClick={() => setActiveTab('pending')}>Pending Orders</button>
                <button onClick={() => setActiveTab('bought')}>Bought Items</button>
                <button onClick={() => setActiveTab('sold')}>Sold Items</button>
            </div>
            {activeTab === 'pending' && renderOrders(pendingOrders)}
            {activeTab === 'bought' && renderOrders(boughtItems)}
            {activeTab === 'sold' && renderOrders(soldItems)}
        </div>
    );
};

export default OrdersHistory;