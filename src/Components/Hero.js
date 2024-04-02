import React from "react";
import Nav from "./Nav";

export default function Hero() {

    return (
        <div>
            <section className="">
                <div class="px-4 py-12 mx-auto max-w-7xl sm:px-6 md:px-12 lg:px-24 lg:py-24">
                    <div class="flex flex-wrap items-center mx-auto max-w-7xl">
                        <div class="w-full lg:max-w-lg lg:w-1/2 rounded-xl">
                            <div>
                                <div class="relative w-full max-w-lg">
                                    <div class="absolute top-0 rounded-full bg-violet-300 -left-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>

                                    <div class="absolute rounded-full bg-fuchsia-300 -bottom-24 right-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                                    <div class="relative">
                                        <img class="object-cover object-center mx-auto rounded-lg shadow-2xl" alt="hero" src="/placeholder.png" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-start mt-12 mb-16 text-left lg:flex-grow lg:w-1/2 lg:pl-6 xl:pl-24 md:mb-0 xl:mt-0">
                            <h1 class="mb-2 text-4xl font-bold leading-none tracking-tighter text-neutral-600 md:text-7xl lg:text-5xl">stop grading the answer.</h1>
                            <h1 class="mb-8 text-4xl font-bold leading-none tracking-tighter text-neutral-600 md:text-7xl lg:text-5xl">start analyzing the steps.</h1>

                            <div class="mt-0 lg:mt-6 max-w-7xl sm:flex">
                                <div class="mt-3 rounded-lg sm:mt-0">
                                    <a href="/dashboard">

                                        <button class="ite</a>ms-center block px-10 py-4 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Let's Start!</button>
                                    </a>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}