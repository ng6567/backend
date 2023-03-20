### Back end Installation ###

Clone this repo. From the "back" folder of the project, run `npm install`. You 
can then run the server with `node server`. 
The server should run on `localhost` with default port `3000`. If the
server runs on another port for any reason, this is printed to the
console when the server starts, e.g. `Listening on port 3001`.


### .env file config ###
You will need to run this project to create yourself and edit .env file
This file should be added at your project root
It should contain the following :

MONGODB_USER=Openclassrooms
MONGODB_PWD=6ArPOqq2yPBobd9P
JWT_SECRET=<"Your own secret">