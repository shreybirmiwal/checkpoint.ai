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
import { useEffect } from 'react';

function CreateQuestion({ teacherUID, closeModal, imagePickedSteps, imagePickedQuestion, imagePickedHints, imagePickedAnswer }) {

    useEffect(() => {

        // console.log("THE HITNTS ARE ", imagePickedHints)
        //console.log(" THE STEPS ARE ", imagePickedSteps)

        if (imagePickedAnswer != '') {
            setFinalAnswer(imagePickedAnswer);
        }
        if (imagePickedQuestion != '') {
            setQuestion(imagePickedQuestion);
        }
        if (imagePickedHints.length != 0) {
            var temp = [];
            for (var i = 0; i < imagePickedHints.length; i++) {
                temp.push({ step: imagePickedSteps[i], hint: imagePickedHints[i] });
            }
            // console.log("TEMPP", temp)
            setSteps(temp);
        }

    }, [imagePickedAnswer, imagePickedHints, imagePickedQuestion, imagePickedSteps]); // Add dependencies as needed

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
                Teacher: teacherUID
            });
            setId(docRef.id)

            const questionID = docRef.id
            console.log("Document written with ID: ", questionID);

            toast.success(("Created question.. (1/2)"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            //loop through class, get all students in class, than update each students assigned work

            const classRef = doc(db, "Class", teacherUID);
            const classSNAP = await getDoc(classRef);
            const students = classSNAP.data().Students;

            if (classSNAP.exists()) {
                console.log("teacher students:", classSNAP.data().Students);


                for (const student in students) {
                    console.log("MY STUDENT S " + student)

                    var curData_assigned;
                    const studentRef = doc(db, "Students", student);
                    const studentSnap = await getDoc(studentRef);
                    curData_assigned = studentSnap.data().Assigned;
                    console.log(curData_assigned);
                    curData_assigned[questionID] = question;

                    updateDoc(studentRef, {
                        Assigned: curData_assigned
                    }, { merge: true });

                }

                toast.success(("Assigned to students.. (2/2)!"), {
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
                console.log("No such document!");
                toast.error('Error!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }


            //add question to stats
            await setDoc(doc(db, "Stats", questionID), {
                CommonMistakes: [],
                Proficiency: 0,
                StudentRes: {},
                allMistakes: [],
                Attempts: 0,
                Hints: 0,
            });



            //add question to teachers active questions
            await setDoc(doc(db, "activeAssignments", teacherUID), {
                [questionID]: question
            }, { merge: true })


            setFinalAnswer('');
            setQuestion('');
            setSteps([{ step: '', hint: '' }]);

            closeModal();

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }

    };


    return (
        <div>

            <div className="max-w  p-6 bg-gray-200 shadow-md rounded-md">
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
