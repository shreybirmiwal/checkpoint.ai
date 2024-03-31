import React from 'react'
import { Nav } from '../Components/Nav';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function Dashboard() {

    const [user, setUser] = useState(null)
    const [teacher, setTeacher] = useState(false)
    const auth = getAuth();
    const navigate = useNavigate();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUser(user)
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;

            //check if user is teacher
            const docRef = doc(db, "Users", "isTeacher");
            await getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        console.log("Document data:", docSnap.data());
                        setTeacher(docSnap.data()[uid])
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                })
                .catch((error) => {
                    console.error("Error getting document:", error);
                });



            // ...
        } else {
            // User is signed out
            // ...
            navigate("/signup")
        }
    });

    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="flex items-center justify-center flex-grow">
                {teacher ? (
                    <div>
                        teacher
                    </div>

                ) : (
                    <div>
                        student
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard
