const jwt = require('jsonwebtoken');

function sign(payload, secret, options = {}) {
  return new Promise((resolve, reject) =>
    jwt.sign(payload, secret,
      Object.assign({}, config.jwt, {
        expiresIn: '60 days',
      }, options),
      (error, jwtToken) => { if (error) reject(error); else resolve(jwtToken); }));
}

function verify(jwtToken, secret, options = {}) {
  return new Promise((resolve, reject) =>
    jwt.verify(jwtToken, secret, Object.assign({}, config.jwt, options),
      (error, payload) => { if (error) reject(error); else resolve(payload); }));
}

function decode(jwtToken, options) {
  const payload = jwt.decode(jwtToken,
    Object.assign({ complete: true }, options));
  return Promise.resolve(payload);
}

async function refresh(jwtToken, secret, options = {}) {
  const payload = await verify(jwtToken, secret,
    Object.assign({}, config.jwt, options.verify));

  if (payload.iat) delete payload.iat;
  if (payload.exp) delete payload.exp;
  if (payload.nbf) delete payload.nbf;
  if (payload.jti) delete payload.jti;

  const token = await sign(payload, secret,
    Object.assign({}, config.jwt, options.sign));

  return token;
}

exports.sign = sign;
exports.verify = verify;
exports.decode = decode;
exports.refresh = refresh;
