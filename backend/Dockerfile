
FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*
    
# Install Poetry
RUN python3 -m pip install --no-cache-dir poetry

# Set environment variables for Poetry
ENV PATH="/root/.local/bin:$PATH"


WORKDIR /app


COPY pyproject.toml poetry.lock /app/

COPY . /app/

# Install dependencies
RUN poetry install --no-dev


# Expose the port that your app will run on
EXPOSE 8000

# Command to run the app using Poetry and Uvicorn
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]
