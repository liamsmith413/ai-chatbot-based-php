# AI Project Requirements Chatbot

A demo chatbot that collects project requirements, generates estimates, and captures contact information using OpenAI's gpt4o-mini model.

## Features

- Step-by-step project requirements collection
- Smart follow-up questions based on user responses using OpenAI's gpt4o-mini model
- Automatic estimate generation
- Contact information collection and validation
- Summary of collected information
- Frontend integration with PHP

## Project Structure

```
php-chatbot/
├── backend/                  # Python FastAPI backend
│   ├── main.py               # Main API application
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables (create this file)
│   └── .env.example          # Example environment variables
├── frontend/                 # PHP frontend
│   ├── index.php             # Main PHP interface
│   ├── public/               # Static assets
│   │   ├── css/              # CSS styles
│   │   │   └── style.css     # Custom styling
│   │   └── js/               # JavaScript
│   │       └── chatbot.js    # Chatbot functionality
│   └── templates/            # PHP templates (if needed)
└── data/                     # Generated data storage (created at runtime)
```

## Setup Instructions

### Backend Setup

1. Install Python 3.8+ if not already installed
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Configure the OpenAI API key:
   - Update the `.env` file in the backend directory with your actual OpenAI API key
   - Example: `OPENAI_API_KEY=sk-your-actual-api-key`
   - Optionally set `DEMO_MODE=true` if you want to use predefined responses instead of the OpenAI API

### Frontend Setup

1. Set up a PHP server (e.g., Apache, Nginx, or PHP built-in server)
2. Configure your server to point to the frontend directory

## Running the Application

### Start the Backend API

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

### Start the Frontend

1. If using PHP built-in server, navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Start the PHP server:
   ```
   php -S localhost:8080
   ```
   The application will be available at http://localhost:8080

## API Documentation

### Endpoints

- `/start` - Initialize a new conversation
- `/collect-requirements` - Collect project requirements
- `/generate-estimate` - Generate a project estimate
- `/collect-contact` - Collect user contact information
- `/complete` - Complete the conversation and save the lead

### Interactive Swagger Documentation

When the backend is running, view the interactive API documentation at:
- http://localhost:8000/docs

## Using OpenAI's gpt4o-mini Model

The chatbot uses OpenAI's gpt4o-mini model for intelligent responses. Key features:

- Dynamic responses based on user input
- Context-aware follow-up questions
- Sophisticated requirement analysis
- Natural conversational flow

To use your own prompts or customize the behavior:
1. Modify the `system_prompt` parameters in the API calls in `main.py`
2. Adjust the `temperature` and `max_tokens` parameters to control response creativity and length

## Customization

### Chatbot Flow

To customize the conversation flow, modify the following:
- `generate_gpt_response` function in `backend/main.py`
- System prompts used in the API calls
- Add more sophisticated logic for requirement analysis and estimate generation

### Frontend Styling

Modify the CSS in `frontend/public/css/style.css` to match your website's styling.

## Production Deployment

For production:
1. Set up proper authentication for API endpoints
2. Use environment variables for configuration (already implemented for the OpenAI API key)
3. Implement a database for data storage instead of file-based storage
4. Use a proper web server (Nginx, Apache) with WSGI/ASGI server for Python
5. Update the API URL in `chatbot.js` to point to your production API endpoint

## License

This project is licensed under the MIT License - see the LICENSE file for details. 