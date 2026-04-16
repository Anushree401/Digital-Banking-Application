const nodemailer = require('nodemailer');

function hasMailConfig() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

function getFromName() {
  return process.env.MAIL_FROM_NAME || process.env.OTP_FROM_NAME || 'BrokeBank';
}

async function sendRegistrationConfirmation({ to, name }) {
  if (!hasMailConfig()) {
    throw new Error('Gmail mail configuration missing');
  }

  const senderName = getFromName();
  const transporter = createTransporter();
  const displayName = name || 'there';

  return transporter.sendMail({
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${senderName} account confirmation`,
    text: `Hi ${displayName}, your ${senderName} account has been created successfully. You can now sign in with your email and password.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#173256">
        <h2 style="margin:0 0 12px">Welcome to ${senderName}</h2>
        <p>Hi ${displayName},</p>
        <p>Your account was created successfully. You can now sign in with your email and password.</p>
        <p style="margin-top:16px">If you did not create this account, you can ignore this email.</p>
      </div>
    `
  });
}

module.exports = {
  sendRegistrationConfirmation
};