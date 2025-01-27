import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrdersHistory = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingOrders, setPendingOrders] = useState([]);
    const [boughtItems, setBoughtItems] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [items, setItems] = useState({});
    const [sellers, setSellers] = useState({});
    const [buyers, setBuyers] = useState({});

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
                    })
                    .catch(err => {
                        console.error('Error fetching buyer orders:', err);
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
                    ...pendingOrders.flatMap(order => order.itemIds)
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
    }, [pendingOrders]);

    useEffect(() => {
        const fetchBoughtItems = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axios.get('/api/items/bought-items', { headers: { Authorization: token } });
                setBoughtItems(response.data);
            } catch (err) {
                console.error('Error fetching bought items:', err);
            }
        };
        fetchBoughtItems();
    }, []);

    useEffect(() => {
        const fetchSoldItems = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axios.get('/api/items/sold-items', { headers: { Authorization: token } });
                setSoldItems(response.data);
            } catch (err) {
                console.error('Error fetching sold items:', err);
            }
        };
        fetchSoldItems();
    }, []);

    useEffect(() => {
        const fetchBuyers = async () => {
            const token = localStorage.getItem('authToken');
            const buyerIds = [...new Set(soldItems.map(item => item.boughtBy))];
            if (buyerIds.length > 0) {
                try {
                    const response = await axios.post('/api/users/buyers', { buyerIds }, { headers: { Authorization: token } });
                    const buyersMap = response.data.reduce((acc, buyer) => {
                        acc[buyer._id] = `${buyer.firstName} ${buyer.lastName}`;
                        return acc;
                    }, {});
                    setBuyers(buyersMap);
                } catch (err) {
                    console.error('Error fetching buyers:', err);
                }
            }
        };
        fetchBuyers();
    }, [soldItems]);

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

    const renderBoughtItems = (items) => (
        items.map(item => (
            <div key={item.itemId} className="item-box">
                <p>Name: {item.name}</p>
                <p>Price: {item.price}</p>
                <p>Seller: {sellers[item.sellerId]}</p>
                <Link to={`/search-items/${item._id}`}>View Item</Link>
            </div>
        ))
    );

    const renderSoldItems = (items) => (
        items.map(item => (
            <div key={item.itemId} className="item-box">
                <p>Name: {item.name}</p>
                <p>Price: {item.price}</p>
                <p>Buyer: {buyers[item.boughtBy]}</p>
                <Link to={`/search-items/${item._id}`}>View Item</Link>
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
            {activeTab === 'bought' && renderBoughtItems(boughtItems)}
            {activeTab === 'sold' && renderSoldItems(soldItems)}
        </div>
    );
};

export default OrdersHistory;