class Book{
	constructor(title, authors, id, genres, desc){
		this.title = title;
		this.authors = authors;
		this.id = id;
		this.genres = genres;
		this.keyWords = extractKeyWords(desc);
	}
}

/**
*  Given a string of text, this function will remove punctuation and HTML tags and return a list of words and their frequencies in the string of text
*/
function extractKeyWords(str){
	const stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves","#1","bestselling"];
	
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
		temp[i] = temp[i].split('’').join("'");  //For contractions (stop words)
		temp[i] = temp[i].split("'s").join(''); //Gets rid of possessive
		temp[i] = temp[i].split("'d").join(''); //Gets rid of contraction

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

module.exports = { Book }