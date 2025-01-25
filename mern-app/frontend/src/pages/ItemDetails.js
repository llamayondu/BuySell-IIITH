import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ItemDetails = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }
        axios.get('/api/auth-check', { headers: { Authorization: token } })
            .then(() => {
                axios.get(`/api/items/${itemId}`, { headers: { Authorization: token } })
                    .then(response => {
                        setItem(response.data);
                    })
                    .catch(() => {
                        navigate('/search-items');
                    });
            })
            .catch(() => {
                navigate('/');
            });
    }, [itemId, navigate]);

    const handleAddToCart = () => {
        const token = localStorage.getItem('authToken');
        axios.put('/api/users/me/cart/add', { itemId: item.itemId }, { headers: { Authorization: token } })
            .then(() => {
                alert('Item added to cart');
            })
            .catch(err => {
                console.error('Error adding item to cart:', err);
                alert('Failed to add item to cart');
            });
    };

    if (!item) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{item.name}</h2>
            <p>Category: {item.category}</p>
            <p>Description: {item.description}</p>
            <p>Price: {item.price}</p>
            <p>Seller: {item.sellerName}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
            <button onClick={() => navigate('/search-items')}>Back</button>
        </div>
    );
};

export default ItemDetails;