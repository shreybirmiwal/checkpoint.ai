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

import OpenAI from 'openai';


function AnswerQuestion() {

    const openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    });


    let { id } = useParams();
    const navigate = useNavigate();
    let { state } = useLocation();

    const [correctQuestion, setCorrectQuestion] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [correctSteps, setCorrectSteps] = useState(['']);

    const getCorrectData = async () => {
        const assingedRef = doc(db, "Teacher", id);
        const assignedSnap = await getDoc(assingedRef);
        if (assignedSnap.exists()) {
            console.log("Document data:", assignedSnap.data());
            setCorrectAnswer(assignedSnap.data().Answer);
            setCorrectQuestion(assignedSnap.data().Question);
            setCorrectSteps(assignedSnap.data().Steps);
        }
    }


    useEffect(() => {
        getCorrectData();
    }, []);


    const [steps, setSteps] = useState(['']);
    const [finalAnswer, setFinalAnswer] = useState('');

    const handleAddStep = () => {
        setSteps([...steps, '']);
    };

    const handleDeleteStep = (index) => {
        if (steps.length > 1) {
            setSteps(prevSteps => prevSteps.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("SUBMIT ")
        console.log(steps)
        console.log(finalAnswer)


        if (finalAnswer !== '' && steps.every(step => step !== '')) {

            //show analysis modal
            //upload data to stats



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
                    <h1 className="text-2xl font-bold mb-4">{state.key.title}</h1>

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
            </div>
        </div>
    );
}

export default AnswerQuestion;
