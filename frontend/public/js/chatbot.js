/**
 * Chatbot for Project Requirements Collection
 */
(function() {
    // API Configuration
    const API_BASE_URL = getApiBaseUrl();
    
    /**
     * Determine the appropriate API base URL based on the environment
     */
    function getApiBaseUrl() {
        // Check if running in GitHub Codespaces
        if (window.location.hostname.includes('github.dev') || 
            window.location.hostname.includes('codespaces') || 
            window.location.hostname.includes('githubusercontent')) {
            
            // Extract the codespace domain base (remove port if present)
            const codespaceUrl = window.location.hostname.split('-')[0];
            const domain = window.location.hostname.substring(codespaceUrl.length + 1);
            
            // For GitHub Codespaces, we need to use the same domain but different port (8000)
            // Replace the port number in the URL (from 8080 to 8000)
            const baseUrl = window.location.origin;
            return baseUrl.replace('-8080', '-8000');
        }
        
        // Default for local development
        return 'http://localhost:8000';
    }
    
    // Chatbot state
    let conversationId = null;
    let currentStep = 'greeting';
    let estimate = null;
    let projectRequirements = {};
    
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const contactFormContainer = document.getElementById('contact-form-container');
    const contactForm = document.getElementById('contact-form');
    const summaryContainer = document.getElementById('summary-container');
    const summaryContent = document.getElementById('summary-content');
    const finalNotesForm = document.getElementById('final-notes-form');
    
    /**
     * Initialize the chatbot
     */
    function initChatbot() {
        // Start the conversation
        fetch(`${API_BASE_URL}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',  // Explicitly set CORS mode
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            conversationId = data.conversation_id;
            currentStep = data.current_step;
            
            // Clear loading message
            chatMessages.innerHTML = '';
            
            // Add bot message
            addBotMessage(data.message);
            
            // Enable input
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        })
        .catch(error => {
            console.error('Error starting conversation:', error);
            chatMessages.innerHTML = '<div class="alert alert-danger">Error connecting to the chatbot service. Please refresh and try again.</div>';
        });
    }
    
    /**
     * Add a bot message to the chat
     */
    function addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Process any markdown-like formatting in the message
        let formattedMessage = message;
        
        // Handle bullet points
        if (message.includes('\n-')) {
            formattedMessage = message.replace(/\n- /g, '<br>• ');
        }
        
        // Handle line breaks
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = formattedMessage;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = time;
        
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Add a user message to the chat
     */
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = time;
        
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Show typing indicator
     */
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing';
        typingDiv.innerHTML = 'Typing<div class="typing-indicator"><span></span><span></span><span></span></div>';
        typingDiv.id = 'typing-indicator';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Hide typing indicator
     */
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    /**
     * Send user message to the API
     */
    function sendMessage(message) {
        // Disable input while processing
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        // Show typing indicator
        showTypingIndicator();
        
        // Determine which endpoint to use based on current step
        let endpoint = '/collect-requirements';
        let payload = {
            conversation_id: conversationId,
            user_input: message
        };
        
        if (currentStep === 'collecting_contact' || currentStep === 'generating_estimate') {
            // Let the UI handle these steps
            processLocalStep(currentStep, message);
            return;
        }
        
        // Send the request
        fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',  // Explicitly set CORS mode
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response
            addBotMessage(data.message);
            
            // Update current step
            currentStep = data.current_step;
            
            // Handle step transition
            if (currentStep === 'generating_estimate') {
                generateEstimate();
            }
            
            // Re-enable input
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addBotMessage('Sorry, there was an error processing your message. Please try again.');
            userInput.disabled = false;
            sendBtn.disabled = false;
        });
    }
    
    /**
     * Generate estimate based on collected requirements
     */
    function generateEstimate() {
        // Disable input while processing
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send the request
        fetch(`${API_BASE_URL}/generate-estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',  // Explicitly set CORS mode
            credentials: 'same-origin',
            body: JSON.stringify({
                conversation_id: conversationId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response
            addBotMessage(data.message);
            
            // Store estimate
            estimate = data.estimate;
            
            // Update current step
            currentStep = data.current_step;
            
            // Show contact form
            if (currentStep === 'collecting_contact') {
                setTimeout(() => {
                    contactFormContainer.classList.remove('d-none');
                    // Scroll to the contact form
                    contactFormContainer.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Error generating estimate:', error);
            hideTypingIndicator();
            addBotMessage('Sorry, there was an error generating your estimate. Please try again.');
            userInput.disabled = false;
            sendBtn.disabled = false;
        });
    }
    
    /**
     * Handle contact form submission
     */
    function submitContactInfo(name, email, phone) {
        // Show typing indicator
        showTypingIndicator();
        
        // Send the request
        fetch(`${API_BASE_URL}/collect-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                contact: {
                    name,
                    email,
                    phone
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response
            addBotMessage(data.message);
            
            // Update current step
            currentStep = data.current_step;
            
            // Hide contact form
            contactFormContainer.classList.add('d-none');
            
            // Show summary
            showSummary(name, email, phone);
        })
        .catch(error => {
            console.error('Error submitting contact info:', error);
            hideTypingIndicator();
            addBotMessage('Sorry, there was an error submitting your contact information. Please try again.');
        });
    }
    
    /**
     * Show summary of collected information
     */
    function showSummary(name, email, phone) {
        // Create the summary HTML
        let summaryHTML = `
            <div class="summary-item">
                <div class="summary-label">Contact Information:</div>
                <div class="summary-content">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                </div>
            </div>
            
            <div class="summary-item">
                <div class="summary-label">Estimated Project Details:</div>
                <div class="summary-content">
                    <p><strong>Timeline:</strong> ${estimate.timeline}</p>
                    <p><strong>Budget Range:</strong> ${estimate.budget_range}</p>
                    <p><strong>Complexity:</strong> ${estimate.complexity}</p>
                </div>
            </div>
        `;
        
        // Set the HTML
        summaryContent.innerHTML = summaryHTML;
        
        // Show the summary container
        summaryContainer.classList.remove('d-none');
        
        // Scroll to the summary
        summaryContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Complete the conversation
     */
    function completeConversation(finalNotes) {
        // Show typing indicator
        showTypingIndicator();
        
        // Send the request
        fetch(`${API_BASE_URL}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                final_notes: finalNotes || null
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response
            addBotMessage(data.message);
            
            // Disable all inputs
            userInput.disabled = true;
            sendBtn.disabled = true;
            
            // Hide summary form
            document.getElementById('final-notes-form').style.display = 'none';
            
            // Show completion message in summary
            const completionDiv = document.createElement('div');
            completionDiv.className = 'alert alert-success mt-3';
            completionDiv.textContent = 'Your information has been submitted successfully!';
            summaryContent.appendChild(completionDiv);
        })
        .catch(error => {
            console.error('Error completing conversation:', error);
            hideTypingIndicator();
            addBotMessage('Sorry, there was an error submitting your information. Please try again.');
        });
    }
    
    /**
     * Handle local step processing (no API call)
     */
    function processLocalStep(step, message) {
        hideTypingIndicator();
        
        if (step === 'collecting_contact') {
            addBotMessage('Please fill out the contact form below to receive your detailed estimate.');
            userInput.disabled = true;
            sendBtn.disabled = true;
        }
        
        setTimeout(() => {
            userInput.disabled = false;
            sendBtn.disabled = false;
        }, 500);
    }
    
    // Event Listeners
    
    // Chat form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
            sendMessage(message);
        }
    });
    
    // Contact form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (name && email && phone) {
            submitContactInfo(name, email, phone);
        }
    });
    
    // Final notes form submission
    finalNotesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const finalNotes = document.getElementById('final-notes').value.trim();
        completeConversation(finalNotes);
    });
    
    // Initialize the chatbot when the page loads
    document.addEventListener('DOMContentLoaded', initChatbot);
})(); 