# Bit För Bit backend

"Bit För Bit" is a web application designed to manage puzzle collections. Users can add, update, and remove puzzles from their collection. This README provides instructions on setting up and running the project

## Description
This is the server for the React application "Bit För Bit". The server works with Express, Node.js and is connected to MongoDB through Mongoose. The purpose of the server is to
- handle registration and deletion of users
- authenticate users
- manage and update puzzle data in MongoDB
  - add new puzzle
  - update information about existing puzzle
  - fetch information about existing puzzle
  - delete puzzle

## Prerequisites
- Node.js
- npm (Node Package Manager)
- MongoDB
- Postman (optional, for API testing)

## Installation
To use this project, follow these steps:

1. Clone the repository
```bash
git clone https:\/\/github.com/aw22hs/bit-for-bit-backend.git
cd bit-for-bit-backend
```
2. Install the required dependencies: 
```bash
npm install
```  
3. Create a `.env`file in the root directory and update it with the following variables:
- PORT = Port number
- DB_CONNECTION_STRING = The connections string to your MongoDB database
- SESSION_NAME = Your session name
- SESSION_SECRET = Your session secret
- JWT_SECRET = Your JWT secret
- ORIGIN = The URL to the server
- FRONTEND = The URL to the frontend
- SECRET_ENCRYPTION_KEY = The key for the encryption
- SECRET_ENCRYPTION_IV = The initializatoin vector for the encryption

## Running the Server
```bash
npm start
```

This will start the server at 'http://localhost:PORT'. The server will connect to MongoDB and listen for incoming requests.

## API Documentation
To test the API endpoints, you can use the provided Postman collection:

- Import iteration-7.postman_collection.json into Postman.
- Set up environment variables in Postman for baseUrl and other necessary tokens.

## Routes
### User Authentication
- POST /login - Authenticate users and return a JWT.
- POST /create - Register a new user.
- GET /logout - Log out users and end sessions.

### Puzzle Management
- POST /puzzles - Add a new puzzle to the collection.
- GET /puzzles - Retrieve all puzzles.
- GET /puzzles/:id - Retrieve a specific puzzle.
- PUT /puzzles/:id - Update a specific puzzle.
- DELETE /puzzles/:id - Remove a puzzle from the collection.

## Contributing
The boiler plate code in this project is from the application "PixFlixr" that was developed by Anja Willsund during the course 1DV613 Software Development Project.  
Contributions to the "Bit För Bit" project are welcome. If you have suggestions or improvements, please fork the repository and submit a pull request.
