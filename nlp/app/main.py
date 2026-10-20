from fastapi import FastAPI
from pydantic import BaseModel

from app.services.user_story_generator import generate_user_story
from app.services.multi_requirement import generate_multiple_user_stories

app = FastAPI(
    title="REQFLOW NLP Service",
    version="0.2.0"
)


class FeedbackRequest(BaseModel):
    feedback: str


@app.get("/")
def home():
    return {
        "message": "REQFLOW NLP Service is running"
    }


@app.post("/nlp/generate-user-story")
def create_user_story(request: FeedbackRequest):

    result = generate_user_story(
        request.feedback
    )

    return {
        "feedback": request.feedback,
        **result
    }

@app.post("/nlp/generate-multiple-user-stories")
def create_multiple_user_stories(request: FeedbackRequest):

    result = generate_multiple_user_stories(
        request.feedback
    )

    return {
        "feedback": request.feedback,
        **result
    }