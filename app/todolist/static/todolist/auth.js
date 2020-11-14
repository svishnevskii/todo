

document.addEventListener('DOMContentLoaded', () => {
    load_login()
})

function load_login() {
    document.querySelector(`#errors`).innerHTML = ''
    document.querySelector('#login-link').classList.add('active')
    document.querySelector('#register-link').classList.remove('active')
    document.querySelector('#register-form').style.display = 'none'
    document.querySelector('#login-form').style.display = 'flex'
}

function load_register(){
    document.querySelector(`#errors`).innerHTML = ''
    document.querySelector('#register-link').classList.add('active')
    document.querySelector('#login-link').classList.remove('active')
    document.querySelector('#register-form').style.display = 'flex'
    document.querySelector('#login-form').style.display = 'none'
}

function register(e){
    e.preventDefault()
    const username = document.querySelector('#username1').value
    const email = document.querySelector('#email1').value
    const password = document.querySelector('#password1').value
    const confirmation = document.querySelector('#confirmation').value
    let errors = []
    const email_regex = /^.+@\w+\.\w{2,3}/i
    
    !email_regex.test(email) ? errors.push('Enter a valid email') : true
    username.length == 0 || email.length == 0 || password.length == 0 || confirmation == 0? errors.push('All fields are required') : false
    if (errors.length > 0){
        display_errors(errors)
    }else{
        document.querySelector('#register-submit-button').style.display = 'none'
        document.querySelector('#spinner-register').style.display = 'flex'
        fetch("/register",{
            method : 'POST',
            body: JSON.stringify({
                username,
                email,
                password,
                confirmation
            })
        })
        .then( resp => resp.json())
        .then( resp => {
            document.querySelector('#register-submit-button').style.display = 'block'
            document.querySelector('#spinner-register').style.display = 'none'
            if (resp.ok){
                load_login()
            }else{
                display_errors([resp.message])
            }
        })
    }
}

function login(e){
    e.preventDefault()
    const username = document.querySelector("#username").value
    const password = document.querySelector("#password").value
    let errors = []
    username.length == 0 ? errors.push("Username is required") : false
    password.length == 0 ? errors.push("Password is required") : false
    if (errors.length > 0){
        display_errors(errors)
    }else{
        document.querySelector('#submit-button').style.display = 'none'
        document.querySelector('#spinner').style.display = 'flex'
        fetch("/login",{
            method: "POST",
            body : JSON.stringify({
                username,
                password
            })
        })
        .then( resp => resp.json())
        .then( resp => {
            console.log("hol");
            document.querySelector('#submit-button').style.display = 'block'
            document.querySelector('#spinner').style.display = 'none'
            if (resp.ok){
    
                let url = window.location.href
                window.location.href = `${url}main`
                document.querySelector('#auth').style.display = 'none'
                document.querySelector('#main').style.display = 'block'
            }else{
                display_errors([resp.message])
            }
    
        })
    }
        
}
function display_errors(errors){
    document.querySelector(`#errors`).innerHTML = ''
    errors.forEach( error => {
        const element = document.createElement('div')
        element.classList.add('alert')
        element.classList.add('alert-danger')
        element.setAttribute('role','alert')
        element.innerHTML = error
        document.querySelector(`#errors`).append(element)
    })
}