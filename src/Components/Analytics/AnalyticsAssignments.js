import React from 'react'
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../Nav';


function AnalyticsAssignments() {
    let { id } = useParams();
    const [user, setUser] = useState(null);
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const uid = user.uid;
            } else {
                navigate("/signup");
            }
        });

        return unsubscribe;
    }, [auth, navigate]);

    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="h-full">
                {id}
            </div>
        </div>
    )
}

export default AnalyticsAssignments
