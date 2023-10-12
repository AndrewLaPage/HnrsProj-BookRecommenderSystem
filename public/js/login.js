/**
*  Redirects user to new user page
*/
function gotoNewUser(){
	console.log('redirecting to new user page');
	location.href = 'http://localhost:3000/newuser.html';
}

/**
*  Get user names from server and add them to the drop down menu
*/
async function populateUsers() {
	let res = await fetch('getUsers');
	let data = await res.json();
	let names = data.names;
	console.log(names);
	if(names.length === 0){
		document.getElementById('selectUser').disabled = true;
	} else {
		document.getElementById('selectUser').disabled = false;
		for(name of names){
			addUser(name);
		}
	}
}

/**
*  Helper function for populate users that adds the name to the drop down menu
*/
function addUser(name) {
	let userSelection = document.getElementById('users');
	let option = document.createElement("option");
	option.text = name;
	userSelection.add(option);
}

/**
*  Gets user profile of given name and passes it to the profile page
*/
async function selectUser(){
	userName = document.getElementById('users').value;
	password = document.getElementById('passBox').value;
	console.log(userName);
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({userName, password})
	};
	let res = await fetch('/getProfile', options);
	let data = await res.json();
	if(data.status === 'success'){
		let user = data.user;
		//console.log(user);
		localStorage.setItem('currUser', JSON.stringify(user));
		location.href = 'http://localhost:3000/profile.html';
	} else {
		alert('Incorrect username or password. Please verify and try again.');
	}
}