import React from "react";
import Hero from "../Components/Hero";
import { Nav } from "../Components/Nav";
import Features from "../Components/Features";
export function Home() {
    return (
        <div className="bg-purple-200 h-screen ">

            <div className="pt-5">
                <Nav />
            </div>

            <div className="flex items-center justify-center flex-col">
                <Hero />
                <Features />
            </div>
        </div>
    );
}
