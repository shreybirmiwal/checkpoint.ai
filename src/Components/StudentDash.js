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

    const [clickedQuestionSteps, setClickedQuestionSteps] = useState([]);
    const [clickedQuestionAnswer, setClickedQuestionAnswer] = useState('');
    const [clickedQuestion, setClickedQuestion] = useState('');

    const auth = getAuth();
    const navigate = useNavigate();

    const handleClassCodeChange = (e) => {
        setClassCode(e.target.value);
    };

    const [modalIsOpen, setIsOpen] = React.useState(false);

    const toggleModal = () => {
        setIsOpen(!modalIsOpen)
    };

    const handleViewSolution = async (id) => {
        //get the question data

        const assingedRef = doc(db, "Teacher", id);
        const assignedSnap = await getDoc(assingedRef);

        var data = assignedSnap.data();

        setClickedQuestion(data.Question);
        setClickedQuestionAnswer(data.Answer)
        setClickedQuestionSteps(data.Steps)

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
            .then(async () => {
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


                var curData_assigned;

                //get all the current old questions
                const curAssis = await getDoc(doc(db, "activeAssignments", classCode));
                console.log(curAssis.data());

                //get the students current data
                const studentRef = doc(db, "Students", user.uid);
                const studentSnap = await getDoc(studentRef);
                curData_assigned = studentSnap.data().Assigned;

                //update the students data with the new questions
                curData_assigned = { ...curData_assigned, ...curAssis.data() };

                updateDoc(studentRef, {
                    Assigned: curData_assigned
                }, { merge: true });

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
                                className="px-4 py-2 bg-green-500 mt-2 text-white rounded hover:bg-green-600 focus:outline-none"
                                onClick={() => handleTryAgain(completedID[index])}
                            >
                                Try Again
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-300 ml-2 mt-2 text-white rounded hover:bg-purple-600 focus:outline-none"
                                onClick={() => handleViewSolution(completedID[index])}
                            >
                                View Solution
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={toggleModal}
                style={modalStyle}
                contentLabel="Example Modal"
            >
                <div className='hover:text-purple-700 flex flex-row mb-2' onClick={toggleModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Close
                </div>

                <div className="bg-blue-500 rounded-lg shadow-md p-4 mb-4">
                    <p className="text-black">Solution: {clickedQuestion}</p>
                </div>
                <div className="bg-green-500 rounded-lg shadow-md p-4 mb-4">
                    <p className="text-black">Steps:</p>
                    {clickedQuestionSteps.map((step, index) => (
                        <div key={index} className="flex">
                            <p className="mr-2">{step.step}</p>
                            {/* <p>{step.hint}</p> */}
                        </div>
                    ))}
                </div>
                <div className="bg-purple-500 rounded-lg shadow-md p-4 mb-4">
                    <p className="text-black">Final Answer: {clickedQuestionAnswer}</p>
                </div>

            </Modal>

            <ToastContainer />

        </div>
    );
};

export default StudentDash;
