## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.


## Design Documents:
User Diagram:
https://app.eraser.io/workspace/uCujEPtRlQIOOpTHLAZ2?origin=share

Sequence Diagram:
https://app.eraser.io/workspace/Z9nnvKFw6uBqfCiw7z3g?origin=share

App requirements:
https://docs.google.com/document/d/15DGLAQPNOcNfosnqi6z3F7URQ-xhkBvEyl7Kx2p5Bo8/edit?usp=sharing

## Milwaukee Brewers Instructions on how to run the app:

There's 2 file directories:
MLBApp and Server

Type npm install to install all project dependencies

You will need to open a terminal for each of these (It does not matter the order, but I will start with the react app first.)

Change Directories (CD) into MLBApp directory in the terminal

> Type npm install to install all project dependencies

> Type npm run start

In a different terminal window you will need to CD into the Server directory

> Type npm install to install all project dependencies

> Type npm run start

The react app will be opened on your local network at http://ipAddress:3000 or http://localhost:3000
The server app will run on port 8080 of your local network: http://ipAddress:8080 or http://localhost:8080

If you cannot run the server app on port 8080 go into server.ts and change the port number to one that works for you and then type npm run build in the terminal to compile the changes you made and start the server.
