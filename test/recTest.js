const assert = require('chai').assert;
const User = require('../user').User;
const Book = require('../book').Book;
const r = require('../rec');
const Rec = r.Rec;
const fetch = require('node-fetch');

describe('Rec', function() {
	it('Features should be reduced', function(){
		let a = new Book('a', 'a', 'a', ['fiction'], 'I say blah blah blah. Say blah, help Jim build new dog house.');
		let b = new Book('b', 'b', 'b', ['fiction'], 'I say blah blah blah fool. Build dog new house. Blah.');
		let user = new User('Bill', 'a');
		user.addLikedBook(a);
		user.addLikedBook(b);
		
		let r = new Rec(user);
		
		assert.equal(user.feats.length, 9);
		assert.equal(r.reducedFeats.length, 7); //dropped 2 features
	});
	
	it('Given a series of features from a user, the query for books should give a non-zero list of books', async function(){
		let book = new Book('b','b','b', ['fiction'], 'To infinity and beyond.');
		let user = new User('Bill', 'a');
		user.addLikedBook(book);
		
		let rObj = await new Rec(user);
		let g = await rObj.genres;
		let search = await r.getPossBooks(rObj.reducedFeats, rObj.likedBooks, rObj.dislikedBooks, rObj.genres);
		assert.exists(search);
		assert.notEqual(search.size, 0);
	});
	
	it('Given two lists of keywords with normalized frequencies the cosine func should return a rating', function(){
		let arr1 = [['a', 0.5], ['b', 0.25], ['d', 0.15], ['f', 0.1]];
		let arr2 = [['a', 0.6], ['b', 0.15], ['c', 0.15], ['e', 0.1]];
		let arr3 = [['w', 0.6], ['x', 0.15], ['y', 0.15], ['z', 0.1]];
		let arr4 = [['a', 0.1], ['b', 0.9]];
		
		assert.equal(r.cosFunc(arr1, arr2), 0.9761870601839526);
		assert.equal(r.cosFunc(arr1, arr3), 0);
		assert.equal(r.cosFunc(arr2, arr4), 0.3481865296036271);
	});
});