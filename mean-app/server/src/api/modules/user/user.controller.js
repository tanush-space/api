const { registerUser, loginUser } = require('./user.service');

function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch(err => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message || 'Server error' });
    });
  };
}

exports.register = asyncHandler(async (req, res) => {
  const required = ['username', 'email', 'password', 'fullName', 'role'];
  for (const field of required) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  if (!['volunteer', 'ngo'].includes(String(req.body.role).toLowerCase())) {
    return res.status(400).json({ message: 'role must be volunteer or ngo' });
  }
  const payload = await registerUser({
    username: String(req.body.username).toLowerCase().trim(),
    email: String(req.body.email).toLowerCase().trim(),
    password: String(req.body.password),
    fullName: String(req.body.fullName).trim(),
    role: String(req.body.role).toLowerCase(),
    location: req.body.location,
    skills: req.body.skills,
    organizationName: req.body.organizationName,
    organizationDescription: req.body.organizationDescription,
    websiteUrl: req.body.websiteUrl
  });
  res.status(201).json(payload);
});

exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required' });
  }
  const payload = await loginUser(String(identifier).trim().toLowerCase(), String(password));
  res.json(payload);
});


