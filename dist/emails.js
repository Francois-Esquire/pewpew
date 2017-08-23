'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var ReactHTMLEmail = require('react-html-email');
var ReactHTMLEmail__default = _interopDefault(ReactHTMLEmail);

const css = `
@media only screen and (max-device-width: 480px) {
  font-size: 20px !important;
}`.trim();
const Welcome = function (ref) {
  var handle = ref.handle; if ( handle === void 0 ) handle = '';
  var token = ref.token; if ( token === void 0 ) token = '';
  const home = config.urls.host;
  const logo = config.hrefs.logo;
  const verification = `${home}/?verification=${token}`;
  return (React.createElement( ReactHTMLEmail.Email, { title: "Test Email", headCSS: css },
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.A, { href: home },
        React.createElement( ReactHTMLEmail.Image, { alt: "Pew Pew", src: logo, width: 100, height: 100 })
      ),
      React.createElement( ReactHTMLEmail.Span, { fontSize: 15 }, "Welcome ", handle, " To Our Community!")
    ),
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.Box, { cellSpacing: 20, width: "100%", style: { borderTop: '3px solid black' } },
        React.createElement( ReactHTMLEmail.Item, null,
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "Clicking on the link below will"),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, React.createElement( ReactHTMLEmail.A, { href: verification }, "Verify Your Email")),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "If you're having trouble clicking the link, copy the url below and paste it in your browser"),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, verification)
        )
      )
    )
  ));
};

const css$1 = `
@media only screen and (max-device-width: 480px) {
  font-size: 20px !important;
}`.trim();
const Verification = function (ref) {
  var handle = ref.handle; if ( handle === void 0 ) handle = '';
  var token = ref.token; if ( token === void 0 ) token = '';
  const home = config.urls.host;
  const logo = config.hrefs.logo;
  const verification = `${home}/?verification=${token}`;
  return (React.createElement( ReactHTMLEmail.Email, { title: "Test Email", headCSS: css$1 },
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.A, { href: home },
        React.createElement( ReactHTMLEmail.Image, { alt: "Pew Pew", src: logo, width: 100, height: 100 })
      ),
      React.createElement( ReactHTMLEmail.Span, { fontSize: 15 }, "Hey ", handle, ", did you request a verification email?")
    ),
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.Box, { cellSpacing: 20, width: "100%", style: { borderTop: '3px solid black' } },
        React.createElement( ReactHTMLEmail.Item, null,
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "Clicking on the link below will"),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, React.createElement( ReactHTMLEmail.A, { href: verification }, "Verify Your Email")),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "If you are having trouble clicking the link, copy the url below and paste it in your browser bar:"),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, verification)
        ),
        React.createElement( ReactHTMLEmail.Item, null,
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "If this was not requested by you, please disregard this email and rest assured your account is safe.")
        )
      )
    )
  ));
};

const css$2 = `
@media only screen and (max-device-width: 480px) {
  font-size: 20px !important;
}`.trim();
const Recovery = function (ref) {
  var handle = ref.handle;
  var token = ref.token; if ( token === void 0 ) token = '';
  const home = config.urls.host;
  const logo = config.hrefs.logo;
  const recovery = `${config.urls.host}/?triage=${token}`;
  return (React.createElement( ReactHTMLEmail.Email, { title: "Test Email", headCSS: css$2 },
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.A, { href: home },
        React.createElement( ReactHTMLEmail.Image, { alt: "Pew Pew", src: logo, width: 100, height: 100 })
      ),
      React.createElement( ReactHTMLEmail.Span, { fontSize: 15 }, "Hi ", handle, ", We are sorry to hear about your troubles getting into your account!")
    ),
    React.createElement( ReactHTMLEmail.Item, null,
      React.createElement( ReactHTMLEmail.Box, { cellSpacing: 20, width: "100%", style: { borderTop: '3px solid black' } },
        React.createElement( ReactHTMLEmail.Item, null,
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "To reset your account password, please follow this link:"),
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, React.createElement( ReactHTMLEmail.A, { href: recovery }, "Recover Your Account"))
        ),
        React.createElement( ReactHTMLEmail.Item, null,
          React.createElement( ReactHTMLEmail.Span, { color: "gray", lineHeight: 20 }, "If this was not requested by you, please disregard this email and rest assured your account is safe.")
        )
      )
    )
  ));
};

var EmailComposer = function() {
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
  ReactHTMLEmail__default.injectReactEmailAttributes();
  ReactHTMLEmail__default.configStyleValidator({
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
      'outlook-web' ],
  });
};
EmailComposer.prototype.render = function (component) {
  const body = ReactHTMLEmail__default.renderEmail(component);
  return body;
};
EmailComposer.prototype.renderWelcome = function (handle, token) {
  return this.render(React.createElement( Welcome, { handle: handle, token: token }));
};
EmailComposer.prototype.renderRecovery = function (handle, token) {
  return this.render(React.createElement( Recovery, { handle: handle, token: token }));
};
EmailComposer.prototype.renderVerification = function (handle, token) {
  return this.render(React.createElement( Verification, { handle: handle, token: token }));
};
EmailComposer.prototype.sendEmail = function (ref, ref$1) {
    var from = ref.from;
    var to = ref.to;
    var subject = ref.subject;
    var cc = ref.cc;
    var bcc = ref.bcc;
    var html = ref$1.html;
    var text = ref$1.text;
    var attachments = ref$1.attachments;
  const parcel = Object.assign({}, {
    from: from,
    to: to,
    cc: cc,
    bcc: bcc,
    subject: subject,
    html: html,
    text: text,
    attachments: attachments,
  });
  return this.sendMail(parcel);
};
var index = new EmailComposer();

module.exports = index;
