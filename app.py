from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
        return "<h1>Welcome to my project</h1><p>Version 1.1</p>"
