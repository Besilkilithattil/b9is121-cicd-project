"""AI-assisted learning examples: HTTP checks for the current app."""

import re

import pytest

from app import app


@pytest.fixture
def client():
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_homepage_returns_html_with_a_version(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.mimetype == "text/html"
    assert "<h1>" in response.text
    assert re.search(r"Version \d+\.\d+", response.text)


def test_unknown_page_returns_not_found(client):
    assert client.get("/does-not-exist").status_code == 404


def test_homepage_rejects_post(client):
    assert client.post("/").status_code == 405


def test_health_endpoint_has_machine_readable_status(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.is_json
    assert response.json["status"] == "healthy"
    assert response.json["service"] == "DeployLab"


def test_release_endpoint_identifies_current_version(client):
    response = client.get("/api/version")
    assert response.status_code == 200
    assert response.json["version"] == "2.0"
    assert response.json["application"] == "DeployLab"
    assert response.json["commit"]


@pytest.mark.parametrize("path", ["/static/styles.css", "/static/app.js"])
def test_dashboard_assets_are_served(client, path):
    response = client.get(path)
    assert response.status_code == 200
    assert len(response.data) > 100
