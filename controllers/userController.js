const Airtable = require('airtable');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const querystring = require('querystring');
const data = require('./dataController.js');

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);
const table = base('users');

// Start Helper Functions
const findUser = async (email = undefined, username = undefined) => {
  let recordExists = false;
  let options = {};

  if (email && username) {
    options = {
      filterByFormula: `OR(email = '${email}', username = '${username}')`,
    };
  } else {
    options = {
      filterByFormula: `OR(email = '${email}', username = '${email}')`,
    };
  }

  const users = await data.getAirtableRecords(table, options);

  users.filter(user => {
    if (user.get('email') === email || user.get('username') === username) {
      return (recordExists = true);
    }
    if (user.get('email') === email || user.get('username') === email) {
      return (recordExists = true);
    }
    return false;
  });

  return recordExists;
};

const generateToken = (id, email) => {
  const source = `${id}${email}`;
  let token = '';
  for (let i = 0; i < source.length; i += 1) {
    token += source.charAt(Math.floor(Math.random() * source.length));
  }

  return token;
};

const generateResetUrl = (token, email) => {
  let url = '';
  url = `login/resetlink/${token}?${querystring.stringify({ email })}`;
  return url;
};

const isUserApproved = (username) => {

  if (username.get('approval') === 'Approved') {
    console.log ('Approved');
    return true;
  }
  console.log ('Rejected');
  return false;
};

const generateActivateUrl = (token, email) => {
  let url = '';
  url = `activate/activatelink/${token}?${querystring.stringify({ email })}`;
  return url;
};

// End Helper Functions

exports.addUser = async (req, res, next) => {
  const { fullname, email, username, section, achievements, team, how } = req.body;

  const userExists = await findUser(email, username);

  if (userExists) {
    res.render('login', {
      message: 'Username or Email already exists!',
    });
    return;
  }

  table.create(
    {
      email,
      username,
      display_name: fullname,
      section: [section],
      achievements,
      team,
      how: how,
    },
    (err, record) => {
      if (err) {
        console.error(err);
        console.log(section)
        console.log(how)
        return;
      }
      req.body.id = record.getId();
      next();
    }
  );
};

exports.storePassword = (req, res, next) => {
  const { password, id } = req.body;

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      console.error(err);
      return;
    }

    req.body.hash = hash;

    data.updateRecord(table, id, {
      password: hash,
    });

    next();
  });
};

exports.confirmToken = async (req, res, next) => {
  // Get Form Variables
  const { email, token } = req.body;

  const options = {
    filterByFormula: `OR(email = '${email}', token = '${token}')`,
  };

  // Get the user
  const users = await data.getAirtableRecords(table, options);

  const user = users.map(record => ({
    id: record.getId(),
  }));

  // hash and the update the user's password
  req.body.id = user[0].id;
  next();
};

exports.authenticate = (req, res, next) => {
  const { username, password } = req.body;
  const options = {
    filterByFormula: `OR(email = '${username}', username = '${username}')`,
  };

  data
    .getAirtableRecords(table, options)
    .then(users => {
      users.forEach(function(user) {
        if (isUserApproved(user)) {
          bcrypt.compare(password, user.get('password'), function(err, response) {
            if (response) {
              // Passwords match, response = true
              req.session.authenticated = user.fields;
              res.redirect('/profile');
            } else {
              // Passwords don't match
              res.render('login', {
                message: 'Username and password do not match'
              });
              console.log(err);
            }
          });
        }
        else {
          res.render('login', {
            message: 'Sorry, but your application has not been approved. We normally take 48 hours to review applications. Please contact us on info@solversclub.com if you applied before that, and have not heard back from us.',
          });
        }
      });
    })
    .catch(err => {
      console.log(Error(err));
    });
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
    return;
  }

  res.redirect('/login');
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (!err) {
      res.clearCookie('connect.sid');
      res.redirect('/');
    } else {
      throw new Error(err);
    }
  });
};

exports.addToken = async (req, res, next) => {
  const { username } = req.body;
  // Check that the user exists. We wrote this helper function already in Part 1
  const userExists = await findUser(username);

  if (!userExists) {
    res.render('/user/forgot', {
      message: 'Username or Email already exists!',
    });
    return;
  }

  const options = {
    filterByFormula: `OR(email = '${username}', username = '${username}')`,
  };

  // Get the user
  const users = await data.getAirtableRecords(table, options);

  const user = users.map(record => ({
    id: record.getId(),
    email: record.get('email'),
  }));

  const token = generateToken(user[0].id, user[0].email);

  table.update(
    user[0].id,
    {
      token,
    },
    (err, record) => {
      if (err) {
        console.error(err);
      }

      req.body.url = generateResetUrl(token, user[0].email);
      req.body.to = user[0].email;
      next();
    }
  );
};

exports.addActivationToken = async (req, res, next) => {
  const { username } = req.body;
  // Check that the user exists. We wrote this helper function already in Part 1
  const userExists = await findUser(username);

  if (!userExists) {
    res.render('activate', {
      message: 'Your email is not registered. You must activate your member account using the email you registered with.',
    });
    return;
  }

  const options = {
    filterByFormula: `OR(email = '${username}', username = '${username}')`,
  };

  // Get the user
  const users = await data.getAirtableRecords(table, options);

  const user = users.map(record => ({
    id: record.getId(),
    email: record.get('email'),
  }));

  const token = generateToken(user[0].id, user[0].email);

  table.update(
    user[0].id,
    {
      token,
    },
    (err, record) => {
      if (err) {
        console.error(err);
      }

      req.body.url = generateActivateUrl(token, user[0].email);
      req.body.to = user[0].email;
      next();
    }
  );
};

exports.sendPasswordResetEmail = async (req, res) => {
  const subject = 'Password Reset link for Solvers Club';
  const { url, to } = req.body;
  const body = `Hello,
  You requested to have your Solvers Club Member Area password reset. <br> Ignore this email if this is a mistake or you did not make this request.<br>Otherwise, click the link below to reset your password.<br>
  <a href="https://solversclubmembers.herokuapp.com/${url}">Reset My Password</a><br>
  You can also copy and paste this link in your browser.
  <a href="https://solversclubmembers.herokuapp.com/${url}">https://solversclubmembers.herokuapp.com/${url}</a>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('forgot', {
        message: 'Please check your email for your password reset link',
      });
    }
  });
};

exports.sendConfirmResetEmail = async (req, res) => {
  const subject = 'Password successfully reset';
  const to = req.body.email;
  const body = `Hello, Your password was successfully reset.`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('login');
    }
  });
};

// Account activation emails

exports.sendActivationEmail = async (req, res) => {
  const subject = 'Solvers Club Account Activation';
  const { url, to } = req.body;
  const body = `Hello,
  You requested to have your Solvers Club account activated. <br> Ignore this email if this is a mistake or you did not make this request.<br>Otherwise, click the link below to activate your account.<br>
  <a href="https://solversclubmembers.herokuapp.com/${url}">Activate your account</a><br>
  You can also copy and paste this link in your browser.
  <a href="https://solversclubmembers.herokuapp.com/${url}">https://solversclubmembers.herokuapp.com/${url}</a>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('activate', {
        message: 'Please check your email for your account activation link',
      });
    }
  });
};

exports.sendConfirmActivationEmail = async (req, res) => {
  const subject = 'Solvers Club Account Activation.';
  const to = req.body.email;
  const body = `Hello, Your Solvers Club account was successfully activated. You may now access our <a href="https://solversclubmembers.herokuapp.com/">Members Area.</a>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('login');
    }
  });
};
