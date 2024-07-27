const postmark = require("postmark");

const POSTMARK_SERVER_API_TOKEN = "7851821b-9286-4484-b18e-ddf031227704";
const postmarkClient = new postmark.ServerClient(POSTMARK_SERVER_API_TOKEN);

// Send an email:
module.exports = function () {
    const senderEmail = document.getElementById("contact_email").value;
    const senderMessage = document.getElementById("contact_message").value;
    console.log('send message from email: ', senderEmail);
    console.log('send message: ', senderMessage);
    postmarkClient.sendEmail({
      "From": "sender@example.com",
      "To": "hello@verdance.co",
      "Subject": "Contact form email",
      "TextBody": senderMessage
    });
}

