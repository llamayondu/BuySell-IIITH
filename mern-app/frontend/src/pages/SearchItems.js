import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SearchItems = () => {
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        axios.get('/api/items') // Fetch all items
            .then(response => {
                setItems(response.data.filter(item => item.boughtBy === null)); // Filter items with boughtBy as null
                // console.log("Fetching Items: ");
            })
            .catch(err => {
                console.error('Error fetching items:', err);
                window.location.href = '/';
            });
    }, []);

    const filteredItems = items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = categoryFilter ? item.category === categoryFilter : true;
        const priceMatch = maxPrice ? item.price <= parseFloat(maxPrice) : true;
        return nameMatch && categoryMatch && priceMatch;
    });

    return (
        <div>
            <h1>Search Items</h1>
            <input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="grocery">Grocery</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
            </select>
            <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
            />
            <div className="items-grid">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <div key={item._id} className="search-item-box">
                            <p>Name: {item.name}</p>
                            <p>Price: {item.price}</p>
                            <Link to={`/search-items/${item._id}`}>View Item</Link>
                        </div>
                    ))
                ) : (
                    <p>No items found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchItems;