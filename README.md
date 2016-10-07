# Graph - A2 Computing Project version

## Disclaimer
I wrote this two years ago for a school project.
It's a bit rough around the edges.
It's also compatible with some slightly-old-but-should-still-do-better-for-its-time version of Internet Explorer.

## Context
This is the project I submitted for my A Level Computing project.
I used git during development, but that repository is not really suitable for publishing.
This repository contains only the final submitted version of the application itself.

## Description
The application is a relatively basic mathematical graph plotting tool.
I was inspired to create this after using programs like Autograph in my studies.

## Features
### Mathematical expression parser
I decided that the user should be able to enter equations just by typing them.
Other methods I considered lacked the "natural" feel.
The app parses normal expressions into a post-fix ordered list of operations and functions which is then evaluated when drawing the graph.
### Mouse controlled viewport
Again, in the interests of ease of use I decided that the controls for viewing the graph should be as natural as possible.
Keyboard arrow-key controlls or on-screen buttons were undesirably clunky.
### Import/export
A requirement of the project specification was that the application should store some information persistently.
In order to fulfil this requirement, I added a system which would allow the user to save the state of the graph and load it in later.
The user can also save an image of the current graph view.
