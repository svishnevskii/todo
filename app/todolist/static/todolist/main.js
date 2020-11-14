document.addEventListener('DOMContentLoaded', () => {

    load_tasks()
    let task_input = document.querySelector('#task-input')
    task_input.addEventListener('keyup', (e) => {
        if (e.keyCode == 13){
            add_task(task_input.value)
            task_input.value = ''
        }
    })
    $('#joinTeamModal').on('hidden.bs.modal', function (e) {
        document.querySelector(`#join-errors`).innerHTML = ''
    })
    
})

// Load tasks view
function load_tasks(){

    let tasks_link = document.querySelector('#tasks-link')
    document.querySelector('#tasks-view').style.display = 'block'
    document.querySelector('#teams-view').style.display = 'none'

    tasks_link.style.borderBottom = '3px solid #00bfa5'
    document.querySelector('#teams-link').style.borderBottom = '3px solid transparent'
    
   
}

// Load teams view
function load_teams(){
    fetch('/teams')
    .then( resp => resp.json())
    .then( resp => {
        document.querySelector('#teams-container').innerHTML = ''
        resp.teams.forEach(team => {
            render_team(team, resp.actual_user)
            
        });
    })
    document.querySelector('#tasks-view').style.display = 'none'
    document.querySelector('#teams-view').style.display = 'block'
    document.querySelector('#teams-link').style.borderBottom = '3px solid #00bfa5'
    document.querySelector('#tasks-link').style.borderBottom = '3px solid transparent'
}

// Adds teams to the view
function render_team(team, actual_user) {
    let members = "<ul>"
    team.members.forEach( member => {
        if (team.owner == actual_user){
            members += `<li id = "member${member.id}">
                            <div>
                                <span>${member.user}</span>
                                <button class = "btn btn-link" type = "button" onclick = "display_taskModal(${team.id}, ${member.id})">
                                    Add Task
                                </button>
                            </div>                            
                        </li>`            
        }else{
            members += `<li id = "member${member.id}">${member.user}</li>`
        }
    })
    members += "</ul>"
    let element = document.createElement('div')
    element.innerHTML = `<div class="card-body">
        <h5 class="card-title">${team.name}</h5>
        <h6 class="card-subtitle mb-2 text-muted">Admin: ${team.owner} </h6>
        <h6 class="card-subtitle mb-2 text-muted">Code: ${team.code} </h6>
        <p class="card-text">${team.description}</p>
        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${team.id}" aria-expanded="true" aria-controls="collapseOne">
            Members
        </button>
        <div class="spinner-grow text-primary spinner-grow-sm" role="status" id = "leave-spinner${team.id}" style = "display: none">
            <span class="sr-only">Loading...</span>
        </div>
        <button class = "btn btn-link" type = "button" onclick = "leave_team(${team.id})" id = "leave-button${team.id}">
            Leave Team
        </button>
        <div id="collapse${team.id}" class="collapse" aria-labelledby="headingOne" data-parent="#team${team.id}">
            <div class="card-body">
                ${members}
            </div>
        </div>
    </div>`
    element.classList.add('card') 
    element.id = `team${team.id}`                   
    element.style.width = '100%'
    document.querySelector('#teams-container').append(element)
}

// Add a new task
function add_task(task_body){
   
    if (task_body.length > 0){
        fetch('/add_task', {
            method: 'POST',
            body: JSON.stringify({
                body: task_body
            })
        })
        .then( resp => resp.json())
        .then( task => {
            let element = document.createElement('div')
            element.innerHTML = `
                <div class = "form-check">
                    <input type="checkbox" class="form-check-input" id=${task.id} style="margin-right: 10px;">                   
                    <input type="text" value="${task_body}" class="edit-task" id = "edit-task${task.id}" onkeyup="edit_task(event,${task.id})">
                </div>
                <i class="fas fa-trash-alt text-danger" style="cursor: pointer;" onclick = "delete_task(${task.id})" id = "trash${task.id}"></i>
                <div class="spinner-grow text-danger spinner-grow-sm" role="status" id = "trash-spinner${task.id}" style="display: none;">
                    <span class="sr-only">Loading...</span>
                </div>
            `
            element.classList.add("task")
            element.id = `task${task.id}`
            document.querySelector('#tasks-container').append(element)
        })
    }
}

// Applies check action
function check(id){
    fetch(`check/${id}`, {
        method: "PUT"
    })
    
}

// Delete a task
function delete_task(id){
    document.querySelector(`#trash${id}`).style.display = 'none'
    document.querySelector(`#trash-spinner${id}`).style.display = 'inline-block'

    fetch(`delete/${id}`, {
        method : "DELETE"
    })
    .then(resp => resp.json())
    .then(resp => {
        if (resp.ok){   
            document.querySelector(`#task${id}`).remove()
        }
        
    })
}

// Edit a task
function edit_task(e,id){
    if (e.keyCode == 13 || e == 'f'){
        body = document.querySelector(`#edit-task${id}`).value
        if (body.length > 0){
            fetch(`edit_task/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    body
                })
            })
            
        }
    }
}

// Create a new team
function create_team(){
    let name = document.querySelector('#team-input').value
    let desc = document.querySelector('#team-description').value
    document.querySelector('#team-input').value = ''
    document.querySelector('#team-description').value = ''
    if (name.length > 0){
        document.querySelector('#create-buttons').style.display = 'none'
        document.querySelector('#create-spinner').style.display = 'flex'
        fetch('/create_team', {
            method: "POST",
            body: JSON.stringify({
                name,
                desc
            })
        })
        .then( resp => resp.json())
        .then( team => {
            $('#createTeamModal').modal('hide')
            document.querySelector('#create-buttons').style.display = 'block'
            document.querySelector('#create-spinner').style.display = 'none'
            render_team(team,team.owner)
        })
    }
}

// Leave the team
function leave_team(id){
    document.querySelector(`#leave-button${id}`).style.display = 'none'
    document.querySelector(`#leave-spinner${id}`).style.display = 'inline-block'
    
    fetch(`leave_team/${id}`)
    .then(resp => resp.json())
    .then(resp => {
        if(resp.ok){

            document.querySelector(`#team${id}`).remove()
        }
    })
    
}

// Join a team
function join_team(){

    let code = document.querySelector('#code-input').value
    document.querySelector('#code-input').value = ''
    if (isNaN(parseInt(code))){
        document.querySelector(`#join-errors`).innerHTML = ''
        const element = document.createElement('div')
        element.classList.add('alert')
        element.classList.add('alert-danger')
        element.setAttribute('role','alert')
        element.innerHTML = "The code must be a number"
        document.querySelector(`#join-errors`).append(element)
    }else{
        if(code.length > 0){
            document.querySelector('#join-buttons').style.display = 'none'
            document.querySelector('#join-spinner').style.display = 'block'
            fetch('/join_team',{
                method : "POST",
                body: JSON.stringify({
                    code
                })
            })
            .then( resp => resp.json())
            .then( resp => {
                document.querySelector('#join-buttons').style.display = 'block'
                document.querySelector('#join-spinner').style.display = 'none'
                if(resp.ok){
    
                    render_team(resp.team)
                    $('#joinTeamModal').modal('hide')
                }else{
                    document.querySelector(`#join-errors`).innerHTML = ''
                    const element = document.createElement('div')
                    element.classList.add('alert')
                    element.classList.add('alert-danger')
                    element.setAttribute('role','alert')
                    element.innerHTML = resp.message
                    document.querySelector(`#join-errors`).append(element)
                }
            })
        }
    }
}


// Display modal to add team task
function display_taskModal(team_id, user_id){

    document.querySelector("#task-team-input").value = ''
    document.querySelector("#task-team-input").setAttribute('team_id',team_id)
    document.querySelector("#task-team-input").setAttribute('user_id',user_id)
    $('#taskTeamModal').modal('show')

}

// Add a new team task
function add_taskTeam(){
    const task_teamInput = document.querySelector("#task-team-input")
    let team_id = task_teamInput.getAttribute('team_id')
    let user_id = task_teamInput.getAttribute('user_id')
    let body = task_teamInput.value
    if (body.length > 0) {
        document.querySelector('#add-buttons').style.display = 'none'
        document.querySelector('#add-spinner').style.display = 'block'
        fetch('/add_team_task', {
            method: 'POST',
            body : JSON.stringify({
                team_id,
                user_id,
                body
            })
        })
        .then( resp => resp.json())
        .then( resp => {
            document.querySelector('#add-buttons').style.display = 'block'
            document.querySelector('#add-spinner').style.display = 'none'
            if (user_id == resp.owner_id) {
                let element = document.createElement('div')
                element.innerHTML = `
                    <div class = "form-check">
                        <input type="checkbox" class="form-check-input" id="${resp.task.id}" style="margin-right: 10px;">                   
                        <div style="display: flex; gap: 10px; align-items: flex-start;">         
                                <span style="color: green;">${resp.task.team}: </span>
                                <input type="text" value="${resp.task.body}"  disabled class="edit-task" id = "edit-task${resp.task.id}" onkeyup="edit_task(event,${resp.task.id})" onfocusout="edit_task('f',${resp.task.id})">                    
                        </div>
                    </div>
                    <i class="fas fa-trash-alt text-danger" style="cursor: pointer;" onclick = "delete_task(${resp.task.id})" id = "trash${resp.task.id}"></i>
                    <div class="spinner-grow text-danger spinner-grow-sm" role="status" id = "trash-spinner${resp.task.id}" style="display: none;">
                        <span class="sr-only">Loading...</span>
                    </div>
                `
                element.classList.add("task")
                element.id = `task${resp.task.id}`
                document.querySelector('#tasks-container').append(element)
            }
            $('#taskTeamModal').modal('hide')
        })
      
    }
}

// Event that allows submit the team task modal info by pressing enter
document.querySelector('#taskTeamModal').addEventListener( 'keyup', (e) => {
    if (e.keyCode == 13){
        add_taskTeam()
    }
})

// Event that allows submit the create team modal info by pressing enter
document.querySelector('#createTeamModal').addEventListener( 'keyup', (e) => {
    if (e.keyCode == 13){
        create_team()
    }
})

// Event that allows submit the join team modal info by pressing enter
document.querySelector('#joinTeamModal').addEventListener( 'keyup', (e) => {
    if (e.keyCode == 13){
        join_team()
    }
})


