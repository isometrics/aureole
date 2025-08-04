# ⭕ 8Lens
*An intelligent AI chatbot for the **8Knot** visualization platform*

### Project Goal
Provide intelligent, conversational assistance within the 8Knot platform. Our goal is to make complex data analysis more accessible and intuitive through natural language interactions.

### FAQ
- **Why is data collection so slow:** Most likely you're only using one celery worker. Increase the amount of workers by running
`sudo docker compose --build --scale celery=<# of VIRTUAL CPU cores>`