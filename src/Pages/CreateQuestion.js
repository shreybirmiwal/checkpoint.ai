import React, { useState } from 'react';

import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { db } from '../firebase';
import { addDoc, deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { increment } from "firebase/firestore";
import { collection } from "firebase/firestore";

function CreateQuestion() {
    const [popupOpen, setPopupOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [steps, setSteps] = useState([{ step: '', hint: '' }]);
    const [finalAnswer, setFinalAnswer] = useState('');
    const [id, setId] = useState(0);

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleStepChange = (index, e) => {
        const { name, value } = e.target;
        const updatedSteps = [...steps];
        updatedSteps[index][name] = value;
        setSteps(updatedSteps);
    };

    const handleAddStep = () => {
        setSteps([...steps, { step: '', hint: '' }]);
    };

    const handleDeleteStep = (index) => {
        if (steps.length === 1) {
            return; // Prevent deletion if only one step remains
        }
        const updatedSteps = [...steps];
        updatedSteps.splice(index, 1);
        setSteps(updatedSteps);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!(question != '' && steps.length > 0 && finalAnswer != '' && steps[0].step != '' && steps[0].hint != '')) {
            toast.error('Please fill all fields!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } else {
            console.log('Question:', question);
            console.log('Steps:', steps);
            console.log('Final Answer:', finalAnswer);



            //ADD to the database of questions with teacher correct answers
            const docRef = await addDoc(collection(db, "Teacher"), {
                Answer: finalAnswer,
                Question: question,
                Steps: steps,
            });
            setId(docRef.id)
            console.log("Document written with ID: ", docRef.id);

            //add to list of owerners ei : who created what questiom
            const ownerDocRef = doc(db, "Owners", "data");
            await updateDoc(ownerDocRef, {
                [docRef.id]: "TEACHER UID WOULD GO HERE"
            });

            setFinalAnswer('');
            setQuestion('');
            setSteps([{ step: '', hint: '' }]);
            setPopupOpen(true);
        }

    };

    const handleClosePopup = () => {
        setPopupOpen(false);
    };

    return (
        <div className="flex justify-center items-center h-screen">


            <Dialog open={popupOpen} onClose={handleClosePopup}>
                <DialogHeader>Your question has been created!</DialogHeader>
                <DialogBody>
                    Share this link: http://localhost:3000/{id}
                </DialogBody>
                <DialogFooter>
                    <Button variant="gradient" color="green" onClick={handleClosePopup}>
                        <span>Confirm</span>
                    </Button>
                </DialogFooter>
            </Dialog>

            <div className="max-w mx-72 p-6 bg-white shadow-md rounded-md">
                <h1 className="text-2xl font-bold mb-4">Create Question</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="overflow-y-auto h-40">
                        <label className="block mb-2" htmlFor="question">Question:</label>
                        <textarea className="w-full px-3 py-4 border rounded-md focus:outline-none focus:border-blue-500" id="question" value={question} onChange={handleQuestionChange} />
                    </div>

                    <h2 className="text-lg font-semibold mb-2">Steps:</h2>

                    <div className=' overflow-y-scroll h-60'>
                        {steps.map((step, index) => (
                            <div key={index} className="mb-4">
                                <h3 className="text-md font-medium mb-2">Step {index + 1}</h3>
                                <div className="grid grid-cols-6 space-x-2">
                                    <div className='col-span-2'>
                                        <label className="block mb-1" htmlFor={`step-${index}`}>Step:</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            id={`step-${index}`}
                                            name="step"
                                            value={step.step}
                                            onChange={(e) => handleStepChange(index, e)}
                                        />
                                    </div>

                                    <div className='col-span-2'>
                                        <label className="block mb-1" htmlFor={`hint-${index}`}>Hint:</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            id={`hint-${index}`}
                                            name="hint"
                                            value={step.hint}
                                            onChange={(e) => handleStepChange(index, e)}
                                        />
                                    </div>

                                    <button type="button" className="text-blue-500 " onClick={handleAddStep}>
                                        Add Step
                                    </button>

                                    <button type="button" className="text-red-600" onClick={() => handleDeleteStep(index)}>
                                        Delete Step
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

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
    );
}

export default CreateQuestion;
