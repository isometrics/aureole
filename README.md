# ⭕ Aureole 
*An intelligent AI chatbot for the **8Knot** visualization platform*

### Note
This is NOT meant to be a replacement for 8Knot. The backend is kept up to date with the latest changes in [8Knot](https://github.com/oss-aspen/8Knot). Pull requests should only be for the next.js frontend, and the AI functionality. Everything else should go in [8Knot](https://github.com/oss-aspen/8Knot).

### Project Goal
Aureole aims to revolutionize how users interact with data visualizations by providing intelligent, conversational assistance within the 8Knot platform. Our goal is to make complex data analysis more accessible and intuitive through natural language interactions.

### FAQ
- **Why did you name it Aureole?:** It is named after a place in the anime "Frieren: Beyond Journey's End".
- **Why is data collection so slow:** Most likely you're only using one celery worker. Increase the amount of workers by running
`sudo docker compose --build --scale celery=<# of VIRTUAL CPU cores>`