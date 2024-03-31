import React from 'react'
import { Nav } from '../Components/Nav';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import SignLog from '../Components/SignLog';

function Login() {

    const [user, setUser] = useState(null)
    const auth = getAuth();
    const navigate = useNavigate();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser(user)
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            navigate("/dashboard")
            // ...
        } else {
            // User is signed out
            // ...
        }
    });
    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="flex items-center justify-center flex-grow">
                <SignLog />
            </div>
        </div>
    );
}

export default Login
