import React from 'react'
import { Nav } from '../Components/Nav';
import SignLogUP from '../Components/SignLogUP';

function SignUp() {
    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="flex items-center justify-center flex-grow">
                <SignLogUP />
            </div>
        </div>
    );
}

export default SignUp
