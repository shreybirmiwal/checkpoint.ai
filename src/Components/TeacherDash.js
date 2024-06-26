import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, setDoc } from 'firebase/firestore';
import { redirect, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import CreateQuestion from './CreateQuestion';
import { FileUploader } from "react-drag-drop-files";
import OpenAI from 'openai';
import Loader from 'react-loader';


const fileTypes = ["JPG", "PNG"];


function TeacherDash() {


    const client = new OpenAI({
        apiKey: process.env['REACT_APP_OPENAI_API_KEY'],
        dangerouslyAllowBrowser: true
        , // This is the default and can be omitted
    });


    const [user, setUser] = useState(null);
    const auth = getAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState(0) // 0 for students, 1 for assignments
    const [students, setStudents] = useState([]);
    const [studentID, setStudentID] = useState([]);

    const [assignmentTitle, setAssignmentsTitle] = useState([]);
    const [assingmentID, setAssignmentsID] = useState([]);


    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [ImagemodalIsOpen, ImagesetIsOpen] = React.useState(false);


    const [isLoading, setLoading] = useState(false)



    //data to pass onto the other screen where users can edit the question if the vision got it incorrect
    const [imagePickedQuestion, setImagePickedQuestion] = useState('');
    const [imagePickedSteps, setImagePickedSteps] = useState([]);
    const [imagePickedHints, setImagePickedHints] = useState([]);
    const [imagePickedAnswer, setImagePickedAnswer] = useState('');

    const toggleModal = () => {
        setIsOpen(!modalIsOpen)
    };
    const ImagetoggleModal = () => {
        setFiles();
        ImagesetIsOpen(!ImagemodalIsOpen)
    };



    const [files, setFiles] = useState();
    const uploadImage = (file) => {
        setFiles(file);
        console.log(files)
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const uid = user.uid;


                //get assiognemnts

                const studentsRef = doc(db, "Class", uid);
                const studentsDoc = await getDoc(studentsRef);
                if (studentsDoc.exists()) {
                    console.log("Document data:", studentsDoc.data());
                    setStudents(Object.values(studentsDoc.data().Students));
                    setStudentID(Object.keys(studentsDoc.data().Students));
                }


                const titles = [];
                const assignmentIds = [];
                const teacherRef = collection(db, "Teacher");
                const querySnapshot = await getDocs(teacherRef);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.Teacher === user.uid) {
                        //const truncatedTitle = data.Question.length > 40 ? data.Question.slice(0, 40) + '...' : data.Question;
                        titles.push(data.Question);
                        assignmentIds.push(doc.id);
                    }
                });
                // console.log("ASSINGED ID ", assignmentIds);
                // console.log("ASSINGED TITLE ", titles)

                setAssignmentsID(assignmentIds);
                setAssignmentsTitle(titles);


            } else {
                navigate("/signup");
            }
        });

        return unsubscribe;
    }, [auth, navigate]);

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    const submitImages = async () => {

        setLoading(true)

        //use vision gpt
        const jsonOutput = JSON.stringify({
            Question: "Question",
            Steps: ["Step 1", "Step 2", "Step 3"],
            Hints: ["Hint 1 for Step1", "Hint 2 for Step2", "Hint 3 for Step 3"],
            CorrectAnswer: "Correct Final Answer",
        });

        const promptText = `Given image of a question and the solving steps and answer, extract the question, steps and correct answer. Include specific calculations, numbers, and variables solved for at each step. Create hints for each step.
        Return in JSON format:
        ${jsonOutput}
        `;

        const base64Image = await getBase64(files);
        console.log("BASE 64  + ", base64Image)

        const response = await client.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    "role": "user",
                    "content": [
                        { "type": "text", "text": promptText },
                        { type: "image_url", image_url: { url: base64Image } } // Remove "data:image/png;base64," prefix
                    ],
                }
            ],
            temperature: 0,
            response_format: { "type": "json_object" },
            //max_tokens = 300,
        });

        setLoading(false);

        //set dets
        const res2 = JSON.parse(response.choices[0].message.content);
        console.log(res2)

        console.log("Question:", res2.Question);
        console.log("Steps:", res2.Steps);
        console.log("Answer:", res2.CorrectAnswer);
        console.log("Hints:", res2.Hints);


        setImagePickedAnswer(res2.CorrectAnswer);
        setImagePickedQuestion(res2.Question);
        setImagePickedSteps(res2.Steps);
        setImagePickedHints(res2.Hints);


        ImagetoggleModal();
        toggleModal();
    }


    const handleTabClick = (tabIndex) => {
        setTab(tabIndex);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(user.uid);
            toast.success(("Copied to clipboard!"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            alert('Error copying to clipboard:', error);
        }
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


    return (
        <div className="container mx-auto mt-8">
            {/* <div className="flex justify-between mb-8">
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
            </div> */}
            <div>
                <h2 className="text-3xl font-semibold mb-4">My Dashboard</h2>
                <div className='flex flex-row mb-3 px-1'>
                    <h3
                        className={`mr-5 ${tab === 0 ? 'text-deep-purple-500 font-bold underline' : ''}`}
                        onClick={() => handleTabClick(0)}
                    >
                        My Students
                    </h3>
                    <h3
                        className={`mr-5 ${tab === 1 ? 'text-deep-purple-500 font-bold underline' : ''}`}
                        onClick={() => handleTabClick(1)}
                    >
                        My Assignments
                    </h3>
                </div>

                <div>
                    {tab == 0 ? (
                        <div className="bg-blue-300 rounded-lg shadow-md p-10 mb-3 hover:bg-blue-400" onClick={copyToClipboard}>
                            {user && <p>Share this code to students to add them to your class: {user.uid}</p>}
                        </div>
                    ) : (
                        <div>

                            <div className='flex flex-row'>
                                <div className="bg-purple-600 text-white rounded-lg shadow-md p-10 mb-3 hover:bg-purple-800 w-1/2 text-center" onClick={ImagetoggleModal}>
                                    <p>Generate question from image</p>
                                </div>
                                <div className="bg-blue-300 rounded-lg shadow-md p-10 mb-3 hover:bg-blue-400 w-1/2 text-center" onClick={toggleModal}>
                                    <p>Create an assignment from text</p>
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

                                <CreateQuestion teacherUID={user.uid} closeModal={toggleModal} imagePickedAnswer={imagePickedAnswer} imagePickedHints={imagePickedHints} imagePickedQuestion={imagePickedQuestion} imagePickedSteps={imagePickedSteps} />
                            </Modal>


                            <Modal
                                isOpen={ImagemodalIsOpen}
                                onRequestClose={ImagetoggleModal}
                                style={modalStyle}
                                contentLabel="Example Modal"
                            >
                                <div className='hover:text-purple-700 flex flex-row mb-2' onClick={ImagetoggleModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    Close
                                </div>

                                <div className='bg-gray-200 rounded-xl p-4 h-full'>
                                    <h1 className='mt-5 text-2xl font-bold'>Upload the question and the correct work</h1>
                                    <h2 className='mt-2'> Ensure high quality and easily legiable for best results. </h2>
                                    <div className='mt-3'>
                                        <FileUploader handleChange={uploadImage} name="file" types={fileTypes} />
                                    </div>


                                    {isLoading && <Loader loading={true} />}


                                    <div>
                                        {files && <h2 >file: {files.name}</h2>}
                                    </div>

                                    <button className="bg-green-500 text-white px-4 py-2 rounded-md bottom-0 w-full mt-5" onClick={submitImages}>
                                        Submit
                                    </button>
                                </div>



                            </Modal>


                        </div>

                    )}
                </div>
                <div className='overflow-y-scroll h-96'>
                    {tab === 0 && students.map((title, index) => (
                        // <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3 hover:bg-gray-200" onClick={() => navigate('/analytics/students/' + studentID[index])}>
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3">
                            <p>{title.length > 40 ? title.slice(0, 40) + '...' : title}</p>
                        </div>
                    ))}
                    {tab === 1 && assignmentTitle.map((title, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-10 mb-3 hover:bg-gray-200" onClick={() => navigate('/analytics/assignments/' + assingmentID[index])}>
                            <p>{title}</p>
                        </div>
                    ))}
                </div>
            </div>
            <ToastContainer />

        </div>
    );
}

export default TeacherDash
