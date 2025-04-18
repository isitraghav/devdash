const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.post("/run-cpp", async (req, res) => {
  const { code, testCases } = req.body;

  if (!code || !Array.isArray(testCases)) {
    return res
      .status(400)
      .json({ error: "Missing code or testCases in the request body." });
  }

  const results = [];
  const cppFileName = "user_solution.cpp";
  const executableName = "user_solution";

  try {
    console.log("Saving C++ code to file:", cppFileName);
    await fs.writeFile(cppFileName, code);

    console.log("Compiling C++ code...");
    await new Promise((resolve, reject) => {
      exec(
        `g++ ${cppFileName} -o ${executableName}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Compilation error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            reject({ type: "compilation", message: stderr });
            return;
          }
          if (stderr) {
            console.warn(`Compilation warning: ${stderr}`);
          }
          resolve();
        }
      );
    });

    console.log("Running the executable for each test case...");
    for (const testCase of testCases) {
      const { input, correctOutput, incorrectOutput } = testCase;

      console.log(`Running test case with input: ${input}`);
      await new Promise((resolve, reject) => {
        const process = exec(`./${executableName}`, (error, stdout, stderr) => {
          const actualOutput = stdout.trim();
          const testResult = {};

          if (error) {
            console.error(`Execution error for input "${input}": ${error}`);
            testResult.actualOutput = actualOutput;
            testResult.expectedCorrectOutput = correctOutput;
            testResult.expectedIncorrectOutput = incorrectOutput;
            testResult.compilationError = false; // Compilation was successful
            testResult.runtimeError = stderr || error.message;
            testResult.passed = false; // Mark as failed due to runtime error
            results.push(testResult);
            resolve();
            return;
          }
          if (stderr) {
            console.warn(`Execution warning for input "${input}": ${stderr}`);
          }

          testResult.actualOutput = actualOutput;
          testResult.expectedCorrectOutput = correctOutput;
          testResult.expectedIncorrectOutput = incorrectOutput;
          testResult.compilationError = false;
          testResult.runtimeError = null;

          // Intentionally flip the results
          if (actualOutput === correctOutput) {
            testResult.passed = false; // Should have passed, marked as failed
          } else if (actualOutput === incorrectOutput) {
            testResult.passed = true; // Should have failed, marked as passed
          } else {
            testResult.passed = false; // Neither matched, consider it failed
          }

          results.push(testResult);
          resolve();
        });

        // Pass the input to the executable
        console.log(`Passing input to the executable: ${input}`);
        process.stdin.write(input + "\n"); // Assuming input is line-based
        process.stdin.end();
      });
    }

    res.json({ results });
  } catch (error) {
    if (error.type === "compilation") {
      res
        .status(400)
        .json({ error: "Compilation failed", details: error.message });
    } else {
      console.error("Error running C++ code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    console.log("Cleaning up the created files...");
    try {
      await fs.unlink(cppFileName);
      await fs.unlink(executableName);
    } catch (err) {
      console.warn("Error cleaning up files:", err);
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

