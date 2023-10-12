Note that this project will not run properly until a valid Google Books API key is entered into the .env file.

Installation:
	1. Ensure you have Node.js installed
	2. Open up your preferred console (Powershell, Command Prompt, etc.)
	3. Change directory to the Book Recommendation System directory
	4. Enter command: "npm install"
		4.1 This should install all of the dependent libraries
	5. Open the .env file in an editor and add your Google Books API

Running Tests:
	1. Open up your preferred console (Powershell, Command Prompt, etc.)
	2. Change directory to the Book Recommendation System directory
	3. Enter command: "npm run test"


Running the Server:
	1. Ensure nothing is utilizing PORT3000 as the server is set to use that port (though this can be changed by editing line 19 of the server.js file)
	2. Open up your preferred console (Powershell, Command Prompt, etc.)
	3. Change directory to the Book Recommendation System directory
	4. Enter command: "node server.js"


Using the Client:
	1. Ensure server is running (see "Running the Server")
	2. Open up Google Chrome for desired results (other browsers may cause unforeseen issues as I have not tested the system on them)
	3. Visit the following webpage: http://localhost:3000/login.html
	4. Add a user or access an existing user.
		4.1. All existing user passwords are the user's first name in all lower case.
	5. Follow buttons to progress.
	6. Adding a liked/disliked book requires a Google Books ID. This can be obtained from the Google Books URL and is case sensitive.
		6.1. URL of book: https://www.google.ca/books/edition/The_Name_of_the_Wind/TG5DXNXv2tAC?hl=en
		6.2. Breaking up the URL: https://www.google.ca/books/edition/The_Name_of_the_Wind/  |  TG5DXNXv2tAC  |  ?hl=en
		6.3. ID for adding book: TG5DXNXv2tAC
