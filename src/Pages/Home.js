import React from "react";
import Hero from "../Components/Hero";
import { Nav } from "../Components/Nav";
import Features from "../Components/Features";
export function Home() {
    return (
        <div className="bg-purple-200 ">

            <div className="pt-5">
                <Nav />
            </div>

            <div className="flex items-center justify-center flex-col  h-screen w-screen w-full">
                <Hero />
            </div>
            <div className="bg-white flex items-center justify-center flex-col  h-screen">
                <Features />
            </div>

        </div>
    );
}
