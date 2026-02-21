# Clip-Nexus

## Overview (**In-Development**)

A backend web app for ClipNexus where users can stream videos

* [Models Structure Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## Learnings
1. [GitIgnore Generator](https://mrkandreev.name/snippets/gitignore-generator/) a webapp allowing us to generate `.gitignore` file (or its content) based on the development environment, for ex: "node.js", saveing our time and energy. FYI, I've also copy-pasted `.gitignore` content from the same webapp.
2. Using [Prettier](https://www.npmjs.com/package/prettier) for code formatting and mostly to avoid merge-conflicts, by doing proper [configuration](https://github.com/VinayNoogler000/ClipNexus-YT-Clone/blob/main/.prettierrc).
3. Express App has it's own event listeners which can be defined using `app.on()` method, where the first argument will the event name and the 2nd argument will the callback to be executed to handle the triggered event.
4. In Node.js runtime environment, we're provided with `process` object, which is the reference to the current running process in Node.js. This `process` object has a method called `exit()` which syncrhonously exits the process, irrespective of whether or not there are any pending asynchronous process(s) in the event loop or not. The `exit()` takes a status code (number type) as an argument which gets printed on the terminal when the process is exited. Normally, upon completion of every process in Node.js this exit code is printed on the terminal, but this `exit()` method allows us to do it manually and syncrhonously at any point of time in the program/process. If we don't pass any status code as arg to the `exit()` then the default "success code" is `0` or the whatever value is of the `process.exitCode` property, if set. Mostly, we don't use `process.exit()` in programs, especially asynchronous operations, rather we just set the `process.exitCode` property, and let the operation to be completed normally and exited with the set exit-status-code.