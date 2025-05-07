# Happify
Capstone project for Team Shark Spring 25

## Folder structure
- backend/
- frontend/

## static files
- frontend/public/assets

## steps to run
### frontend
- create `.env` with `PORT=<PORT>`
- npm install
- npm start
### backend
- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
    #### Before running
    - create `.env` file in backend/ and keep `CONNECTION_STRING=<MongoDB_Connection_string>`(replace)
    - create `.flaskenv` file in backend/ and keep `FLASK_APP=app.py`
- flask run --port 8003 or flask run

