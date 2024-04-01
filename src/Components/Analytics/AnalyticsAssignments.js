import React from 'react'
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../Nav';
import { Accordian } from './Accordian';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AccordianOuter } from './AccordianOuter';

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
            <div className="h-full container mx-auto mt-8">

                <h2 className="text-3xl font-semibold mb-4">Assignment Analytics</h2>
                ID: {id}

                <div className='bg-gray-200 rounded-xl p-3 mt-5'>
                    <AccordianOuter />
                </div>

            </div>
            <ToastContainer />

        </div>
    );

}

export default AnalyticsAssignments
