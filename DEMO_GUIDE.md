# Demonstration preparation

AI-assisted outline: use it to prepare your own explanation and recording.
Do not claim these generated files or setup steps were independently authored.

## Suggested 7–10 minute recording

1. **0:00–1:00 — Purpose and architecture.** Show DeployLab, run the four live checks,
   then show the diagram in the README. Identify GitHub, the runner, registry,
   Azure ingress, and Flask container.
2. **1:00–2:00 — Explain the implementation.** Show `app.py`, the seven tests,
   and Dockerfile. Explain why Gunicorn and a non-root user are used.
3. **2:00–3:00 — Trigger the pipeline.** Show the current live version, edit
   the version in `app.py` and its expected value in `test_app.py` and Postman,
   run tests, commit and push. Show GitHub Actions start.
4. **3:00–5:00 — Explain automation while the run proceeds.** Tests gate later
   steps. The tested image receives a commit tag, is pushed, and is deployed.
   Explain OIDC and the separate image-pull identity.
5. **5:00–6:00 — Show the cloud change.** Open the completed run, then the HTTPS
   endpoint. Show that the live version matches the changed code. If the run is
   still in progress, wait for its actual result; do not claim it has passed.
6. **6:00–7:30 — Postman evidence.** Send a GET request to the full cloud URL.
   Show HTTP 200, the HTML body and version, and passing assertions. Explain
   that a 404 on an unknown path and 405 for POST are intentional responses.
7. **7:30–9:00 — Evaluation.** Explain the startup retry and OIDC subject issues
   documented in the learning notes. Discuss costs, cold starts, limited replica
   capacity, image scanning, and log retention. Acknowledge AI assistance.

## Postman

`postman/B9IS121.postman_collection.json` contains five requests and ten
assertions. Import it into a signed-in Postman workspace to use collections,
or send the requests with the installed Lightweight API Client without signing
in. Set `expected_version` to the version you are demonstrating.

For a manual GET request, use the Azure URL from README and this Tests script:

```javascript
pm.test("HTTP 200 OK", () => pm.response.to.have.status(200));
pm.test("HTML response", () => pm.expect(pm.response.headers.get("Content-Type")).to.include("text/html"));
pm.test("Welcome message", () => pm.expect(pm.response.text()).to.include("Welcome to my project"));
pm.test("Expected version", () => pm.expect(pm.response.text()).to.include("Version 2.0"));
```

Change the expected version when the application changes. Capture the full
request URL, status, response body, and Test Results. Retain actual screenshots;
do not recreate results as diagrams or label terminal checks as Postman checks.

## Before submission

- Explain and adapt the work yourself, using the assignment's AI declaration rules.
- Develop the required CI/CD research and rationale with cited sources.
- Include the labeled deployment/network diagram and discuss the choices.
- Record the demonstration and ensure the examiner can open the video link.
- Prepare the single PDF required by the brief, including repository and video
  links. Verify the actual deadline and submission instructions in Moodle.
- Keep the live application available until marking is complete, then remove
  the resource group to stop ongoing costs.

The practical setup does not itself complete the research, personal evaluation,
recording, or final PDF submission.
