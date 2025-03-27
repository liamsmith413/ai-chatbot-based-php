<?php
// Set page title
$pageTitle = "AI Project Requirements Chatbot";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="public/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="text-center my-4">
            <h1><?php echo $pageTitle; ?></h1>
            <p class="lead">Tell us about your project and get an instant estimate</p>
        </header>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="chat-container card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Project Requirements Bot</h5>
                    </div>
                    <div class="card-body">
                        <div id="chat-messages" class="chat-messages">
                            <!-- Messages will be displayed here -->
                            <div class="loading">Initializing chat...</div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <form id="chat-form" class="d-flex">
                            <input type="text" id="user-input" class="form-control me-2" placeholder="Type your message..." autocomplete="off" disabled>
                            <button type="submit" id="send-btn" class="btn btn-primary" disabled>Send</button>
                        </form>
                    </div>
                </div>

                <div id="contact-form-container" class="mt-4 d-none">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Your Contact Information</h5>
                        </div>
                        <div class="card-body">
                            <form id="contact-form">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" id="phone" name="phone" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Submit Contact Information</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div id="summary-container" class="mt-4 d-none">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">Summary</h5>
                        </div>
                        <div class="card-body">
                            <div id="summary-content">
                                <!-- Summary will be displayed here -->
                            </div>
                            <form id="final-notes-form" class="mt-3">
                                <div class="mb-3">
                                    <label for="final-notes" class="form-label">Any final notes or questions?</label>
                                    <textarea class="form-control" id="final-notes" rows="3"></textarea>
                                </div>
                                <button type="submit" class="btn btn-success">Complete</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Custom JS -->
    <script src="public/js/chatbot.js"></script>
</body>
</html> 