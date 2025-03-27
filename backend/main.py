from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
import re
import json
import os
from typing import Dict, List, Optional
import openai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Project Requirements Chatbot")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    print("Warning: OPENAI_API_KEY not found in environment variables")

# Data models
class ContactInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        if not re.match(r'^\+?[0-9\s\-\(\)]{8,20}$', v):
            raise ValueError('Invalid phone number format')
        return v

class ConversationState(BaseModel):
    conversation_id: str
    messages: List[Dict[str, str]] = []
    project_requirements: Dict[str, str] = {}
    contact_info: Optional[Dict[str, str]] = None
    estimate: Optional[Dict[str, str]] = None
    current_step: str = "greeting"
    
# In-memory storage for conversation states (use a database in production)
conversation_states = {}

# System prompts for different conversation stages
SYSTEM_PROMPTS = {
    "greeting": """You are a professional and friendly AI assistant designed to help collect project requirements from potential clients. 
Your goal is to gather essential information about their project in a conversational manner.
Start by welcoming them and asking about their project in a friendly, professional tone.
Keep your responses concise and focused on gathering project details.""",
    
    "collecting_requirements": """You are a requirements gathering assistant with expertise in software development projects.
Based on the user's previous messages, ask targeted follow-up questions to gather more specific details about:
1. Project type (web, mobile, desktop, etc.)
2. Desired features and functionality
3. Target audience/users
4. Technical requirements or constraints
5. Timeline expectations

Be conversational but focused on getting concrete, actionable project details.
Your questions should be relevant to what they've already shared.
Keep responses concise (2-3 sentences maximum) and end with a specific question.""",
    
    "generating_estimate": """You are an expert project estimator. 
Based on the collected requirements, provide a preliminary estimate including timeline and budget range.
Acknowledge that this is just an initial estimate and that a more detailed quote would require further discussion.
Ask if they would like to proceed to share their contact information for a detailed proposal.
Keep your response professional, confident but not overpromising.""",
    
    "collecting_contact": """You are a professional sales assistant.
Thank the user for their interest and explain that you need their contact information to proceed.
Ask for their name, email address, and phone number politely.
Assure them that their information will be handled securely and only used to contact them about their project.
Keep your response friendly, professional and concise.""",
    
    "confirmation": """You are a helpful assistant wrapping up a conversation.
Thank the user for providing their information and summarize what will happen next.
Let them know that a team member will review their project details and contact them soon.
Ask if there's anything else they'd like to add before concluding.
Keep your response friendly, appreciative and professional."""
}

# Helper function to get conversation state
def get_conversation_state(conversation_id: str):
    if conversation_id not in conversation_states:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation_states[conversation_id]

# Helper function to simulate GPT-4 interaction
async def generate_gpt_response(conversation, user_input, system_prompt_key):
    # In demo mode, use predefined responses based on the current step
    if os.getenv("DEMO_MODE", "false").lower() == "true":
        if conversation.current_step == "greeting":
            return {"role": "assistant", "content": "Hi there! I'm an AI assistant designed to help collect information about your project. I can help gather requirements, provide a basic estimate, and collect your contact information. Let's start by discussing your project. What is it about?"}
        
        elif conversation.current_step == "collecting_requirements":
            if "website" in user_input.lower():
                follow_up = "That sounds interesting! Will your website need any e-commerce features?"
            elif "app" in user_input.lower() or "application" in user_input.lower():
                follow_up = "Great! Is this a mobile app, web app, or desktop application?"
            else:
                follow_up = "Could you elaborate more on the features you need for this project?"
                
            return {"role": "assistant", "content": f"Thanks for sharing that information. {follow_up}"}
        
        elif conversation.current_step == "generating_estimate":
            return {"role": "assistant", "content": "Based on the information you've provided, here's a basic estimate for your project:\n\n- Timeline: 8-12 weeks\n- Budget range: $15,000-$25,000\n\nThis is just a preliminary estimate. Would you like to proceed to share your contact information so we can provide a more detailed quote?"}
        
        elif conversation.current_step == "collecting_contact":
            return {"role": "assistant", "content": "Great! Could you please provide your name, email address, and phone number so our team can contact you with a detailed proposal?"}
        
        elif conversation.current_step == "confirmation":
            return {"role": "assistant", "content": "Thank you for providing all the information! Our team will review your project details and get back to you soon with a comprehensive proposal. Is there anything else you'd like to add before we wrap up?"}
        
        else:
            return {"role": "assistant", "content": "I'm here to help with your project requirements. What would you like to know?"}
    
    # In live mode, use the OpenAI API with gpt4o-mini model
    else:
        try:
            # Get the appropriate system prompt for the current conversation step
            system_prompt = SYSTEM_PROMPTS.get(
                conversation.current_step, 
                "You are a helpful assistant collecting project requirements."
            )
            
            # Convert conversation messages to the format expected by OpenAI API
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history
            for msg in conversation.messages:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            # Add the current user message if it exists
            if user_input:
                messages.append({"role": "user", "content": user_input})
            
            # Make the API call
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            # Return the assistant's response
            return {
                "role": "assistant",
                "content": response.choices[0].message.content
            }
            
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            # Fallback to a generic response
            return {
                "role": "assistant",
                "content": "I'm sorry, I encountered an issue processing your request. Let's continue with your project requirements. What else would you like to share?"
            }

# Endpoints
@app.post("/start")
async def start_conversation():
    """
    Initialize a new conversation with the chatbot
    """
    import uuid
    conversation_id = str(uuid.uuid4())
    new_conversation = ConversationState(conversation_id=conversation_id)
    
    # Add initial greeting message
    response = await generate_gpt_response(new_conversation, "", "greeting")
    new_conversation.messages.append(response)
    
    # Store conversation state
    conversation_states[conversation_id] = new_conversation
    
    return {
        "conversation_id": conversation_id,
        "message": response["content"],
        "current_step": new_conversation.current_step
    }

@app.post("/collect-requirements")
async def collect_requirements(
    conversation_id: str = Body(...),
    user_input: str = Body(...)
):
    """
    Collect project requirements step by step
    """
    conversation = get_conversation_state(conversation_id)
    
    # Add user message to history
    conversation.messages.append({"role": "user", "content": user_input})
    
    # Set the current step if it's still in greeting
    if conversation.current_step == "greeting":
        conversation.current_step = "collecting_requirements"
    
    # Update project requirements (in a real implementation, you would use more
    # sophisticated NLP to extract structured data from the user input)
    if "project_description" not in conversation.project_requirements:
        conversation.project_requirements["project_description"] = user_input
    else:
        conversation.project_requirements["additional_details"] = conversation.project_requirements.get("additional_details", "") + "\n" + user_input
    
    # Generate response
    response = await generate_gpt_response(conversation, user_input, conversation.current_step)
    conversation.messages.append(response)
    
    # Determine if we have enough requirements to move to the next step
    # In a real implementation, this would be more sophisticated
    if len(conversation.messages) >= 6:  # Arbitrary threshold for the demo
        next_step = "generating_estimate"
    else:
        next_step = "collecting_requirements"
        
    return {
        "message": response["content"],
        "current_step": next_step
    }

@app.post("/generate-estimate")
async def generate_estimate(
    conversation_id: str = Body(...)
):
    """
    Generate a basic project estimate based on collected information
    """
    conversation = get_conversation_state(conversation_id)
    
    # Set current step
    conversation.current_step = "generating_estimate"
    
    # Generate an estimate (in a real implementation, this would use more sophisticated logic)
    conversation.estimate = {
        "timeline": "8-12 weeks",
        "budget_range": "$15,000-$25,000",
        "complexity": "Medium"
    }
    
    # Generate response
    response = await generate_gpt_response(conversation, "", "generating_estimate")
    conversation.messages.append(response)
    
    return {
        "message": response["content"],
        "estimate": conversation.estimate,
        "current_step": "collecting_contact"
    }

@app.post("/collect-contact")
async def collect_contact(
    conversation_id: str = Body(...),
    contact: ContactInfo = Body(...)
):
    """
    Request and store contact information
    """
    conversation = get_conversation_state(conversation_id)
    
    # Set current step
    conversation.current_step = "collecting_contact"
    
    # Store contact info
    conversation.contact_info = contact.dict()
    
    # Add user message to history (summarized version of the contact info)
    conversation.messages.append({
        "role": "user", 
        "content": f"Name: {contact.name}, Email: {contact.email}, Phone: {contact.phone}"
    })
    
    # Update step to confirmation
    conversation.current_step = "confirmation"
    
    # Generate confirmation response
    response = await generate_gpt_response(conversation, "", "confirmation")
    conversation.messages.append(response)
    
    return {
        "message": response["content"],
        "current_step": "confirmation"
    }

@app.post("/complete")
async def complete_conversation(
    conversation_id: str = Body(...),
    final_notes: Optional[str] = Body(None)
):
    """
    Complete the conversation and submit the lead
    """
    conversation = get_conversation_state(conversation_id)
    
    if final_notes:
        conversation.messages.append({"role": "user", "content": final_notes})
    
    # In a real implementation, here you would:
    # 1. Save the lead to a database
    # 2. Send notifications or emails to the sales team
    # 3. Integrate with a CRM system
    
    # Final confirmation message
    final_message = "Thank you for your interest! Your information has been submitted successfully. Our team will contact you shortly to discuss your project in detail."
    
    # Save conversation data to a JSON file (for demo purposes)
    # In production, this would go to a database
    output_dir = "data"
    os.makedirs(output_dir, exist_ok=True)
    
    with open(f"{output_dir}/conversation_{conversation_id}.json", "w") as f:
        json.dump({
            "conversation_id": conversation.conversation_id,
            "project_requirements": conversation.project_requirements,
            "contact_info": conversation.contact_info,
            "estimate": conversation.estimate,
            "messages": conversation.messages
        }, f, indent=2)
    
    return {
        "message": final_message,
        "status": "completed"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 