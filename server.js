//Need to have a folder of user profile info in JSON file
//Load that from file on startup and save on profile update
//const http = require('http');
//const fs = require('fs');
//const url = require('url');

const fetch = require('node-fetch');
const express = require('express');
const app = express();
const {performance} = require('perf_hooks');
const Book = require('./book').Book;
const User = require('./user').User;
const rec = require('./rec');
const Rec = rec.Rec;
const Datastore = require('nedb');
require('dotenv').config();
const API_KEY = process.env.API_KEY;

app.listen(3000);
app.use(express.static('public'));
app.use(express.json()); //Can add limitations in transfer of data

console.log('Server running on PORT 3000    CTRL-C to quit')
console.log('To test: http://localhost:3000/login.html');

const users = new Datastore('users.db')
users.loadDatabase();

//Server collects book from Google Books and returns it to Client
app.post('/bookID', async (req, res) => {
	let bookID = req.body.bookID
	//console.log(bookID);
	try {
		let url = 'https://www.googleapis.com/books/v1/volumes/'+bookID;
		let bookRes = await fetch(url);
		let data = await bookRes.json();
		//console.log(data)
		let {id} = data;
		let {title, authors, description, categories} = data.volumeInfo;
		let b = new Book(title, authors, id, categories, description);
		console.log(b);
		res.json({
			status: "success",
			book: b
		});
	} catch (err) {
		res.json({
			status: "failure",
		});
	}
});

app.post('/newUser', async (req, res) => {
	let data = req.body;
	//console.log(data);
	let {name, password, likedBooks, genres, dislikedBooks} = data;
	//Create user object given information
	let newUser = new User(name, password);
	for(let i = 0; i < likedBooks.length; i++){
		newUser.addLikedBook(JSON.parse(likedBooks[i])); //Already in the form of a book object. No need to remake.
	}
	newUser.genres = genres;
	for(let i = 0; i < dislikedBooks.length; i++){
		newUser.addDislikedBook(JSON.parse(dislikedBooks[i])); //Already in the form of a book object. No need to remake.
	}
	//console.log(newUser);
	//Check if user is already in database
	users.find({name: newUser.name}, function (err, docs) {
		//console.log(docs);
		if(docs.length === 0) { //user not in database
			//add user to database
			console.log('Adding user to DB');
			users.insert(newUser);
			res.json({
				status: "success"
			});
		} else { //user in database
			console.log('User in DB');
			res.json({
				status: "exists"
			});
		}
	});
});

app.post('/getProfile', async (req, res) => {
	let userName = req.body.userName;
	let password = req.body.password;
	users.find({name: userName}, function (err, docs) {
		if(docs[0].password === password){
			console.log('Sending user with name: ' + userName);
			res.json({
				status: 'success',
				user: docs[0]
			});
		} else {
			res.json({
				status: 'failure',
				user: null
			});
		}
	});
});

app.post('/updateLikedBooks', async (req, res) => {
	let {userName, book, genres} = req.body;
	console.log(userName + ': ' + book.title + ' added to liked books'); 
	users.update({name: userName},{$addToSet: {likedBooks: book}},{}, function(){
		//Adds book to liked books
	});
	users.update({name: userName},{$set: {genres: genres}},{}, function(){
		//update genres
	});
	res.json({
		status: 'success'
	});
});

app.post('/updateDislikedBooks', async (req, res) => {
	let {userName, book} = req.body;
	console.log(userName + ': ' + book.title + 'added to disliked books'); 
	users.update({name: userName},{$addToSet: {dislikedBooks: book}},{}, function(){
		//Adds book to disliked books
	});
	res.json({
		status: 'success'
	});
});

app.post('/getRec', async (req, res) => {
	let {user} = req.body;
	console.log('Getting recommendations for ' + user.name);
	console.log('This will take some time.');
	let r = new Rec(user);
	let startTime = performance.now();
	let recs = await r.getRecommendation();
	let endTime = performance.now();
	console.log('Recommendations took ' + (Math.ceil((endTime - startTime)/1000)) + 's to complete');
	if(recs !== null){
		res.json({
			status: 'success',
			recommendations: recs
		});
	} else {
		res.json({
			status: 'failure',
			recommendations: recs
		});
	}
});

app.get('/getUsers', async (req, res) => {
	users.loadDatabase(); //in case users have been added since server start
	let userNames = [];
	users.find({}, function (err, docs) {
		for(i = 0; i < docs.length; i++){
			//console.log(docs[i].name);
			userNames.push(docs[i].name);
		}
		res.json({
			status: "success",
			names: userNames
		});
	});
});