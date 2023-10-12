/**
*  Redirects user to profile page
*/
function gotoProfile(){
	console.log('redirecting to profile page');
	location.href = 'http://localhost:3000/profile.html';
}

/**
*  Gets server to calculate recommendation and then displays up to five recommendations
*/
async function getRec(){
	let button = document.getElementById('getRecommendation');
	button.disabled = true;
	let user = JSON.parse(localStorage.getItem('currUser'));
	console.log(user);
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({user})
	};
	let res = await fetch('/getRec', options);
	let data = await res.json();
	console.log(data);
	
	//Display book covers and link to pages
	let recs = data.recommendations;
	let p = document.createElement("p");
	for(r of recs){
		console.log(r);
		let link = document.createElement("a");
		link.href = r[0].volumeInfo.canonicalVolumeLink;
		link.target = "_blank";
		try{
			let img = document.createElement("img");
			img.setAttribute("src", r[0].volumeInfo.imageLinks.thumbnail);
			link.appendChild(img);
		} catch(err) {
			console.log("Book has no cover image")
			link.innerHTML = r[0].volumeInfo.title;
		}
		p.appendChild(link);
		p.appendChild(document.createElement("br"))
	}
	let e = document.getElementById("div1");
	e.appendChild(p);
	button.disabled = false;
}