# ⭕ 8Lens
*An intelligent AI chatbot for the **8Knot** visualization platform*

### Project Goal
Provide intelligent, conversational assistance within the 8Knot platform. Our goal is to make complex data analysis more accessible and intuitive through natural language interactions.


### Running

**Backend**:
You can start it up by doing `cd backend` and then `docker compose up --build --scale celery=10`
The application will listen on localhost:4995. It will be mostly called by Next.JS frontend.

**Frontend**:
The Frontend is a Next.js Application. You can start it up by doing `cd frontend` and then `npm install && npm run dev`

### FAQ
- **Why is data collection so slow:** Most likely you're only using one celery worker. Increase the amount of workers by running
`sudo docker compose --build --scale celery=<# of VIRTUAL CPU cores>`
