import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import SearchItems from './pages/SearchItems';
import OrdersHistory from './pages/OrdersHistory';
import DeliverItems from './pages/DeliverItems';
import MyCart from './pages/MyCart';
import Support from './pages/Support';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import MyItems from './pages/MyItems';
import ItemDetails from './pages/ItemDetails';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get('/api/auth-check', { headers: { Authorization: token } })
                .then(() => {
                    window.location.href = '/home';
                })
                .catch(() => {
                    localStorage.removeItem('authToken');
                });
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/users/login', { email, password });
            console.log("Login response: ", res.data); // Debugging statement
            localStorage.setItem('authToken', res.data.token);
            window.location.href = '/home';
        } catch (err) {
            console.error("Login error: ", err); // Debugging statement
            alert('Login failed');
        }
    };

    return (
        <div>
            <h1>Login Page</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
            <button>
                <Link to="/register">Go to Register</Link>
            </button>
        </div>
    );
};

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const allowedDomains = ["students.iiit.ac.in", "research.iiit.ac.in"];
        const emailDomain = email.split("@")[1];
        if (!allowedDomains.some((d) => emailDomain.endsWith(d))) {
            alert("Invalid email domain. Use an IIIT domain.");
            return;
        }
        try {
            await axios.post('/api/users', {
                firstName,
                lastName,
                email,
                age,
                contactNumber,
                password
            });
            alert("Registered successfully!");
            setFirstName('');
            setLastName('');
            setEmail('');
            setAge('');
            setContactNumber('');
            setPassword('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

const HomePage = () => {
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/';
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
        } else {
            axios.get('/api/auth-check', {
                headers: { Authorization: token },
            }).catch(() => {
                window.location.href = '/';
            });
        }
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
};

function App() {
    const path = window.location.pathname;
    return (
        <>
            {path !== '/' && path !== '/register' && <Navbar />}
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-items" element={<MyItems />} />
                <Route path="/search-items" element={<SearchItems />} />
                <Route path="/orders-history" element={<OrdersHistory />} />
                <Route path="/deliver-items" element={<DeliverItems />} />
                <Route path="/my-cart" element={<MyCart />} />
                <Route path="/support" element={<Support />} />
                <Route path="/search-items/:itemId" element={<ItemDetails />} />
            </Routes>
        </>
    );
}

export default App;