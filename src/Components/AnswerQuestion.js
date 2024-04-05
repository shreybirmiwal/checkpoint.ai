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
import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import Modal from 'react-modal';

import OpenAI from 'openai';


function AnswerQuestion() {

    const client = new OpenAI({
        apiKey: process.env['REACT_APP_OPENAI_API_KEY'],
        dangerouslyAllowBrowser: true
        , // This is the default and can be omitted
    });


    let { id } = useParams();
    const navigate = useNavigate();
    let { state } = useLocation();


    const [steps, setSteps] = useState(['']);
    const [finalAnswer, setFinalAnswer] = useState('');

    const [ready, setReady] = useState(false)

    const [mistakes, setMistakes] = useState([]);

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

        const steps = ['Step 1: Write the equation.', 'Step 2: Calculate the pOH.', 'Step 3: Use the pOH to find pH.'];
        const finalAnswer = 'Final Answer';

        const formattedCorrectSteps = correctSteps.map((step, index) => `${index + 1}) ${step.step}\n   Hint: ${step.hint ? step.hint : 'None'}`).join('\n');
        const formattedStudentSteps = steps.map((step, index) => `${index + 1}) ${step}`).join('\n');

        const jsonOutput = JSON.stringify({
            Accuracy: "% Accuracy of student",
            mistakes: ["STUDENTMISTAKE1", "STUDENTMISTAKE2"]
        });

        const promptText = `Given the question, correct steps, and correct answer, a student's potentially incorrect steps and final answer, determine the student's mistakes. Be specific in the mistake. (There may be multiple mistakes or zero mistakes)

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
            })
            .then(async (data) => {
                const response = JSON.parse(data.choices[0].message.content);
                // Accessing the data
                console.log("Accuracy:", response.Accuracy);
                console.log("Mistakes:", response.mistakes);


                await updateDoc(doc(db, "Stats", id), {
                    CommonMistakes: response.mistakes,
                    StudentRes: finalAnswer,
                    allMistakes: response.mistakes,
                })
                setReady(true)


                setMistakes(response.mistakes)

                toggleModal()



                //update the firebase

            });
    }




    const handleSubmit = async (e) => {
        e.preventDefault();
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

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">
                            Submit
                        </button>
                    </form>
                </div>
                <ToastContainer />

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={toggleModal}
                    style={modalStyle}
                    contentLabel="Example Modal"
                >
                    {mistakes.map((Mistake, index) => (
                        <div key={index}>

                            <p>{Mistake}</p>

                        </div>
                    ))}

                    {ready ?
                        <div className='bg-blue-300 p-4' onClick={() => navigate('/dashboard')}>
                            Continue
                        </div>
                        :
                        <div>Loading...</div>
                    }


                </Modal>


            </div>
        </div>
    );
}

export default AnswerQuestion;
