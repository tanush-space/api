const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

function generateToken(user) {
  const payload = { id: user._id, username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// In-memory users when DB is skipped
const USE_MEMORY = String(process.env.SKIP_DB).toLowerCase() === 'true';
const memoryUsers = [];

async function registerUser(data) {
  if (USE_MEMORY) {
    const exists = memoryUsers.find(u => u.email === data.email.toLowerCase() || u.username === data.username.toLowerCase());
    if (exists) {
      const field = exists.email === data.email.toLowerCase() ? 'email' : 'username';
      const error = new Error(`${field} already in use`);
      error.status = 409;
      throw error;
    }
    const passwordHash = await hashPassword(data.password);
    const user = {
      _id: String(memoryUsers.length + 1),
      username: data.username,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      location: data.location || '',
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? String(data.skills).split(',').map(s => s.trim()).filter(Boolean) : []),
      organizationName: data.organizationName || '',
      organizationDescription: data.organizationDescription || '',
      websiteUrl: data.websiteUrl || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() { return this; }
    };
    memoryUsers.push(user);
    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  const existing = await User.findOne({ $or: [{ email: data.email.toLowerCase() }, { username: data.username.toLowerCase() }] });
  if (existing) {
    const isEmail = existing.email === data.email.toLowerCase();
    const field = isEmail ? 'email' : 'username';
    const error = new Error(`${field} already in use`);
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(data.password);

  const user = await User.create({
    username: data.username,
    email: data.email,
    passwordHash,
    fullName: data.fullName,
    role: data.role,
    location: data.location || '',
    skills: Array.isArray(data.skills) ? data.skills : (data.skills ? String(data.skills).split(',').map(s => s.trim()).filter(Boolean) : []),
    organizationName: data.organizationName || '',
    organizationDescription: data.organizationDescription || '',
    websiteUrl: data.websiteUrl || ''
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

async function loginUser(identifier, password) {
  if (USE_MEMORY) {
    const id = identifier.toLowerCase();
    const user = memoryUsers.find(u => u.email === id || u.username === id);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }
    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { username: identifier.toLowerCase() };
  const user = await User.findOne(query);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

function sanitizeUser(user) {
  const { _id, username, email, fullName, role, location, skills, organizationName, organizationDescription, websiteUrl, createdAt, updatedAt } = user.toObject();
  return { id: _id, username, email, fullName, role, location, skills, organizationName, organizationDescription, websiteUrl, createdAt, updatedAt };
}

module.exports = {
  registerUser,
  loginUser
};


