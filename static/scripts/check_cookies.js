async function check_session_cookie(is_on_login_page){


	if(!document.cookie && !is_on_login_page){
		window.location.href = "/"
		return
	}

	let session_cookie = document.cookie.split(";").filter(c => {

		let cookie = c.split("=")[0]
		
		if(cookie == "session"){
			return c.split("=")[1].split(";")[0]
		}
	})

	if(session_cookie.length < 1 && !is_on_login_page){
		window.location.href = "/"
	}

	session_cookie = session_cookie[0]


	
	let response = await fetch("/login/session", {
		method : "POST"
	}).then(res => res.json())

	console.log(response)

	if(response.success && is_on_login_page){


		window.location.href = "/home"

	}

	if(response.error && !is_on_login_page){
		window.location.href = "/"
	}


	
}
