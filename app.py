"""AI-assisted interactive deployment lab; see LEARNING_NOTES.md."""

import os

from flask import Flask, jsonify, render_template

app = Flask(__name__)
VERSION = "2.0"
BUILD_SHA = os.environ.get("BUILD_SHA", "local")


@app.route("/")
def home():
    return render_template("index.html", version=VERSION, build_sha=BUILD_SHA)


@app.get("/api/health")
def health():
    return jsonify(status="healthy", service="DeployLab", version=VERSION)


@app.get("/api/version")
def version():
    return jsonify(application="DeployLab", version=VERSION, commit=BUILD_SHA,
                   author="Besil Killthatill Eldho")
