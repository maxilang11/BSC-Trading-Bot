var nodemailer = require('nodemailer');

require('dotenv-safe').config();

const {
    EMAIL_FROM,
    EMAIL_PASSWORD,
    EMAIL_TO,
  } = process.env;

function sendMail(text){
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASSWORD
      }
    });
    
    var mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Neuer Pancaketrade',
      text: text,
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  };
  
  module.exports = {
    sendMail,
  }