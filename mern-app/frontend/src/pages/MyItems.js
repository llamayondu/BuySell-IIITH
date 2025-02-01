import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
        } else {
            axios.get('/api/auth-check', { headers: { Authorization: token } })
                .then(() => {
                    axios.get('/api/items/my-items', { headers: { Authorization: token } })
                        .then(response => {
                            setItems(response.data);
                        })
                        .catch(() => { window.location.href = '/'; });
                })
                .catch(() => { window.location.href = '/'; });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddItem = () => {
        setIsAdding(true);
    };

    const handleSaveItem = () => {
        const token = localStorage.getItem('authToken');
        axios.post('/api/items', formData, { headers: { Authorization: token } })
            .then(response => {
                setItems([...items, response.data]);
                setIsAdding(false);
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    category: ''
                });
            })
            .catch(err => {
                console.error(err);
                alert('Failed to add item');
            });
    };

    return (
        <div>
            <h1>My Items</h1>
            <div className="sub-navbar">
                <button className="styled-button" onClick={handleAddItem}>Add Item</button>
            </div>
            {isAdding && (
                <div className="input-container">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        <option value="clothing">Clothing</option>
                        <option value="grocery">Grocery</option>
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                    </select>
                    <div className="sub-navbar">
                        <button className="styled-button" onClick={handleSaveItem}>Save Item</button>
                    </div>
                </div>
            )}
            <h2>Items List</h2>
            <div className="items-grid">
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item._id} className="search-item-box">
                            <p>Name: {item.name}</p>
                            <p>Price: {item.price}</p>
                            <p>Description: {item.description}</p>
                            <p>Category: {item.category}</p>
                        </div>
                    ))
                ) : (
                    <p>No items found.</p>
                )}
            </div>
        </div>
    );
};

export default MyItems;
