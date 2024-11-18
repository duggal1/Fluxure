#!/bin/bash

# Start the Python FastAPI server
cd src/python
uvicorn ai_engine:app --reload --port 8000 &

# Start the Next.js development server
bun run dev