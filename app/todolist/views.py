from django.shortcuts import render
import json
import random
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from .models import User, Task, Team, Team_User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required




def index(request):
    
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('main'))
    else:    
        return render(request,'todolist/auth.html')

# User sign in
@csrf_exempt
def login_view(request):

    if request.method == "POST":

        # Attempt to sign user in
        data = json.loads(request.body)
        username = data["username"]
        password = data["password"]    
        user = authenticate(request, username = username, password = password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return JsonResponse({"ok" : True, "username" : username})
        else:
            return JsonResponse({"ok": False, "message": "Invalid Username or Password"}) 

    else:
        return JsonResponse({"ok" : False, "message": "method must be post"})           

# User logout
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


@csrf_exempt
def register_view(request):

    if request.method == "POST":
        data = json.loads(request.body)
        username = data["username"]
        email = data["email"]
        password = data["password"]
        confirmation = data["confirmation"]

        # Ensure password matches confirmation
        if password != confirmation:
            return JsonResponse({"ok" : False, "message": "Passwords must match"})

        # Attempt to create a new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return JsonResponse({ "ok" :False, "message": "Username already taken."})

        return JsonResponse({"ok": True}) 
    else:
        return JsonResponse({"error": "Method must be post"})           

# Render main page
@login_required(login_url='/')
def main(request):

    tasks = request.user.tasks.all()
    return render(request, 'todolist/main.html', {
        'tasks' : tasks

    })

#Add new task
@csrf_exempt
@login_required(login_url='/')
def add_task(request):

    if request.method == "POST":
        user = request.user
        data = json.loads(request.body)
        body = data["body"]

        task = Task(user = user,body = body)
        task.save()

        return JsonResponse({'ok': True, 'id': task.id, 'message': 'Task added successsfully'})

    else:
        return JsonResponse({'ok': False, 'message': 'Method must be post'})

# Check task to complete or incomplete
@csrf_exempt
@login_required(login_url='/')
def check(request, id):

    if request.method == "PUT":

        task = Task.objects.get(pk = id)
        task.done = not task.done
        task.save()

        return JsonResponse({ "ok" : True, "message": "task updated"})

# Delete a task
@csrf_exempt
@login_required(login_url='/')
def delete(request,id):
    if request.method == 'DELETE':
        try:
            # Attempt to get the task, and ensure that an user can`t delete tasks of others users
            Task.objects.get(pk = id, user=request.user).delete()
            return JsonResponse({"ok" : True, "message" : "Task deleted"})
        except ObjectDoesNotExist:
            return JsonResponse({"ok": False, "message" : f"Task with id : {id} doesn`t exist"})

    else:
        return JsonResponse({"ok" : False, "message": "Method must be delete"})


@csrf_exempt
@login_required(login_url='/')
def edit_task(request, id):
    if request.method == 'PUT':
        try:
            # Attempt to get a task, and ensure that an user cannot edit tasks of others users 
            task = Task.objects.get(pk = id,  user= request.user)    
            data = json.loads(request.body)
            body = data["body"]
            task.body = body
            task.save()
            return JsonResponse({"ok": True, "message" : "Task Updated"})
        except ObjectDoesNotExist:
            return JsonResponse({"ok": False, "message": f"Task with id : {id} doesn`t exists"})

    else:
        return JsonResponse({"ok": False, "message" : "Method must be put"})    

# Get all teams where the user belogns
@login_required(login_url='/')
def get_teams(request):
    teams = request.user.teams.all()
    return JsonResponse({"actual_user" : request.user.username, "teams" : [t.team.serialize() for t in teams]}, safe=False)


# Create a new team
@csrf_exempt
@login_required(login_url='/')
def create_team(request):

    if request.method == 'POST':

        # Get a random int between 1 and 1000
        code = random.randint(1,1000)
        data = json.loads(request.body)
        name = data['name']
        desc = data['desc']

        # Ensure that there is not team with the same code
        while len(Team.objects.filter(code = code)) > 0:
            code = random.randint(1,1000)

        team = Team(name = name, description=desc,owner = request.user, code = code)
        team.save()
        Team_User(user = request.user, team = team).save()

        return JsonResponse(team.serialize())
    else:
        return JsonResponse({"ok": False, "message": "Method must be Post"})

# Leave a team  
@login_required(login_url='/')
def leave_team(request, id):
    try:
        #Attempt to get the team
        team = Team.objects.get(pk = id)
        try:
            # Verify that the user belongs to the team, and ensure that an user cannot expel others users 
            Team_User.objects.get(user = request.user, team = team ).delete()
            # If the team does not have members it is deleted
            if len(Team_User.objects.filter(team=team)) == 0:
                team.delete()
            else:  
                # The owner attribute is changed to the last member who joined the team
                if team.owner == request.user:
                    member = team.users.order_by('timestamp')[0]    
                    team.owner = member.user
                    team.save()

            return JsonResponse({"ok" : True, "message": "Leaving team"})    

        except ObjectDoesNotExist:
            return JsonResponse({"ok": False, "message" : "User doesn`t belongs to this team"})

    except ObjectDoesNotExist:
        return JsonResponse({"ok": False, "message": f"Team with id: {id} doesn`t exists"})
        

#Join a team
@csrf_exempt
@login_required(login_url='/')
def join_team(request):
    if request.method ==  "POST":
        code = json.loads(request.body)["code"]
        team = Team.objects.filter(code = code)
        # Ensure that a team with the code given exists
        if len(team) > 0:
            # Ensure that the user doesn`t belongs to the team
            if len(Team_User.objects.filter(user = request.user, team = team[0])) > 0 :
                return JsonResponse({ "ok": False, "message" : "You already are in this team"})
            else:     
                Team_User(user = request.user, team= team[0]).save()
                return JsonResponse({"ok" : True, "team" : team[0].serialize()})
        else:
            return JsonResponse({"ok" : False, "message" : "Invalid code" })
    else:
        return JsonResponse({"ok" : False, "message" : "method must be post" })

# Team owner assigns tasks to team members
@csrf_exempt
@login_required(login_url='/')
def add_team_task(request):

    if request.method ==  "POST":
        data = json.loads(request.body)
        body = data['body']
        try:
            # Attempt to get the user
            user = User.objects.get(pk = data['user_id'])
            
        except ObjectDoesNotExist:
            return JsonResponse( {"ok": False, "message" : f"User with id: {data['user_id']} doesn`t exists"})
        try:
            # Attempt to get the team
            team = Team.objects.get(pk = data['team_id'])
        except ObjectDoesNotExist:
            return JsonResponse({"ok": False, "message": f"Team with id: {data['team_id']} doesn`t exists"})

        if (request.user != team.owner):
            return JsonResponse({"ok": False, "message": f"Just the team owner can assign task to team members"})
    
        task = Task(user = user, body = body, team = team)
        task.save()
        print(request.user.id)
        return JsonResponse({"ok" : True, "task" : task.serialize(), "owner_id": request.user.id})

    else:
        return JsonResponse( {"ok" : False, "message": "Method must be post"})    