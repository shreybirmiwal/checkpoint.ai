import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnswerQuestion from './AnswerQuestion';
import Modal from 'react-modal';

const StudentDash = () => {
    const [user, setUser] = useState(null);
    const [classCode, setClassCode] = useState('');

    const [assignmentsID, setAssignmentsID] = useState([]);
    const [assignmentsTitle, setAssignmentsTitle] = useState([]);

    const [completedID, setCompletedID] = useState([]);
    const [completedTitle, setCompletedTitle] = useState([]);

    const [tab, setTab] = useState(0) // 0 for assigned, 1 for completed



    const [clickedQuestion, setClickedQuestion] = useState('');
    const [clickedQuestionID, setClickedQuestionID] = useState('');

    const auth = getAuth();
    const navigate = useNavigate();

    const handleClassCodeChange = (e) => {
        setClassCode(e.target.value);
    };

    const [modalIsOpen, setIsOpen] = React.useState(false);

    const toggleModal = () => {
        setIsOpen(!modalIsOpen)
    };

    const handleClickAssignment = (e) => {
        //console.log(e.target.innerText);
        setClickedQuestion(e.target.innerText);
        setClickedQuestionID(assignmentsID[assignmentsTitle.indexOf(e.target.innerText)]);
        toggleModal();
    }

    const handleTryAgain = async (id) => {
        try {
            // Construct the reference to the document in the collection
            const studentDocumentRef = doc(db, "Students", user.uid);

            // Get the current document data
            const studentDoc = await getDoc(studentDocumentRef);
            var studentData = studentDoc.data();


            console.log("THE STUDENTS DATA >>. " + JSON.stringify(studentData))

            if (studentData.Completed[id]) {
                studentData.Assigned[id] = studentData.Completed[id];
                delete studentData.Completed[id]; // Remove from 'completed'
            }

            console.log("THE STUDENTS DATA >>. " + JSON.stringify(studentData))

            // Update the document
            await setDoc(studentDocumentRef, studentData);

            setTimeout(() => { window.location.reload(); }, 2000);

        } catch (error) {
            console.error("Error moving assignment to completed:", error);
        }
    }

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

        setDoc(classRef, { Students: { [user.uid]: user.displayName } }, { merge: true })
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

    const modalStyle = {
        content: {
            top: '10%',
            left: '25%',

            width: '50%',
            height: '80%',
            background: '#CE93D8',
        },
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
                <div className='overflow-y-scroll h-96'>
                    {tab === 0 && assignmentsTitle.map((title, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3 hover:bg-gray-200" onClick={() => navigate("/answer/" + assignmentsID[index], { state: { key: { title } } })}>

                            <p>{title.length > 40 ? title.slice(0, 40) + '...' : title}</p>
                        </div>

                    ))}
                    {tab === 1 && completedTitle.map((title, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3">
                            <p>{title.length > 40 ? title.slice(0, 40) + '...' : title} !!</p>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
                                onClick={() => handleTryAgain(completedID[index])}
                            >
                                Try Again
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <ToastContainer />

        </div>
    );
};

export default StudentDash;
