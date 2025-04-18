import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css"; // Keep this for any custom styles not covered by Tailwind

const initialQuestions = [
  {
    name: "q1",
    code: `#include <iostream>\nusing namespace std;\n\nbool isEven(int n) {\n\treturn n % 2 == 0;\n}\n\nint main() {\n\tint num;\n\tcin >> num;\n\tcout << isEven(num) << endl;\n\treturn 0;\n}`,
    testCase: { input: "6", correctOutput: "1", incorrectOutput: "0" },
  },
  {
    name: "q2",
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nstring reverseStr(string s) {\n\tstring rev = "";\n\tfor (int i = s.length() - 1; i >= 0; i--) {\n\t\trev += s[i];\n\t}\n\treturn rev;\n}\n\nint main() {\n\tstring input;\n\tcin >> input;\n\tcout << reverseStr(input) << endl;\n\treturn 0;\n}`,
    testCase: { input: "cat", correctOutput: "tac", incorrectOutput: "act" },
  },
  {
    name: "q3",
    code: `#include <iostream>\nusing namespace std;\n\nint multiply(int a, int b) {\n\treturn a * b;\n}\n\nint main() {\n\tint num1, num2;\n\tcin >> num1 >> num2;\n\tcout << multiply(num1, num2) << endl;\n\treturn 0;\n}`,
    testCase: { input: "5 3", correctOutput: "15", incorrectOutput: "8" },
  },
  {
    name: "q4",
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint countVowels(string s) {\n\tint count = 0;\n\tfor (char c : s) {\n\t\tif (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {\n\t\t\tcount++;\n\t\t}\n\t}\n\treturn count;\n}\n\nint main() {\n\tstring input;\n\tcin >> input;\n\tcout << countVowels(input) << endl;\n\treturn 0;\n}`,
    testCase: { input: "apple", correctOutput: "2", incorrectOutput: "0" },
  },
];

function App() {
  const [selectedQuestion, setSelectedQuestion] = useState(
    initialQuestions[0].name
  );
  const [cppCode, setCppCode] = useState(initialQuestions[0].code);
  const [testCase, setTestCase] = useState(initialQuestions[0].testCase);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasCodeChanged = useRef(false);

  useEffect(() => {
    const currentQuestion = initialQuestions.find(
      (q) => q.name === selectedQuestion
    );
    if (currentQuestion && !hasCodeChanged.current) {
      setCppCode(currentQuestion.code);
    }
    if (currentQuestion) {
      setTestCase({ ...currentQuestion.testCase });
    }
    hasCodeChanged.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestion]); // Removed initialQuestions from dependencies

  const handleQuestionChange = (event) => {
    setSelectedQuestion(event.target.value);
    hasCodeChanged.current = false;
  };

  const handleCodeChange = (event) => {
    setCppCode(event.target.value);
    hasCodeChanged.current = true;
  };

  const handleTestCaseChange = (event) => {
    setTestCase({ ...testCase, [event.target.name]: event.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await axios.post("http://localhost:3000/run-cpp", {
        code: cppCode,
        testCases: [testCase],
      });
      setResults(response.data.results);
    } catch (err) {
      setError("Failed to run code. Please check the server and your input.");
      console.error("Error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-6 sm:px-12 lg:px-24 flex flex-col gap-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-500">Dev Dash</h1>
      </header>

      <section className="bg-gray-800 shadow-lg rounded-md p-6">
        <label
          htmlFor="questionSelect"
          className="block text-gray-300 text-sm font-semibold mb-2"
        >
          Select Question:
        </label>
        <div className="relative">
          <select
            id="questionSelect"
            className="block appearance-none w-full bg-gray-700 border border-gray-600 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-indigo-500"
            value={selectedQuestion}
            onChange={handleQuestionChange}
          >
            {initialQuestions.map((question) => (
              <option key={question.name} value={question.name}>
                {question.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 shadow-lg rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-indigo-500 mb-3">
            C++ Code
          </h2>
          <textarea
            className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-100"
            value={cppCode}
            onChange={handleCodeChange}
            placeholder="Enter your C++ code here..."
          />
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-indigo-500 mb-3">
            Test Case
          </h2>
          <div className="bg-gray-700 rounded-md p-4 border border-gray-600">
            <div className="mb-3">
              <label className="block text-gray-300 text-sm font-semibold mb-1">
                Input:
              </label>
              <input
                disabled
                type="text"
                name="input"
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-600 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                value={testCase.input}
                onChange={handleTestCaseChange}
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-300 text-sm font-semibold mb-1">
                Correct Output:
              </label>
              <input
                disabled
                type="text"
                name="correctOutput"
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-600 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                value={testCase.correctOutput}
                onChange={handleTestCaseChange}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1">
                Desired Output:
              </label>
              <input
                disabled
                type="text"
                name="incorrectOutput"
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-600 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                value={testCase.incorrectOutput}
                onChange={handleTestCaseChange}
              />
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      {error && <p className="text-red-400 mt-4">{error}</p>}

      {results.length > 0 && (
        <section className="bg-gray-800 shadow-lg rounded-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-indigo-500 mb-4">Result</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 mb-4 border border-gray-700 rounded-md bg-gray-700"
            >
              <p>
                <strong>Input:</strong>{" "}
                <span className="text-gray-300">{testCase.input}</span>
              </p>
              <p>
                <strong>Expected Correct Output:</strong>{" "}
                <span className="text-gray-300">{testCase.correctOutput}</span>
              </p>
              <p>
                <strong>Desired Output:</strong>{" "}
                <span className="text-gray-300">
                  {testCase.incorrectOutput}
                </span>
              </p>
              <p>
                <strong>Actual Output:</strong>{" "}
                <span className="font-mono text-green-400">
                  {result.actualOutput}
                </span>
              </p>
              <p>
                <strong>Result:</strong>{" "}
                {result.actualOutput === testCase.incorrectOutput &&
                result.actualOutput !== testCase.correctOutput ? (
                  <span className="text-green-400 font-bold">
                    Passed (Matched Desired Output)
                  </span>
                ) : (
                  <span className="text-red-400 font-bold">
                    Failed (Did not match Desired output or matched correct
                    output)
                  </span>
                )}
              </p>
              {result.compilationError && (
                <p className="text-red-400 mt-2">
                  <strong>Compilation Error:</strong>{" "}
                  <span className="font-mono">{result.compilationError}</span>
                </p>
              )}
              {result.runtimeError && (
                <p className="text-red-400 mt-2">
                  <strong>Runtime Error:</strong>{" "}
                  <span className="font-mono">{result.runtimeError}</span>
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
