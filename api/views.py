from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import *
from django.contrib.auth.hashers import make_password
from django.db.models import Avg
import json
import datetime
import re
import nltk
import string

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

with open("words.json") as f:
    words_data = json.load(f)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_template(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except Template.DoesNotExist:
        return Response({"error": "Template not found."}, status=404)

    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    if template.owner != user:
        return Response({"error": "User has no permission."}, status=403)

    try:
        template.delete()
    except:
        return Response({"error": "Unable to delete template."}, status=400)
    
    return Response({"message": "Template deleted."}, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_template(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except Template.DoesNotExist:
        return Response({"error": "Template not found."}, status=404)

    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    if request.user in template.rating_user.all():
        return Response({"error": "User rated previously."}, status=400)

    data = json.loads(request.body)
    rating = data.get("rating")

    # Add rating total to template
    template.rating_total += rating
    
    # Add user to rated user
    template.rating_user.add(user)

    template.save()

    return Response({
        "message": "Rated successfully.",
        "rating": round(template.rating_total / template.rating_user.count(), 1),
        "rating_user": template.rating_user.count(),
        "rated": True if request.user in template.rating_user.all() else False,
    }, status=200)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def save_template(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except Template.DoesNotExist:
        return Response({"error": "Template not found."}, status=404)

    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    try:
        template.saved_user.add(user)
        template.save()
    except:
        return Response({"error": "Unable to save template."}, status=400)

    return Response({
        "message": "Template saved.",
        "save": template.saved_user.count(),
        "saved": True if request.user in template.saved_user.all() else False
    }, status=200)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def unsave_template(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except Template.DoesNotExist:
        return Response({"error": "Template not found."}, status=404)

    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    try:
        template.saved_user.remove(user)
        template.save()
    except:
        return Response({"error": "Unable to unsave template."}, status=400)

    return Response({
        "message": "Template unsaved.",
        "save": template.saved_user.count(),
        "saved": True if request.user in template.saved_user.all() else False
    }, status=200)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_template_visbility(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except Template.DoesNotExist:
        return Response({"error": "Template not found."}, status=404)

    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    if template.owner != user:
        return Response({"error": "User has no permission."}, status=403)

    data = json.loads(request.body)
    visibility = data.get("visibility")

    template.visibility = visibility
    template.save()

    return Response({
        "message": "Changed successfully.",
        "visibility": template.visibility
    }, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def your_templates(request):
    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    templates = user.templates.all()

    results = []
    for template in templates:
        try:
            rating = round(template.rating_total / template.rating_user.count(), 1)
        except ZeroDivisionError:
            rating = "No rating"
        results.append({
            "id": template.id,
            "subject": template.subject.replace("{", "").replace("}", ""),
            "content": template.content.replace("{", "").replace("}", ""),
            "rating": rating,
            "saved": template.saved_user.count(),
            "owner": template.owner.username,
            "date": template.date.date()
        })
    return Response({"templates": results}, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_templates(request):
    try:
        user = User.objects.get(pk=request.user.id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    templates = user.saved.all()

    results = []
    for template in templates:
        try:
            rating = round(template.rating_total / template.rating_user.count(), 1)
        except ZeroDivisionError:
            rating = "No rating"
        results.append({
            "id": template.id,
            "subject": template.subject.replace("{", "").replace("}", ""),
            "content": template.content.replace("{", "").replace("}", ""),
            "rating": rating,
            "saved": template.saved_user.count(),
            "owner": template.owner.username,
            "date": template.date.date()
        })
    return Response({"templates": results}, status=200)

@api_view(["GET"])
def search_results(request):
    q = request.GET.get("q")
    if not q:
        return Response({"error": "No search parameter"}, status=400)
  
    words = []
    for word in nltk.word_tokenize(q)[:10]:
        word = word.lower()
        if word.isalpha() and word not in string.punctuation and word not in nltk.corpus.stopwords.words("english"):
            words.append(word)

    search_for = set()
    word_neighbours = dict()
    for word in set(words):
        try:
            neighbour = words_data[word]["w2v"]
        except KeyError:
            neighbour = []
        search_for.add(word)
        search_for.update(neighbour)
        word_neighbours[word] = neighbour + [word]

    if search_for:  
        candidates = Template.objects.filter(visibility="Public", words__has_any_keys=list(search_for))
    else:
        candidates = []
    
    bm25 = dict()
    templates = []

    k = 1.2
    b = 0.75
    avgdl = Template.objects.filter(visibility="Public").aggregate(Avg("length"))["length__avg"]

    # Rank based on BM25 score
    for candidate in candidates:
        words_count = candidate.words
        length = candidate.length
        bm25[candidate] = 0
        for word in word_neighbours:
            try:
                idf = words_data[word]["idf"]
            except KeyError:
                idf = 14.8497216284 # Pre-calculated value in trained data
            
            freq = 0
            for neighbour in word_neighbours[word]:
                if neighbour in words_count:
                    freq += words_count[neighbour] 
            bm25[candidate] += (freq * (k + 1)) / (freq + k * (1 - b + b * (length / avgdl))) * idf

    bm25 = dict(sorted(bm25.items(), key=lambda x: x[1], reverse=True))
    for candidate in bm25:
        templates.append(candidate)

    results = []
    for template in templates:
        try:
            rating = round(template.rating_total / template.rating_user.count(), 1)
        except ZeroDivisionError:
            rating = "No rating"
        results.append({
            "id": template.id,
            "subject": template.subject.replace("{", "").replace("}", ""),
            "content": template.content.replace("{", "").replace("}", ""),
            "rating": rating,
            "saved": template.saved_user.count(),
            "owner": template.owner.username,
            "date": template.date.date()
        })

    return Response({"templates": results}, status=200)

@api_view(["GET"])
def get_template(request, template_id):
    try:
        template = Template.objects.get(pk=template_id)
    except:
        return Response({"error": "Template not found."}, status=404)

    try:
        rating = round(template.rating_total / template.rating_user.count(), 1)
    except ZeroDivisionError:
        rating = "No rating"

    if template.visibility == "Private" and template.owner != request.user:
        return Response({"error": "User has no permission to access this template."}, status=403)

    return Response({
        "subject": template.subject,
        "content": template.content,
        "owner": template.owner.username,
        "date": template.date.date(),
        "visibility": template.visibility,
        "rating": rating,
        "rating_user": template.rating_user.count(),
        "save": template.saved_user.count(),
        "is_owner": True if template.owner == request.user else False,
        "rated": True if request.user in template.rating_user.all() else False,
        "saved": True if request.user in template.saved_user.all() else False
    }, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create(request):
    data = json.loads(request.body)
    subject = data.get("subject")
    content = data.get("content")
    visibility = data.get("visbility")

    if not subject or not content or not visibility:
        return Response({"error": "Please fill in all fields."}, status=400)

    s = re.split(r"(\{.*?\})", subject)
    for i in range(len(s)):
        if s[i].startswith("{") and s[i].endswith("}"):
            s[i] = "{" + s[i][1:-1].strip() + "}"
    subject = "".join(s)

    c = re.split(r"(\{.*?\})", content)
    for i in range(len(c)):
        if c[i].startswith("{") and c[i].endswith("}"):
            c[i] = "{" + c[i][1:-1].strip() + "}"
    content = "".join(c)

    text = subject + "\n" + content
    text = text.replace("{", "").replace("}", "")

    words = []
    for word in nltk.word_tokenize(text):
        word = word.lower()
        if word.isalpha() and word not in string.punctuation and word not in nltk.corpus.stopwords.words("english"):
            words.append(word)

    words_count = dict()
    for word in words:
        words_count[word] = words_count.setdefault(word, 0) + 1
    
    template = Template(
        subject=subject,
        content=content,
        visibility=visibility,
        owner=request.user,
        rating_total=0,
        date=datetime.datetime.now(),
        words=words_count,
        length=len(words)
    )
    template.save()

    return Response({"id": template.id}, status=200)

@api_view(["POST"])
def signup(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    retypepassword = data.get("retypepassword")

    if len(User.objects.filter(username=username)) == 1:
        return Response({"error": "Username has been taken."}, status=400)

    if not username or not password or not retypepassword:
        return Response({"error": "Please fill in all fields."}, status=400)

    if password != retypepassword:
        return Response({"error": "Password and retype password are not same."}, status=400)

    User(username=username, password=make_password(password)).save()
    return Response({"message": "Success"}, status=200)
