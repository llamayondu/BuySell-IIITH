import React from 'react';
import { Link } from 'react-router-dom';
// import './Navbar.css';

const Navbar = () => {

    return (
        <div className="navbar">
            <Link to="/profile">Profile</Link>
            <Link to="/my-items">My Items</Link>
            <Link to="/search-items">Search Items</Link>
            <Link to="/orders-history">Orders History</Link>
            <Link to="/deliver-items">Deliver Items</Link>
            <Link to="/my-cart">My Cart</Link>
            <Link to="/support">Support</Link>
        </div>
    );
};

export default Navbar;
