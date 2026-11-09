# AI-assisted learning example; explain each instruction before submission.
FROM python:3.13-slim

ARG BUILD_SHA=local

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    BUILD_SHA=${BUILD_SHA}

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd --uid 10001 --create-home appuser

COPY app.py .
COPY templates/ templates/
COPY static/ static/
USER appuser
EXPOSE 8080
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT} --workers 1 --threads 4 --access-logfile - --error-logfile - app:app"]
