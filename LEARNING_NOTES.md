# Testing, container and cloud learning notes

These additions were prepared with Codex assistance on 9 November 2026:
`test_app.py`, `Dockerfile`, `.dockerignore`, the dependency files, and
`.github/workflows/ci.yml`, Azure setup, Postman examples, and documentation.
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
- The GitHub Actions workflow runs tests, builds an image, and checks the
  running container on each push to `main` or pull request. Repository content
  access is read-only. It can also request an OpenID Connect identity token.
- Only the `main` branch can authenticate to Azure: a federated identity
  credential restricts the repository and branch. Pull requests only run CI.
- After successful tests, the workflow tags the same tested image with the full
  Git commit SHA, pushes it to Azure Container Registry, updates Azure Container
  Apps, then compares the public HTTPS response with the local container response.
- A workflow success is deployment evidence; separately capture the required
  Postman checks and record your own explanation for the presentation.
- The base image is a mutable tag. Pinning a digest and automated vulnerability
  scanning are potential improvements to evaluate.

## Sources for your research

- https://flask.palletsprojects.com/en/stable/quickstart/
- https://flask.palletsprojects.com/en/stable/testing/
- https://flask.palletsprojects.com/en/stable/deploying/gunicorn/
- https://docs.docker.com/guides/python/
- https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect
- https://learn.microsoft.com/en-us/azure/container-apps/managed-identity-image-pull
- https://learn.microsoft.com/en-us/azure/container-apps/billing

## Cloud choices to explain in your own words

- Azure for Students was available through the college account. Both AWS and
  Azure can be managed from macOS; the student subscription drove this choice.
- France Central is supported by the subscription's allowed-regions policy.
- Container Apps uses Consumption resources (0.25 CPU, 0.5 GiB memory), with
  zero to one replica. This suits a small demonstration, but a cold start can
  delay the first request and one replica limits capacity.
- HTTPS ingress is public on port 443. Azure terminates TLS and forwards HTTP
  to Gunicorn on container port 8080. No database or custom virtual network is
  required for this stateless example.
- A private Basic Azure Container Registry stores images. Admin password
  authentication is disabled. The runtime managed identity has AcrPull only.
- The deployment identity uses GitHub OIDC and has AcrPush on the registry and
  Container Apps Contributor on this application. It cannot assign roles.
- The client, tenant and subscription IDs in GitHub variables are identifiers,
  not passwords. Authorization requires a valid short-lived identity token.
- Built-in platform logs can be streamed. A paid Log Analytics workspace was
  not added; durable central log retention is a limitation of this demonstration.
- The registry's France Central retail rate checked on 9 November 2026 was
  USD 0.1666/day (about USD 5 per 30 days). This continues while idle. Container
  Apps scales to zero, but active usage, requests and network transfer may cost
  extra outside included allowances. Check Azure Cost Management; do not assume
  the entire deployment is permanently free.
- Delete the assignment resource group after marking when it is no longer
  needed. That also destroys the app, environment, identities and registry;
  do not delete it before the examiner has finished accessing your URL.

Write your own explanation of why a browser receives status 200 on `/`, status
404 on an unknown address, and status 405 when posting to a read-only route.

## Observed connectivity issue

The first GitHub run passed the application tests and Docker build, but its HTTP
request encountered curl error 56, a connection reset during container startup.
The readiness check now retries connection errors for a bounded period. It still
fails the job if no successful response arrives. This is CI evidence; perform and
record the separate cloud Postman check required by the assignment.
