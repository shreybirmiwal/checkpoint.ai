import React, { useState } from 'react';

function CreateQuestion() {
    const [question, setQuestion] = useState('');
    const [steps, setSteps] = useState([{ step: '', hint: '' }]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Question:', question);
        console.log('Steps:', steps);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Create Question</h1>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2" htmlFor="question">Question:</label>
                <textarea className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500" id="question" value={question} onChange={handleQuestionChange} />

                <h2 className="text-lg font-semibold mt-6 mb-2">Steps:</h2>
                {steps.map((step, index) => (
                    <div key={index} className="mb-4">
                        <h3 className="text-md font-medium mb-2">Step {index + 1}</h3>
                        <label className="block mb-1" htmlFor={`step-${index}`}>Step:</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            id={`step-${index}`}
                            name="step"
                            value={step.step}
                            onChange={(e) => handleStepChange(index, e)}
                        />

                        <label className="block mt-2 mb-1" htmlFor={`hint-${index}`}>Hint:</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            id={`hint-${index}`}
                            name="hint"
                            value={step.hint}
                            onChange={(e) => handleStepChange(index, e)}
                        />

                        <button type="button" className="text-red-600 mt-2" onClick={() => handleDeleteStep(index)}>
                            Delete Step
                        </button>
                    </div>
                ))}

                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2" onClick={handleAddStep}>
                    Add Step
                </button>

                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default CreateQuestion;
