const assert = require('chai').assert;
const User = require('../user').User;
const Book = require('../book').Book;
const fetch = require('node-fetch');

require('dotenv').config();
const API_KEY = process.env.API_KEY;

describe('User', function() {
	const user1 = new User('John Smith', 'a');
	const user2 = new User('Jean Paule', 'a');
	
	it('User 1 should have the name John Smith, user2 should have the name Jean Paule', function(){
		assert.equal(user1.name, 'John Smith');
		assert.equal(user2.name, 'Jean Paule');
	});

	it('Adding a book to a user without books should give a non-empty list of books and a non-empty list of genres', async function(){
		const res = await fetch('https://www.googleapis.com/books/v1/volumes/BcG2dVRXKukC?key=' + API_KEY);
		const data = await res.json();
		const {id} = data;
		const {title, authors, categories} = data.volumeInfo;
		let book = new Book(title, authors, id, categories, 'I say blah blah blah.');
		
		assert.isEmpty(user1.likedBooks);
		assert.isEmpty(user1.dislikedBooks);
		user1.addLikedBook(book);
		user1.addDislikedBook(book);
		assert.isNotEmpty(user1.likedBooks);
		assert.isNotEmpty(user1.dislikedBooks);
		assert.isNotEmpty(user1.likedGenres);
	});
	
	it('Adding two books should increment features', async function(){
		const user3 = new User('John Smith');
		const res = await fetch('https://www.googleapis.com/books/v1/volumes/BcG2dVRXKukC?key=' + API_KEY);
		const data = await res.json();
		let {id} = data;
		let {title, authors, categories} = data.volumeInfo;
		let book = new Book(title, authors, id, categories, 'I say blah blah blah.');
		user3.addLikedBook(book);
		
		const res2 = await fetch('https://www.googleapis.com/books/v1/volumes/k_Lit-EU4FcC?key=' + API_KEY);
		const data2 = await res2.json();
		let id2 = data2.id;
		let title2 = data2.volumeInfo.title;
		let authors2 = data2.volumeInfo.authors;
		let categories2 = data2.volumeInfo.categories;
		book2 = new Book(title2, authors2, id2, categories2, 'I say blah blah bleh.');
		user3.addLikedBook(book2);
		
		let features = user3.feats;
		assert.equal(features[0][1], 5);
		assert.equal(features[1][1], 2);
		assert.equal(features[2][1], 1);
	});
});