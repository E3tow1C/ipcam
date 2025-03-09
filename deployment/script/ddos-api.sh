#!/bin/zsh
while true; do
    # Send a request to the FastAPI service with silent response
    curl http://localhost:8000 -s > /dev/null
done