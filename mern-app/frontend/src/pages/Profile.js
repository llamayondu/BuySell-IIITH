import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        contactNumber: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
        } else {
            axios.get('/api/auth-check', { headers: { Authorization: token } })
                .then(() => {
                    axios.get('/api/users/me', { headers: { Authorization: token } })
                        .then(response => {
                            setUser(response.data);
                            setFormData({
                                firstName: response.data.firstName,
                                lastName: response.data.lastName,
                                email: response.data.email,
                                age: response.data.age,
                                contactNumber: response.data.contactNumber
                            });
                        })
                        .catch(() => { window.location.href = '/'; });
                })
                .catch(() => { window.location.href = '/'; });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/';
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        const token = localStorage.getItem('authToken');
        axios.put('/api/users/me', formData, { headers: { Authorization: token } })
            .then(response => {
                setUser(response.data);
                setIsEditing(false);
            })
            .catch(err => {
                console.error(err);
                alert('Failed to update profile');
            });
    };

    return (
        <div>
            <h1>Profile</h1>
            {isEditing ? (
                <div className="input-container">
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                    />
                    <div className="sub-navbar">
                        <button onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Full Name: {user.firstName} {user.lastName}</p>
                    <p>Email: {user.email}</p>
                    <p>Age: {user.age}</p>
                    <p>Contact Number: {user.contactNumber}</p>
                    <div className="sub-navbar">
                        <button onClick={handleEdit}>Edit</button>
                    </div>
                </div>
            )}
            <div className="sub-navbar">
                <button onClick={handleLogout}>Log Out</button>
            </div>
        </div>
    );
};

export default Profile;
