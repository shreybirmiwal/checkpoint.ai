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

function AnswerQuestion({ questionID, closeModal, question }) {
    const [steps, setSteps] = useState([]);
    const [finalAnswer, setFinalAnswer] = useState('');



    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("SUBMIT ")
        console.log(steps)
        console.log(finalAnswer)
    };


    return (
        <div>

            <div className="max-w  p-6 bg-gray-200 shadow-md rounded-md">
                <h1 className="text-2xl font-bold mb-4">{question}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <h2 className="text-lg font-semibold mb-2">Steps:</h2>

                    <div className=' overflow-y-scroll h-60'>

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
