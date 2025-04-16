import React, { useState } from "react";
import "./App.css"; // Make sure your App.css has the Tailwind directives

function App() {
  const [language, setLanguage] = useState("javascript"); // Default language
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([
    { id: 1, input: "[]", expectedOutput: "0" }, // Example initial test case
  ]);
  const [nextId, setNextId] = useState(2); // For generating unique keys
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Test Case Management ---
  const handleAddTestCase = () => {
    setTestCases([...testCases, { id: nextId, input: "", expectedOutput: "" }]);
    setNextId(nextId + 1);
  };

  const handleRemoveTestCase = (idToRemove) => {
    setTestCases(testCases.filter((tc) => tc.id !== idToRemove));
  };

  const handleTestCaseChange = (id, field, value) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  // --- Submission Logic ---
  const handleSubmit = async () => {
    setIsLoading(true);
    setResults(null);
    setError(null);

    if (!code.trim()) {
      setError("Code cannot be empty.");
      setIsLoading(false);
      return;
    }
    if (testCases.length === 0) {
      setError("Please add at least one test case.");
      setIsLoading(false);
      return;
    }

    let parsedTestCases;
    try {
      parsedTestCases = testCases.map((tc) => {
        if (!tc.input.trim() || !tc.expectedOutput.trim()) {
          throw new Error(
            `Test case #${tc.id} has empty input or expected output.`
          );
        }
        return {
          input: JSON.parse(tc.input),
          expectedOutput: JSON.parse(tc.expectedOutput),
        };
      });
    } catch (e) {
      setError(
        `Invalid JSON in test cases: ${e.message}. Please ensure inputs and expected outputs are valid JSON.`
      );
      setIsLoading(false);
      return;
    }

    const payload = {
      language,
      code,
      testCases: parsedTestCases,
    };

    try {
      const response = await fetch("http://localhost:3000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      setResults(data);
    } catch (err) {
      console.error("API Call failed:", err);
      setError(
        err.message || "Failed to fetch results. Is the backend server running?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonOutput = (data) => {
    if (data === null || data === undefined) return "null";
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen flex flex-col items-center py-8">
      <h1 className="text-2xl font-semibold mb-6">Mini Code Runner</h1>

      <div className="flex flex-col md:flex-row w-full max-w-4xl px-4 md:px-0">
        {/* Left Panel: Code Editor */}
        <div className="md:w-1/2 md:mr-4 bg-gray-800 rounded-md shadow-md p-4 mb-4 md:mb-0">
          <div className="mb-2">
            <label
              htmlFor="language-select"
              className="block text-sm font-bold mb-1"
            >
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="javascript">JavaScript</option>
              {/* Add more languages here if backend supports them */}
            </select>
          </div>
          <div>
            <label
              htmlFor="code-editor"
              className="block text-sm font-bold mb-1"
            >
              Code (<code className="text-green-400">define function </code>
              <code className="text-yellow-400">solve</code>):
            </label>
            <textarea
              id="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Example for JavaScript\nfunction solve(input) {\n  // Your logic here\n  return input;\n}`}
              rows="20"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"
            />
          </div>
        </div>

        {/* Right Panel: Test Cases and Results */}
        <div className="md:w-1/2 flex flex-col">
          <div className="bg-gray-800 rounded-md shadow-md p-4 mb-4 flex-grow">
            <h2 className="text-lg font-semibold mb-3">Test Cases</h2>
            <p className="text-gray-500 text-sm mb-2">
              Enter valid JSON for Input and Expected Output.
            </p>
            {testCases.map((tc, index) => (
              <div
                key={tc.id}
                className="mb-3 p-3 border border-gray-700 rounded-md bg-gray-900"
              >
                <h4 className="text-md font-semibold mb-2">
                  Test Case {index + 1}
                </h4>
                <div className="mb-2">
                  <label
                    htmlFor={`input-${tc.id}`}
                    className="block text-sm font-bold mb-1"
                  >
                    Input:
                  </label>
                  <textarea
                    id={`input-${tc.id}`}
                    value={tc.input}
                    onChange={(e) =>
                      handleTestCaseChange(tc.id, "input", e.target.value)
                    }
                    rows="2"
                    placeholder="e.g., [1, 2, 3]"
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`output-${tc.id}`}
                    className="block text-sm font-bold mb-1"
                  >
                    Expected Output:
                  </label>
                  <textarea
                    id={`output-${tc.id}`}
                    value={tc.expectedOutput}
                    onChange={(e) =>
                      handleTestCaseChange(
                        tc.id,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                    rows="2"
                    placeholder="e.g., 6"
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRemoveTestCase(tc.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mt-2 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddTestCase}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              Add Test Case
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="bg-gray-800 rounded-md shadow-md p-4 mt-4">
              <h2 className="text-lg font-semibold mb-3">Results</h2>
              <h3
                className={`text-md font-semibold mb-2 ${
                  results.overallStatus?.toLowerCase() === "passed"
                    ? "text-green-400"
                    : results.overallStatus?.toLowerCase() === "wrong answer"
                    ? "text-red-400"
                    : results.overallStatus?.toLowerCase() === "error"
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                Overall Status: {results.overallStatus}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="bg-gray-700 text-gray-400">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Input</th>
                      <th className="px-3 py-2">Expected</th>
                      <th className="px-3 py-2">Actual</th>
                      <th className="px-3 py-2">Time (ms)</th>
                      <th className="px-3 py-2">Stderr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results?.map((res, index) => (
                      <tr
                        key={index}
                        className={`bg-gray-900 border-b border-gray-700 ${
                          res.status?.toLowerCase() === "passed"
                            ? "text-green-300"
                            : res.status?.toLowerCase() === "wrong answer"
                            ? "text-red-300"
                            : res.status?.toLowerCase() === "error"
                            ? "text-yellow-300"
                            : "text-gray-300"
                        }`}
                      >
                        <td className="px-3 py-2">{res.testCase}</td>
                        <td className="px-3 py-2">{res.status}</td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-pre-wrap">
                          {renderJsonOutput(res.input)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-pre-wrap">
                          {renderJsonOutput(res.expectedOutput)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-pre-wrap">
                          {renderJsonOutput(res.actualOutput)}
                        </td>
                        <td className="px-3 py-2">{res.executionTimeMs}</td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-pre-wrap">
                          {res.stderr ? res.stderr : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 mt-4 p-3 border border-red-500 rounded-md bg-red-100">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="text-blue-300 mt-4">Running code...</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline mt-4"
          >
            {isLoading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
