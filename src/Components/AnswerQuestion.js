import React, {
    useState, useEffect
} from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Nav } from './Nav';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { db } from '../firebase';
import { doc, updateDoc, getDoc, getDocs, collection, FieldValue, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import Modal from 'react-modal';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import OpenAI from 'openai';
import swal from 'sweetalert';

import { deleteField } from 'firebase/firestore';

function AnswerQuestion() {

    const client = new OpenAI({
        apiKey: process.env['REACT_APP_OPENAI_API_KEY'],
        dangerouslyAllowBrowser: true
        , // This is the default and can be omitted
    });
    const auth = getAuth();
    const [user, setUser] = useState(null)

    let { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { title } = location.state.key;

    const [steps, setSteps] = useState(['']);
    const [finalAnswer, setFinalAnswer] = useState('');
    const [ready, setReady] = useState(false)
    const [mistakes, setMistakes] = useState([]);

    useEffect(() => {
        console.log("TITLE " + title)
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


    // const getLoadingData = async () => {
    //     try {
    //         //get the question
    //         console.log("START DATEA + ID :" + id);

    //         if (id === undefined) return;

    //         const dataDoc = await getDoc(doc(db, "Teacher", id));

    //         if (dataDoc.exists()) {
    //             console.log(dataDoc.data().Question)
    //             setQuestion(dataDoc.data().Question);
    //         } else {
    //             // Handle case when the document does not exist
    //             console.log("Document does not exist");
    //         }
    //     } catch (error) {
    //         // Handle any errors that occurred during the execution of the function
    //         console.error("Error in getLoadingData:", error);
    //     }
    // }

    const handleAddStep = () => {
        setSteps([...steps, '']);
    };

    const handleDeleteStep = (index) => {
        if (steps.length > 1) {
            setSteps(prevSteps => prevSteps.filter((_, i) => i !== index));
        }
    };


    const [modalIsOpen, setIsOpen] = React.useState(false);
    const toggleModal = () => {
        setIsOpen(!modalIsOpen)
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

    const moveAssignmentToCompleted = async (id) => {
        try {
            // Construct the reference to the document in the collection
            const studentDocumentRef = doc(db, "Students", user.uid);

            // Get the current document data
            const studentDoc = await getDoc(studentDocumentRef);
            var studentData = studentDoc.data();


            console.log("THE STUDENTS DATA >>. " + JSON.stringify(studentData))

            //move the data from assigend to competled
            if (studentData.Assigned[id]) {
                // Move the object to the 'Completed' section
                studentData.Completed[id] = studentData.Assigned[id];
                delete studentData.Assigned[id]; // Remove from 'Assigned'
            }

            console.log("THE STUDENTS DATA >>. " + JSON.stringify(studentData))

            // Update the document
            await setDoc(studentDocumentRef, studentData);

        } catch (error) {
            console.error("Error moving assignment to completed:", error);
        }
    };

    const gptPart = async (prompt) => {
        const assingedRef = doc(db, "Teacher", id);
        const assignedSnap = await getDoc(assingedRef);
        var correctAnswer = '';
        var correctQuestion = '';
        var correctSteps = '';

        if (assignedSnap.exists()) {
            console.log("Document data:", assignedSnap.data());
            correctAnswer = (assignedSnap.data().Answer);
            correctQuestion = (assignedSnap.data().Question);
            correctSteps = (assignedSnap.data().Steps);

            console.log("OMG CORECT STPES BELOW")
            console.log(correctSteps)
        }

        const formattedCorrectSteps = correctSteps.map((step, index) => `${index + 1}) ${step.step}\n   Hint: ${step.hint ? step.hint : 'None'}`).join('\n');
        const formattedStudentSteps = steps.map((step, index) => `${index + 1}) ${step}`).join('\n');
        console.log("THIS IS THE STUDENT STEPS " + formattedStudentSteps)

        const jsonOutput = JSON.stringify({
            Accuracy: "% Accuracy of student",
            mistakes: ["STUDENTMISTAKE1", "STUDENTMISTAKE2"]
        });

        const promptText = `Given the question, correct steps, and correct answer, a student's potentially incorrect steps and final answer, determine the student's mistakes. Be very specific in the mistake and include the numbers/calculations that where incorrect. (There may be multiple mistakes or zero mistakes)

Return in JSON format:
${jsonOutput}

Question: ${correctQuestion}
Correct steps:
${formattedCorrectSteps}

Correct answer:${correctAnswer}

Student steps:
${formattedStudentSteps}
Student answer: ${finalAnswer}`;

        console.log(promptText);

        client.chat.completions
            .create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: promptText,
                    }
                ],
                temperature: 0,
                response_format: { "type": "json_object" },
            })
            .then(async (data) => {

                try {
                    const response = JSON.parse(data.choices[0].message.content);
                    // Accessing the data
                    console.log("Accuracy:", response.Accuracy);
                    console.log("Mistakes:", response.mistakes);


                    await Promise.all([
                        updateDoc(doc(db, "Stats", id), {
                            allMistakes: arrayUnion(...response.mistakes),
                        }),
                        updateStudentRes(id, user.uid, response.mistakes),


                        //remove pendign assignemnt, add it to completed assignments
                        moveAssignmentToCompleted(id)

                    ]).then(() => {
                        setReady(true);
                    }).catch(error => {
                        console.error("Error updating document:", error);
                    });


                    setMistakes(response.mistakes)

                    toggleModal()

                } catch (error) {
                    toast.error("Error processing data, please try again!", {});
                }

                //update the firebase

            });
    }




    async function updateStudentRes(id, uid, newMistakes) {
        const docRef = doc(db, "Stats", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const existingStudentRes = docSnap.data().StudentRes || {};
            const updatedStudentRes = {
                ...existingStudentRes,
                [uid]: arrayUnion(...newMistakes)
            };

            await updateDoc(docRef, { StudentRes: updatedStudentRes });
        } else {
            console.error("Document not found");
        }
    }



    const handleSubmit = async () => {
        console.log("SUBMIT ")
        console.log(steps)
        console.log(finalAnswer)


        if (finalAnswer !== '' && steps.every(step => step !== '')) {

            //show analysis modal
            //upload data to stats
            gptPart("prompt");


        }
        else {
            toast.error("Please fill all fields!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }
    };

    const manageHint = async () => {
        console.log("Student is asking for a hint")

        const assingedRef = doc(db, "Teacher", id);
        const assignedSnap = await getDoc(assingedRef);
        var correctAnswer = '';
        var correctQuestion = '';
        var correctSteps = '';

        if (assignedSnap.exists()) {
            console.log("Document data:", assignedSnap.data());
            correctAnswer = (assignedSnap.data().Answer);
            correctQuestion = (assignedSnap.data().Question);
            correctSteps = (assignedSnap.data().Steps);

            console.log("OMG CORECT STPES BELOW")
            console.log(correctSteps)
        }

        const formattedCorrectSteps = correctSteps.map((step, index) => `${index + 1}) ${step.step}\n   Hint: ${step.hint ? step.hint : 'None'}`).join('\n');
        const formattedStudentSteps = steps.map((step, index) => `${index + 1}) ${step}`).join('\n');
        console.log("THIS IS THE STUDENT STEPS " + formattedStudentSteps)

        const jsonOutput = JSON.stringify({
            Hint: "Hint for the student",
        });

        const promptText = `Given the question, correct steps, and correct answer, a student's work, give a helpful hint that a student who is stuck can use.

Return in JSON format:
${jsonOutput}

Question: ${correctQuestion}
Correct steps:
${formattedCorrectSteps}

Correct answer:${correctAnswer}

Student steps:
${formattedStudentSteps}
Student answer: ${finalAnswer}`;

        console.log(promptText);

        client.chat.completions
            .create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: promptText,
                    }
                ],
                temperature: 0,
                response_format: { "type": "json_object" },
            })
            .then(async (data) => {

                try {
                    const response = JSON.parse(data.choices[0].message.content);
                    console.log("Hints:", response.Hint);
                    swal("Hint:", response.Hint);

                } catch (error) {
                    toast.error("Error processing data, please try again!", {});
                }


            });
    }

    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="h-full container mx-auto mt-8">
                <div className="max-w  p-6 bg-gray-200 shadow-md rounded-md">
                    <div className='hover:text-purple-700 flex flex-row mb-2' onClick={() => navigate("/dashboard")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Close
                    </div>

                    <div className="space-y-4">
                        {title && <h1 className="text-lg font-semibold mb-2">{title}</h1>}

                        <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" onClick={() => manageHint()}>
                            <h1> I'm stuck! (hint) </h1>
                        </div>

                        <h2 className="text-lg font-semibold mb-2">Steps:</h2>

                        {steps.map((step, index) => (
                            <div key={index} className="mb-4 flex items-center">
                                <label className="mr-2">Step {index + 1}:</label>
                                <input
                                    type="text"
                                    className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                    value={step}
                                    onChange={(e) => {
                                        const updatedSteps = [...steps];
                                        updatedSteps[index] = e.target.value;
                                        setSteps(updatedSteps);
                                    }}
                                />

                                {steps.length > 1 && (
                                    <button type="button" className="ml-2 text-red-600" onClick={() => handleDeleteStep(index)}>
                                        Delete Step
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" className="text-blue-500" onClick={handleAddStep}>
                            Add Step
                        </button>

                        <div className="grid-cols-2">
                            <label className="block mb-2" htmlFor="finalAnswer">Final Answer:</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                id="finalAnswer"
                                value={finalAnswer}
                                onChange={(e) => setFinalAnswer(e.target.value)}
                            />
                        </div>

                        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">
                            Submit
                        </button>
                    </div>
                </div>
                <ToastContainer />

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={toggleModal}
                    style={modalStyle}
                    contentLabel="Example Modal"
                >
                    <div className="text-center"> {/* Center align content */}
                        {mistakes.map((mistake, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
                                <p className="text-black">{mistake}</p> {/* Set text color to black */}
                            </div>
                        ))}
                        <div className="mt-auto text-center"> {/* Position button at the bottom */}
                            {ready ? (
                                <div
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer transition duration-300"

                                    //className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer transition duration-300 inline-block"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Continue
                                </div>
                            ) : (
                                <div className="bg-gray-200 text-gray-600 py-2 px-4 rounded cursor-not-allowed inline-block">
                                    Loading...
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>


            </div>
        </div>
    );
}

export default AnswerQuestion;
