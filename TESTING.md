# Testing the AI Project Requirements Chatbot

This guide will help you test the chatbot implementation using OpenAI's gpt4o-mini model.

## Prerequisites

1. Python 3.8+ installed
2. PHP server environment setup
3. OpenAI API key

## Setup for Testing

### 1. Configure the OpenAI API Key

Edit the `backend/.env` file and enter your actual OpenAI API key:

```
OPENAI_API_KEY=your_actual_api_key_here
DEMO_MODE=false
```

If you don't have an OpenAI API key or want to test without making API calls, set:

```
DEMO_MODE=true
```

### 2. Start the Backend Server

Open a terminal and navigate to the backend directory:

```
cd backend
```

Install the dependencies:

```
pip install -r requirements.txt
```

Start the FastAPI server:

```
uvicorn main:app --reload
```

The backend server should now be running at http://localhost:8000

### 3. Start the Frontend Server

Open another terminal and navigate to the frontend directory:

```
cd frontend
```

Start the PHP development server:

```
php -S localhost:8080
```

The frontend should now be accessible at http://localhost:8080

## Testing Scenarios

Visit http://localhost:8080 in your browser and test the following scenarios:

### Basic Conversation Flow

1. **Initial Greeting**: The chatbot should greet you and ask about your project
2. **Requirement Collection**: 
   - Mention building a website or app
   - The chatbot should ask relevant follow-up questions
   - Continue the conversation for a few exchanges
3. **Estimate Generation**:
   - After a few exchanges, the system will generate an estimate
   - Review the estimate details
4. **Contact Information**:
   - Fill in the contact form with test data
   - Submit the form
5. **Summary & Completion**:
   - Review the summary of your conversation
   - Add any final notes
   - Complete the conversation

### Testing Different Project Types

Try initiating conversations about different project types to see how the model responds:

- E-commerce website
- Mobile application
- Custom software development
- Content management system
- API integration project

### Error Handling

Test how the system handles errors:

1. Submit the contact form with an invalid email format
2. Try refreshing the page during a conversation
3. Test with DEMO_MODE=true and then with DEMO_MODE=false to compare responses

## Debugging

### Backend Issues

- Check the terminal running the backend server for any error messages
- Verify your API key is correctly set in the `.env` file
- Ensure the dependencies are correctly installed

### Frontend Issues

- Check the browser console for any JavaScript errors
- Ensure the API_BASE_URL in chatbot.js points to the correct backend URL

## Notes

- The gpt4o-mini model will generate different responses each time, so expect variation
- Response time may vary based on API latency
- In DEMO_MODE=true, the system uses predefined responses instead of calling the OpenAI API 