import React from 'react'
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../Nav';
import { Accordian } from './Accordian';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AccordianOuter } from './AccordianOuter';

import OpenAI from 'openai';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
//

function AnalyticsAssignments() {

    const client = new OpenAI({
        apiKey: process.env['REACT_APP_OPENAI_API_KEY'],
        dangerouslyAllowBrowser: true
        , // This is the default and can be omitted
    });


    let { id } = useParams();
    const [user, setUser] = useState(null);
    const auth = getAuth();
    const navigate = useNavigate();


    const [common_mistakes, setCommonMistakes] = useState([]);
    const [proficiency, setProficiency] = useState();
    const [studentRes, setStudentRes] = useState();

    useEffect(() => {
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

    useEffect(() => {
        //get data
        getData();
    }, []);

    const getData = async () => {
        const dataDoc = await getDoc(doc(db, "Stats", id));
        console.log("GETTING DATA BRO .")
        if (dataDoc.exists()) {
            console.log("Document data:", dataDoc.data());
            setCommonMistakes(dataDoc.data().CommonMistakes);
            //setProficiency(dataDoc.data().Proficiency);
            // setStudentRes(dataDoc.data().StudentRes);
            // console.log(dataDoc.data().StudentRes)
        }
    }

    const gptPart = async (data) => {


        const jsonOutput = JSON.stringify({
            commonMistakes: ["COMMONMISTAKE1", "COMMONMISTAKE2"]
        });

        const promptText = `I am a teacher and you are my AI teacher assistant. Given a list of mistakes that my students are making, return a simplified, abstracted, arraylist of mistakes that my students are making. Try to simplify as much as possible, by combining similar mistakes. Post the top 3 mistakes
        
        Return in JSON format:
        ${jsonOutput}

        List of mistakes: ${data}`;

        console.log(promptText)

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
                    console.log(data.choices[0].message.content);
                    const response = JSON.parse(data.choices[0].message.content);
                    // Accessing the data
                    console.log("Common MISTAKES:", response.commonMistakes);


                    updateDoc(doc(db, "Stats", id),
                        { CommonMistakes: response.commonMistakes }
                    ).then(() => {
                        toast.success("Updated analytics successfully!");
                        getData();
                    }).catch((error) => {
                        console.error("Error updating document: ", error);
                        toast.error("Error updating analytics!");
                    });

                    return response.commonMistakes
                } catch (error) {
                    toast.error("Error! " + error);
                }



            });
    }


    const genData = async () => {


        await getDoc(doc(db, "Stats", id)).then((docSnap) => {
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());

                const data = docSnap.data().allMistakes;

                if (data == null || data.length == 0) {
                    toast.error("No data to generate analytics!");
                } else {
                    gptPart(data)
                }

            }
        })
    }


    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="h-full container mx-auto mt-8">

                <h2 className="text-3xl font-semibold mb-4">Assignment Analytics</h2>
                ID: {id}

                <div className='bg-blue-400 rounded-xl p-3 mt-5 w-80 hover:bg-blue-500' onClick={() => {
                    genData();
                    //window.location.reload();
                }}>
                    Generate updated analytics (computationally heavy)
                </div>

                <div className='bg-gray-200 rounded-xl p-3 mt-5'>
                    <AccordianOuter common_mistakes={common_mistakes} />
                </div>

            </div>
            <ToastContainer />

        </div >
    );

}

export default AnalyticsAssignments
