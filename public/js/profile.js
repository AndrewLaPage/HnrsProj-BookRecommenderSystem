/**
*  Sets fields to the info from the user profile
*/
function loadUser() {
	let user = JSON.parse(localStorage.getItem('currUser')); //get saved user info
	console.log(user);
	document.getElementById('nameBox').value = user.name;
	let likedTextArea = document.getElementById('likedBookList');
	for(book of user.likedBooks){
		likedTextArea.value = likedTextArea.value + JSON.stringify(book) + '\r\n';
	}
	document.getElementById('genreList').value = user.genres;
	let dislikedTextArea = document.getElementById('dislikedBookList');
	for(book of user.dislikedBooks){
		dislikedTextArea.value = dislikedTextArea.value + JSON.stringify(book) + '\r\n';
	}
}

/**
*  Redirects user to login page
*/
function gotoLogin(){
	localStorage.clear(); //remove saved user info
	location.href = 'http://localhost:3000/login.html';
}

/**
*  Gets and up to date user profile (in case of updates) and passes it to the recommendation page
*/
async function gotoRecommend(){
	let userName = JSON.parse(localStorage.getItem('currUser')).name;
	let password = JSON.parse(localStorage.getItem('currUser')).password; //get saved user info
	localStorage.clear(); //remove saved user info
	//console.log(userName);
	const options = { //get updated user
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({userName, password})
	};
	let res = await fetch('/getProfile', options);
	let data = await res.json();
	let user = data.user;
	console.log(user);
	localStorage.setItem('currUser', JSON.stringify(user));
	location.href = 'http://localhost:3000/recommend.html';
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
				if(typeof data.book.genres !== 'undefined'){
					for(let i = 0; i < data.book.genres.length; i++){
						if(genreArea.value.includes(data.book.genres[i].split('/')[1].split('&')[0].trim()) !== true){
							if(genreArea.value !== ''){
								genreArea.value = genreArea.value + ',' + (data.book.genres[i].split('/')[1].split('&')[0].trim());
							} else {
								genreArea.value = ''  + (data.book.genres[i].split('/')[1].split('&')[0].trim());
							}
						}
					}
				}
				
				//Update User Profile
				let g = document.getElementById('genreList').value.split(',');
				const options2 = {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						userName: document.getElementById('nameBox').value, 
						book: data.book,
						genres: g
					})
				};
				let res = await fetch('/updateLikedBooks', options2);
				let data2 = await res.json();
				console.log(data);
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
				
				//Update User Profile
				const options2 = {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						userName: document.getElementById('nameBox').value, 
						book: data.book
					})
				};
				let res = await fetch('/updateLikedBooks', options2);
				let data2 = await res.json();
				console.log(data);
			} else {
				alert('Book with that ID already exists in either Liked Books or Disliked Books');
			}
		} else {
			alert('Book with that ID not found\nPlease ensure that the ID is correct and try again');
		}
	}
}