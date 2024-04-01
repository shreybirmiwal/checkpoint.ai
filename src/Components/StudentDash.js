import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentDash = () => {
    const [user, setUser] = useState(null);
    const [classCode, setClassCode] = useState('');

    const [assignmentsID, setAssignmentsID] = useState([]);
    const [assignmentsTitle, setAssignmentsTitle] = useState([]);

    const [completedID, setCompletedID] = useState([]);
    const [completedTitle, setCompletedTitle] = useState([]);

    const [tab, setTab] = useState(0) // 0 for assigned, 1 for completed

    const auth = getAuth();
    const navigate = useNavigate();

    const handleClassCodeChange = (e) => {
        setClassCode(e.target.value);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const uid = user.uid;

                //get assiognemnts
                var assingedID = []
                var completedID = []

                const assingedRef = doc(db, "Students", uid);
                const assignedSnap = await getDoc(assingedRef);
                if (assignedSnap.exists()) {
                    console.log("Document data:", assignedSnap.data());
                    assingedID = (assignedSnap.data().Assigned);
                    completedID = (assignedSnap.data().Completed);

                    console.log("ASSINGED ID ", Object.keys(assingedID));
                    console.log("COMPLETED ID " + completedID)


                    setAssignmentsID(Object.keys(assingedID));
                    setAssignmentsTitle(Object.values(assingedID));
                    setCompletedID(Object.keys(completedID));
                    setCompletedTitle(Object.values(completedID));


                } else {
                    console.log("No such document!");
                }

            } else {
                navigate("/signup");
            }
        });

        return unsubscribe;
    }, [auth, navigate]);

    const joinClass = () => {
        console.log('Joining class with code:', classCode);

        const classRef = doc(db, "Class", classCode);

        updateDoc(classRef, { Students: { [user.uid]: user.displayName } })
            .then(() => {
                toast.success("Joined class successfully!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            })
            .catch((error) => {
                console.error("Error joining class:", error);
                toast.error("Failed to join class. Please try again.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            });

        setClassCode('');
    };

    const handleTabClick = (tabIndex) => {
        setTab(tabIndex);
    };

    return (
        <div className="container mx-auto mt-8">
            <div className="flex justify-between mb-8">
                <div></div>
                <div className="flex items-center">
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="Enter class code"
                            className="border border-gray-300 rounded px-4 py-2 mr-2 focus:outline-none"
                            value={classCode}
                            onChange={handleClassCodeChange}
                        />
                        <button
                            onClick={joinClass}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                        >
                            Join with Code
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-semibold mb-4">My Assignments</h2>
                <div className='flex flex-row mb-3 px-1'>
                    <h3
                        className={`mr-5 ${tab === 0 ? 'text-blue-500 font-bold' : ''}`}
                        onClick={() => handleTabClick(0)}
                    >
                        Assigned
                    </h3>
                    <h3
                        className={`${tab === 1 ? 'text-blue-500 font-bold' : ''}`}
                        onClick={() => handleTabClick(1)}
                    >
                        Completed
                    </h3>
                </div>
                <div>
                    {tab === 0 && assignmentsTitle.map((title, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3">
                            <p>{title.length > 40 ? title.slice(0, 40) + '...' : title}</p>
                        </div>
                    ))}
                    {tab === 1 && completedTitle.map((title, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3">
                            <p>{title.length > 40 ? title.slice(0, 40) + '...' : title}</p>
                        </div>
                    ))}
                </div>
            </div>
            <ToastContainer />

        </div>
    );
};

export default StudentDash;
