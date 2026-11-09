# Local testing and container learning notes

These additions were prepared with Codex assistance on 9 November 2026:
`test_app.py`, `Dockerfile`, `.dockerignore`, the dependency files, and
`.github/workflows/ci.yml`.
They are learning material, not a claim of independently authored coursework.
The application began with the Flask quickstart example, with a version label
added during guided practice. Declare assistance according to the assignment brief.

## What to understand and demonstrate

- `python -m pytest -q` checks the homepage response, an unknown URL, and a
  disallowed HTTP method. A failing check must prevent later deployment.
- `requirements.txt` records the runtime packages; `requirements-dev.txt`
  adds pytest for development and continuous integration.
- `docker build -t b9is121-app:local .` packages the app with Python and Gunicorn.
- `docker run --rm -p 127.0.0.1:18080:8080 b9is121-app:local` runs that package.
  Open `http://127.0.0.1:18080`. Host port 8080 was already occupied during
  verification, so the local example maps port 18080 to container port 8080.
- The container uses an unprivileged user. Gunicorn serves HTTP in the container;
  Flask's development server is used only for local practice.
- `PORT` defaults to 8080 but can be provided by a cloud hosting service.
- The GitHub Actions CI workflow runs tests, builds an image, and checks the
  running container on each push to `main` or pull request. It uses read-only
  repository permissions and pinned action commit IDs.
- A successful local container is not evidence of cloud deployment. Image
  publishing, deployment automation, cloud permissions, Postman evidence, and
  the presentation remain.
- The base image is a mutable tag. Pinning a digest and automated vulnerability
  scanning are potential improvements to evaluate.

## Sources for your research

- https://flask.palletsprojects.com/en/stable/quickstart/
- https://flask.palletsprojects.com/en/stable/testing/
- https://flask.palletsprojects.com/en/stable/deploying/gunicorn/
- https://docs.docker.com/guides/python/

Write your own explanation of why a browser receives status 200 on `/`, status
404 on an unknown address, and status 405 when posting to a read-only route.
