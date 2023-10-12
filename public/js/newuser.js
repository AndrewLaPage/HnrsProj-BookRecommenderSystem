/**
*  Redirects user to login page
*/
function gotoLogin(){
	console.log('redirecting to new user page');
	location.href = 'http://localhost:3000/login.html';
}


/**
*  Given a bookID this will query the server for that ID and if it exists, it will be entered into the textbox
*/
async function addLikedBook(){
	if(document.getElementById('likedBookBox').value.trim() !== ""){
		console.log('Entering function')
	
		//Get book id
		let bookID = document.getElementById('likedBookBox').value.trim();
		console.log(bookID);
		console.log(JSON.stringify(bookID));
		
		//Get book obj
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({bookID})
		};
		let res = await fetch('/bookID', options);
		let data = await res.json();
		console.log(data);
		
		//Add book to text area
		if (data.status === 'success'){
			let textArea = document.getElementById('likedBookList');
			let genreArea = document.getElementById('genreList');
			if(textArea.value.includes(data.book.id) !== true && document.getElementById('dislikedBookList').value.includes(data.book.id) !== true) {
				textArea.value = textArea.value + JSON.stringify(data.book) + '\r\n';
				document.getElementById('likedBookBox').value = '';
				for(let i = 0; i < data.book.genres.length; i++){
					if(genreArea.value.includes(data.book.genres[i].split('/')[1].split('&')[0].trim()) !== true){
						if(genreArea.value !== ''){
							genreArea.value = genreArea.value + ',' + (data.book.genres[i].split('/')[1].split('&')[0].trim());
						} else {
							genreArea.value = ''  + (data.book.genres[i].split('/')[1].split('&')[0].trim());
						}
					}
				}
			} else {
				alert('Book with that ID already exists in either Liked Books or Disliked Books');
			}
		} else {
			alert('Book with that ID not found\nPlease ensure that the ID is correct and try again');
		}
	}
}

/**
*  Given a bookID this will query the server for that ID and if it exists, it will be entered into the textbox
*/
async function addDislikedBook(){
	if(document.getElementById('dislikedBookBox').value.trim() !== ""){
		console.log('Entering function')
	
		//Get book id
		let bookID = document.getElementById('dislikedBookBox').value.trim();
		console.log(bookID);
		console.log(JSON.stringify(bookID));
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({bookID})
		};
		
		//Get book obj
		let res = await fetch('/bookID', options);
		let data = await res.json();
		console.log(data);
		
		//Add book to text area => need to make this unique (i.e. no duplicates)
			//Try array in this file
		if (data.status === 'success'){
			let textArea = document.getElementById('dislikedBookList');
			if(textArea.value.includes(data.book.id) !== true && document.getElementById('likedBookList').value.includes(data.book.id) !== true) {
				textArea.value = textArea.value + JSON.stringify(data.book) + '\r\n';
				document.getElementById('dislikedBookBox').value = '';
			} else {
				alert('Book with that ID already exists in either Liked Books or Disliked Books');
			}
		} else {
			alert('Book with that ID not found\nPlease ensure that the ID is correct and try again');
		}
	}
}

/**
*  Send input to server to add user to database
*/
async function addUser(){
	if(document.getElementById('nameBox').value.trim() !== "" || document.getElementById('passBox').value.trim() !== ""){
		console.log('Adding user to DB');
		let name = document.getElementById('nameBox').value.trim();
		let password = document.getElementById('passBox').value.trim();
		let likedBooks = document.getElementById('likedBookList').value.split('\n').filter(Boolean); //Splits textArea into an array of books
		let genres = document.getElementById('genreList').value.split(',');
		let dislikedBooks = document.getElementById('dislikedBookList').value.split('\n').filter(Boolean);
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({name, password, likedBooks, genres, dislikedBooks})
		}
		let res = await fetch('/newUser', options);
		let data = await res.json();
		let status = data.status;
		if(status === 'success'){
			location.href = 'http://localhost:3000/login.html';
		} else if (status === 'exists'){
			alert('User with that name already exists');
		} else	{ //critical error
			alert('Unforeseen error! Try again.\nIf error persists reload page and re-enter data.\nIf all else fails reload users.db')
		}
	} else {
		console.log('Could not add user to DB');
		if(document.getElementById('nameBox').value.trim() !== ""){
			alert("'Full Name' cannot be left blank");
		} else {
			alert("'Password' cannot be left blank");
		}
	}
}