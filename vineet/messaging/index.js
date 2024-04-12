// import pkg from 'twilio';    
// const {client} = pkg; 
import client from 'twilio';

const accountSid = '';
const authToken = '';

client(accountSid, authToken, (err, twilioClient) => {
  if (err) {
    console.error('Error initializing Twilio client:', err);
    return;
  }

  client.messages
    .create({
      body: 'Your appointment is coming up on July 21 at 3PM',
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+9'
    })
    .then(message => console.log("success",message.sid))
    .catch(error => console.error(error)); // Handle potential errors
});
console.log("lkjlkj")