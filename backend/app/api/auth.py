from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models import models
from app.schemas import schemas
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=schemas.UserOut)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists.",
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        avatar_url=user_in.avatar_url,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login_user(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


class GoogleLoginRequest(schemas.BaseModel):
    email: schemas.EmailStr
    full_name: str
    google_id: str
    avatar_url: str = None

@router.post("/google", response_model=schemas.Token)
def login_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    # Find user by Google ID or by Email
    user = db.query(models.User).filter(
        (models.User.google_id == payload.google_id) | (models.User.email == payload.email)
    ).first()

    if not user:
        # Create new user for google login
        user = models.User(
            email=payload.email,
            full_name=payload.full_name,
            google_id=payload.google_id,
            avatar_url=payload.avatar_url,
            hashed_password=None # Google oauth users don't have passwords initially
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # If user exists but google_id is not set, update google_id
        if not user.google_id:
            user.google_id = payload.google_id
            if payload.avatar_url and not user.avatar_url:
                user.avatar_url = payload.avatar_url
            db.add(user)
            db.commit()
            db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.get("/profile", response_model=schemas.UserOut)
def read_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/profile/update", response_model=schemas.UserOut)
def update_profile(
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


class ForgotPasswordRequest(schemas.BaseModel):
    email: schemas.EmailStr

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        # Don't leak user presence, just pretend we did it
        return {"message": "If this email is registered, a password reset link has been sent."}
    
    # Mocking password reset email
    return {"message": f"Simulated: A password reset link has been sent to {payload.email}."}
