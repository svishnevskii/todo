# Generated by Django 3.1.1 on 2020-10-04 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todolist', '0006_team_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='team_user',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
