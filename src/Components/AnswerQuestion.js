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

function AnswerQuestion({ questionID, closeModal }) {
    const [question, setQuestion] = useState('');
    const [steps, setSteps] = useState([{ step: '', hint: '' }]);
    const [finalAnswer, setFinalAnswer] = useState('');


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
        console.log("SUBMIT ")
    };


    return (
        <div>

            <div className="max-w  p-6 bg-gray-200 shadow-md rounded-md">
                <h1 className="text-2xl font-bold mb-4">{question}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">

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

export default AnswerQuestion;
