ERROR: somewhere here: 
                    //remove pendign assignemnt, add it to completed assignments
                    updateDoc(doc(db, "Students", user.uid), {
                        Assigned: arrayRemove(id),
                        Completed: arrayUnion(id)
                    })

and in assigning assignments to students in class



Promt:

Given the question, correct steps, and correct answer, a student's potentially incorrect steps and final answer, determine the student's mistakes. Be very specific in the mistake and include the numbers/calculations that where incorrect. (There may be multiple mistakes or zero mistakes)


          Return in JSON format:
          \`\`\`json
          { "Accuracy": "% Accuracy of student", "mistakes": ["STUDENTMISTAKE1", "STUDENTMISTAKE2"] }
          \`\`\``,

Question: What is the pH of a .15 sr(OH)2 solution?
Correct steps:
1) Sr(OH)2 is a strong base
2) Create a rice table. Sr(OH)2 is a 1:2 ratio to create OH-. (.30M OH- is created)
3) pOH = -log(.3) = .522
3) pH = 14-pOH = 13.477
Correct answer: pH = 13.477

Student steps:
1) .15M Sr(OH-)2 has .15 moles of OH-
2) pH = -log(.15) = .8239
Student answer: pH = .8239




//


const gptPart = async (prompt) => {
    const assingedRef = doc(db, "Teacher", id);
    const assignedSnap = await getDoc(assingedRef);
    var correctAnswer = '';
    var correctQuestion = '';
    var correctSteps = '';

    if (assignedSnap.exists()) {
        console.log("Document data:", assignedSnap.data());
        correctAnswer = (assignedSnap.data().Answer);
        correctQuestion = (assignedSnap.data().Question);
        correctSteps = (assignedSnap.data().Steps);

        console.log("OMG CORECT STPES BELOW")
        console.log(correctSteps)
    }

    const steps = ['Step 1: Write the equation.', 'Step 2: Calculate the pOH.', 'Step 3: Use the pOH to find pH.'];
    const finalAnswer = 'Final Answer';

    const formattedCorrectSteps = correctSteps.map((step, index) => `${index + 1}) ${step.step}\n   Hint: ${step.hint ? step.hint : 'None'}`).join('\n');
    const formattedStudentSteps = steps.map((step, index) => `${index + 1}) ${step}`).join('\n');

    const jsonOutput = JSON.stringify({
        Accuracy: "% Accuracy of student",
        mistakes: ["STUDENTMISTAKE1", "STUDENTMISTAKE2"]
    });

    const promptText = `Given the question, correct steps, and correct answer, a student's potentially incorrect steps and final answer, determine the student's mistakes. Be specific in the mistake. (There may be multiple mistakes or zero mistakes)

Return in JSON format:
${jsonOutput}

Question: ${correctQuestion}
Correct steps:
${formattedCorrectSteps}

Correct answer:${correctAnswer}

Student steps:
${formattedStudentSteps}
Student answer: ${finalAnswer}`;

    console.log(promptText);

    client.chat.completions
        .create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: promptText,
                }
            ],
        })
        .then((data) => {
            const response = JSON.parse(data.choices[0].message.content);
            // Accessing the data
            console.log("Accuracy:", response.Accuracy);
            console.log("Mistakes:", response.mistakes);
        });
}


