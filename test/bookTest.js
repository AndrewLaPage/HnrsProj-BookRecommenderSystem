const assert = require('chai').assert;
const book = require('../book');
const Book = book.Book;
const fetch = require('node-fetch');

require('dotenv').config();
const API_KEY = process.env.API_KEY;

//contruct book object using fetch call to Google Books API
//Test that constructor works properly
//Test methods of the Book class
describe('Book', function(){
	//const testBook = new Book('The Name of The Wind',  'Patrick Rothfuss', 'BcG2dVRXKukC')
	async function retrieveBook(){
		const res = await fetch('https://www.googleapis.com/books/v1/volumes/BcG2dVRXKukC?key=' + API_KEY);
		const data = await res.json();
		const {id} = data;
		const {title, authors, categories} = data.volumeInfo;
		const desc = 'I say blah blah blah.';
		ret = new Book(title, authors, id, categories, desc);
		return ret;
	}
	
	//grouped due to aync nature and having to instantiate objects within
	it("Book title should be 'The Name of The Wind', author should be Patrick Rothfuss, and ID should be BcG2dVRXKukC", async function(){
		const testBook = await retrieveBook();
		assert.equal(testBook.title.toLowerCase(), 'the name of the wind');
		assert.equal(testBook.authors[0].toLowerCase(), 'patrick rothfuss');
		assert.equal(testBook.id, 'BcG2dVRXKukC'); //Case sensitive!
	});
	
	it("Book should have 3 'blah' key words and 1 'say' key words", async function(){
		const testBook = await retrieveBook();
		assert.equal(testBook.keyWords[0][1], '3');
		assert.equal(testBook.keyWords[1][1], '1');
	});
});