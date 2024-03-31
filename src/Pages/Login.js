import React from 'react'
import SignLog from '../Components/SignLog';
import { Nav } from '../Components/Nav';

function Login() {
    return (
        <div className="bg-purple-200 h-screen flex flex-col justify-center">
            <div className="pt-5">
                <Nav />
            </div>
            <div className="flex items-center justify-center flex-grow">
                <SignLog />
            </div>
        </div>
    );
}

export default Login
