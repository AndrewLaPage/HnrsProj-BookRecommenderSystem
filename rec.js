const fetch = require('node-fetch');
require('dotenv').config();
const API_KEY = process.env.API_KEY;

class Rec{
	constructor(user) {
		this.likedBooks = user.likedBooks;
		this.genres = user.likedGenres;
		this.dislikedBooks = user.dislikedBooks;
		this.feats = [];
		
		//Copy user features over
		for(let i = 0; i <user.feats.length; i++){
			this.feats.push(user.feats[i].slice());
		}
		
		this.reducedFeats = reduceFeatures(this.feats);
	}
	
	/**
	*  Determines five recommendations for the user based on their liked books.
	*/
	async getRecommendation(){
		console.log('Acquiring possible recommendations...');
		let books = await getPossBooks(this.reducedFeats, this.likedBooks, this.dislikedBooks, this.genres);
		console.log('Possible recommendations acquired...');
		//console.log(books);
		let ratedBooks = [];
		
		//Get rating for books
		if(books !== null){
			console.log('Calculating ratings of possible recommendations...');
			books.forEach(book => {
				//console.log(book);
				let rating = 0;
				if(typeof book.volumeInfo.description !== 'undefined'){
					let keyWords = extractKeyWords(book.volumeInfo.description);
					let normWords = normalizeKeyWords(keyWords);
					//console.log('Getting rating for: ' + book.volumeInfo.title)
					let rating = getRating(normWords, this.likedBooks);
					//console.log(rating)
					ratedBooks.push([book, rating]);
				} else { 
					//no description to compare, thus not included for recommendations
				}
			});
			
			//Sort by rating
			ratedBooks.sort(function(a,b) {
				return b[1]-a[1];
			});
			console.log('Recommendation ratings calculated...');
			//console.log(ratedBooks);
			
			//Return books
			if(ratedBooks.length > 5){
				let recommendations = []
				for(let i = 0; i < 5; i++){
					recommendations.push(ratedBooks[i]);
				}
				console.log('Returning top 5 recommendations...');
				return recommendations;
			} else { //less than 5 recommendations in rated books
				console.log('Returning ' + ratedBooks.length + ' recommendations...');
				return ratedBooks;
			}
		} else {
			return null;
		}
	}
}

//Helper functions!

/**
* Using the reduced features this function gathers a set of books using those features as query terms.
*/
async function getPossBooks(feats, lbooks, dbooks, genres){
	if(feats.length > 0){ //feats not empty
		let pbooks = [];
		for(let i = 0; i < feats.length; i++){
			for(let g of genres){
				//Query Google Books utilizing the reducedFeatFeats
				let url = ''
				if(g != null){
					url = 'https://www.googleapis.com/books/v1/volumes?q=' + feats[i][0].trim() + '+subject:' + g +'&langRestrict=en&printType=books&maxResults=15';
				} else {
					url = 'https://www.googleapis.com/books/v1/volumes?q=' + feats[i][0].trim() + '&langRestrict=en&printType=books&maxResults=15';
				}
				//console.log(encodeURI(url));
				let res = await fetch(encodeURI(url));
				let data = await res.json();
				let {items} = data;
				//console.log(data);

				//Add book to set of books if it isn't contained in likedBooks or dislikedBooks
				if(typeof items !== 'undefined'){
					for(let j = 0; j < items.length; j++){
						if(!isInUserProfile(items[j].id, lbooks, dbooks) && !isMemberOf(items[j].id, pbooks)){
							pbooks.push(items[j]);
						}
					}
				}
			}
		}
		return pbooks;
	} else {
		return null;
	}
}

/**
*  Using cosine similarity helper func, get a range of ratings for the target book and liked books. Return the average of these ratings. 
*/
function getRating(keyWords, lbooks){
	let ratings = [];
	for(let i = 0; i < lbooks.length; i++){
		let likedWords = normalizeKeyWords(lbooks[i].keyWords);
		ratings.push(cosFunc(keyWords, likedWords));
	}
	
	let sum = 0;
	for(let i = 0; i < ratings.length; i++){
		sum = sum + ratings[i];
	}
	let avg = sum/ratings.length;
	return avg;
}

/**
*  Given to arrays of normalized keywords, compare the two lists using cosine similarity function to get the rating
*/
function cosFunc(a, b){
	let abSum = 0;
	let aSqSum = 0;
	let bSqSum = 0;
	
	let bCount = 0;
	for(let i = 0; i < a.length; i++){
		while(b[bCount][0].localeCompare(a[i][0]) < 0){
			bCount = bCount+1;
			if(bCount >= b.length){
				break;
			}
		}
		if(bCount < b.length){
			if(a[i][0] == b[bCount][0]){
				abSum = abSum + (a[i][1]*b[bCount][1]);
				aSqSum = aSqSum + (a[i][1]*a[i][1]);
				bSqSum = bSqSum + (b[bCount][1]*b[bCount][1]);
				bCount = bCount+1;
				if(bCount >= b.length){
					break;
				}
			}
		} else {
			break;
		}
	}
	let rDen = Math.sqrt(aSqSum)*Math.sqrt(bSqSum);
	let rating = 0;
	if(rDen != 0) { //Prevents divide by zero error in case of no common key words
		rating = abSum/rDen;
	}
	//console.log(rating)
	return rating
}

/**
*  Given a list of features, reduce the list down to the top 80% (adjust if needed) and normalize the values of the features.
*/
function reduceFeatures(feats){
	let redFeats = [];
	if(feats.length > 0){ //feats is not empty
		let totalFreq = 0;
		for(let i = 0; i < feats.length; i++){
			totalFreq = totalFreq + feats[i][1];
		}
		let count = 0;
		let index = 0;
		for(let i = 0; i < feats.length; i++){
			if(count < (totalFreq*0.8)){ //limits number of queries to top 80% of features
				count = count + feats[i][1];
				index = i; //for special cases where else section is not reached
			} else {
				index = i;
				break;
			}
		}
		
		//Add features
		for(let i = 0; i < index+1; i++){
			let reducedFeat = feats[i].slice();
			redFeats.push(reducedFeat);
		}
	}
	return redFeats;
}

/**
* Checks to see if a given book is in the user profile
*/
function isInUserProfile(bookID, lBooks, dBooks){
	 //Check for book in liked books
	let inLikedBooks = isMemberOf(bookID, lBooks);
	
	 //Check for book in disliked books
	let inDislikedBooks = isMemberOf(bookID, dBooks);

	if(inLikedBooks === true && inDislikedBooks === true){
		return true;
	} else {
		return false;  //book not in user profile
	}
}

function isMemberOf(id, list){
	let inList = false;
	if(typeof list !== 'undefined'){
		for(let i = 0; i < list.length; i++){
			if(list[i].id == id){
				inList = true;
				break;
			}
		}
	}
	return inList;
}

/**
*  Given a list of words and their frequencies [word, freq], normalize that frequency
*/
function normalizeKeyWords(words) {
	let totalFreq = 0;
	let normWords = []
	for(let i = 0; i < words.length; i++){
		totalFreq = totalFreq + words[i][1];
	}
	
	for(let i = 0; i < words.length; i++){
		normWord = words[i].slice();
		normWord[1] = normWord[1]/totalFreq;
		normWords.push(normWord);
	}
	
	normWords.sort(function(a,b) {
		return ('' + a[0]).localeCompare(b[0]);
	});
	
	return normWords;
}

/**
*  Given a string of text, this function will remove punctuation and HTML tags and return a list of words and their frequencies in the string of text
*/
function extractKeyWords(str){
	const stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there'd","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves","#1","bestselling"];
	
	//Create an array of words without HTML tags or Em dashes
	let temp = str.split(" ").join(',').split('.').join(',').split('<br>').join(',').split('<b>').join(',').split('</b>').join(',').split('<i>').join(',').split('</i>').join(',').split('—').join(',').split('<p>').join(',').split('</p>').join(',').split('/').join(',').split('•').join(',').split(" ").join(',').split(',');

	//Remove punctuation
	for(let i = 0; i < temp.length; i++){
		temp[i] = temp[i].toLowerCase();
		temp[i] = temp[i].trim();
		temp[i] = temp[i].split('.').join('');
		temp[i] = temp[i].split(',').join('');
		temp[i] = temp[i].split('"').join('');
		temp[i] = temp[i].split('!').join('');
		temp[i] = temp[i].split('?').join('');
		temp[i] = temp[i].split('(').join('');
		temp[i] = temp[i].split(')').join('');
		temp[i] = temp[i].split('{').join('');
		temp[i] = temp[i].split('}').join('');
		temp[i] = temp[i].split(':').join('');
		temp[i] = temp[i].split(';').join('');
		temp[i] = temp[i].split('“').join('');
		temp[i] = temp[i].split('”').join('');
		temp[i] = temp[i].split('’s').join(''); //Gets rid of possessive
		temp[i] = temp[i].split("'s").join(''); //Gets rid of possessive
		temp[i] = temp[i].split('’').join("'");  //For contractions (stop words)
		if(stopwords.includes(temp[i])){
			//console.log(temp[i]);
			temp[i] = '';
			//console.log(temp[i]);
		}
	}
	temp = temp.filter(Boolean);
	//console.log(temp);
	let keyObj = {};
	temp.forEach(function(value, index) { keyObj[value] = (keyObj[value]||0)+1;});
	//console.log(keyWords);
	let keyWords = [];
	for(let key in keyObj){
		let keyWord = [key, keyObj[key]];
		keyWords.push(keyWord);
		//console.log(keyWord);
	}
	keyWords.sort(function(a,b) {
		return ('' + a[0]).localeCompare(b[0]);
	});
	//console.log(keyWords);
	return keyWords;
}

module.exports = { Rec, getPossBooks, cosFunc }