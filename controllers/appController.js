exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'Solvers Club Member Area',
  });
};

exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Submit your Application',
  });
};

exports.getJoin = (req, res) => {
  res.render('join', {
    title: 'Join The Club',
  });
};

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Sign In',
  });
};

exports.getProfile = (req, res) => {
  res.render('profile', {
    title: 'Your Profile',
    user: req.session.authenticated,
  });
};

exports.getForgetPassword = (req, res) => {
  res.render('forgot');
};

exports.getMembersDirectory = (req, res) => {
  res.render('members', {
    title: 'Directory',
    user: req.session.authenticated,
  });
};

exports.getDiscovery = (req, res) => {
  res.render('discovery', {
    title: 'Challenge Discovery',
    user: req.session.authenticated,
  });
};

exports.getMembersUpdate = (req, res) => {
  res.render('update', {
    title: 'Update',
    user: req.session.authenticated,
  });
};

exports.getResources = (req, res) => {
  res.render('resources', {
    title: 'Resources',
    user: req.session.authenticated,
  });
};

exports.getDelete = (req, res) => {
  res.render('delete', {
    title: 'Delete',
    user: req.session.authenticated,
  });
};

exports.getResetPassword = (req, res) => {
  res.render('reset', {
    token: req.params.token,
    email: req.query.email,
  });
};
