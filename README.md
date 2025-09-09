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

> Type npm run start:local

The react app will be opened on your local network at http://ipAddress:3000 or http://localhost:3000
The server app will run on port 8080 of your local network: http://ipAddress:8080 or http://localhost:8080

If you cannot run the server app on port 8080 go into server.ts and change the port number to one that works for you and then type npm run build in the terminal to compile the changes you made and start the server.

## Issues

> Play-by-Play when a runner starts running towards a base but ends back at the same base they started from the pin will walk around the entire diamond.
> Play-by-Play occasionally when a pin is at 1b and going to 2b while a pin is waiting to go from home to 1b, the home to 1b pin animation will be hidden.
