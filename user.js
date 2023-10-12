class User {
	constructor(name, password){
		this.name = name;
		this.password = password;
		this.likedBooks = [];
		this.likedGenres = [];
		this.dislikedBooks = [];
		this.feats = [];
	}
	
	//Add book functions
	/**
	*   Adds a book to a user's list of liked books and updates user features accordingly
	*/
	addLikedBook(book){
		this.likedBooks.push(book);
		this.likedGenres.push(book.genres);
		let keyWords = book.keyWords;
		if(this.feats.length == 0){ //no features
			for(let i = 0; i <keyWords.length; i++){
				this.feats.push(keyWords[i].slice());
			}
		} else {
			for(let i = 0; i < keyWords.length; i++){
				let keyWordExists = false;
				for(let j = 0; j < this.feats.length; j++){
					if(keyWords[i][0] == this.feats[j][0]){ //Key word is in features
						this.feats[j][1] = this.feats[j][1] + keyWords[i][1];  //Increase frequency of feature
						keyWordExists = true;
					}
				}
				if(keyWordExists == false){ //Key word not in features
					this.feats.push(keyWords[i]);
				}
			}
		}
		
		//console.log(this.feats);
		this.feats.sort(function(a,b) {
			return b[1]-a[1];
		});
	}
	
	/**
	*   Adds a book to a user's list of disliked books
	*/
	addDislikedBook(book){
		this.dislikedBooks.push(book);
	}
}

module.exports = { User }