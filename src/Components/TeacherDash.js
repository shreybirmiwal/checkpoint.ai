import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TeacherDash() {
    const [user, setUser] = useState(null);



    return (
        <div className="container mx-auto mt-8">



            <ToastContainer />

        </div>
    )
}

export default TeacherDash
