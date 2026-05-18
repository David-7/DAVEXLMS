import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

export const mongoSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected: ${key}`);
  },
});

export const xssSanitizer = xss();

export const sanitizeLoginInput = (req, res, next) => {
  if (req.body.identifier) {
    req.body.identifier = req.body.identifier.replace(/[^a-zA-Z0-9@._/-]/g, '');
  }
  next();
};

export const sanitizeSearchQuery = (req, res, next) => {
  if (req.query.q) {
    req.query.q = req.query.q.replace(/[^\w\s@.-]/g, '');
    req.query.q = req.query.q.substring(0, 100);
  }
  next();
};
