let users = [];

function registerUser(email, password) {
  const exists = users.find(u => u.email === email);
  if (exists) return false;

  users.push({ email, password });
  return true;
}

function loginUser(email, password) {
  return users.find(u => u.email === email && u.password === password);
}

module.exports = { registerUser, loginUser };