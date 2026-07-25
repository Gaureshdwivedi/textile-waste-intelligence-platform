from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    PROJECT_NAME = "Textile Waste Intelligence Platform"
    PROJECT_VERSION = "1.0.0"

    DATABASE_URL = os.getenv("DATABASE_URL")

settings = Settings()