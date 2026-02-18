# Clip-Nexus

## Overview (**In-Development**)

A backend web app for ClipNexus where users can stream videos

* [Models Structure Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## Learnings
1. [GitIgnore Generator](https://mrkandreev.name/snippets/gitignore-generator/) a webapp allowing us to generate `.gitignore` file (or its content) based on the development environment, for ex: "node.js", saveing our time and energy. FYI, I've also copy-pasted `.gitignore` content from the same webapp.
2. Using [Prettier](https://www.npmjs.com/package/prettier) for code formatting and mostly to avoid merge-conflicts, by doing proper [configuration](https://github.com/VinayNoogler000/ClipNexus-YT-Clone/blob/main/.prettierrc).
3. Express App has it's own event listeners which can be defined using `app.on()` method, where the first argument will the event name and the 2nd argument will the callback to be executed to handle the triggered event.