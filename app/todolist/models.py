from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Task(models.Model):
    user = models.ForeignKey('User', related_name="tasks", on_delete = models.CASCADE)
    body = models.CharField(max_length=128)
    done = models.BooleanField(default=False)
    timestamp = models.DateTimeField( auto_now_add= True)
    team = models.ForeignKey('Team', related_name="tasks", on_delete = models.CASCADE, null= True, blank=True)

    def __str__(self):
        return f"({self.id}) {self.user.username}: {self.body}"

    def serialize(self):
        return {
            "id" : self.id,
            "user" : self.user.username,
            "body" : self.body,
            "done" : self.done,
            "team" : self.team.name 
        }    

class Team(models.Model):
    name = models.CharField(max_length=36) 
    owner = models.ForeignKey('User', related_name="team", on_delete = models.CASCADE)
    code = models.IntegerField()
    description = models.TextField(default='', blank=True)

    def serialize(self):
        return {
            "id"    : self.id,
            "name"  : self.name,
            "owner" : self.owner.username,
            "code"  : self.code,
            "description" : self.description,
            "members" : [{"user" : row.user.username, "id" : row.user.id} for row in Team_User.objects.filter(team=self)]
        }

class Team_User(models.Model):
    user = models.ForeignKey('User', related_name= 'teams', on_delete= models.CASCADE)
    team = models.ForeignKey('Team', related_name='users', on_delete = models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: team({self.team.name})"
