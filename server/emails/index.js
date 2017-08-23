import React from 'react';
import ReactHTMLEmail from 'react-html-email';

import Welcome from './Welcome';
import Verification from './Verification';
import Recovery from './Recovery';

class EmailComposer {
  constructor() {
    const nodemailer = require('nodemailer');
    const mailgun = require('nodemailer-mailgun-transport');

    const mailgunTransport = mailgun({
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      },
    });

    const transport = nodemailer.createTransport(mailgunTransport);

    this.sendMail = require('util').promisify(transport.sendMail);

    ReactHTMLEmail.injectReactEmailAttributes();
    ReactHTMLEmail.configStyleValidator({
      strict: true,
      warn: true,
      platforms: [
        'gmail',
        'gmail-android',
        'apple-mail',
        'apple-ios',
        'yahoo-mail',
        'outlook',
        'outlook-legacy',
        'outlook-web',
      ],
    });
  }
  render(component) {
    const body = ReactHTMLEmail.renderEmail(component);
    return body;
  }
  renderWelcome(handle, token) {
    return this.render(<Welcome handle={handle} token={token} />);
  }
  renderRecovery(handle, token) {
    return this.render(<Recovery handle={handle} token={token} />);
  }
  renderVerification(handle, token) {
    return this.render(<Verification handle={handle} token={token} />);
  }
  sendEmail({ from, to, subject, cc, bcc }, { html, text, attachments }) {
    const parcel = Object.assign({}, {
      from,
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      attachments,
    });
    return this.sendMail(parcel);
  }
}

export default new EmailComposer();
