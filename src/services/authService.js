const authService = {
  // Login user
  login: async (credentials) => {
    try {
      if (window.electronAPI) {
        // Check if bcrypt is available
        if (!window.electronAPI.bcrypt) {
          throw new Error('Password encryption service not available. Please restart the application.');
        }
        
        // Electron mode - use SQLite
        const query = `
          SELECT * FROM users 
          WHERE email = ?
        `;
        const users = await window.electronAPI.query(query, [credentials.email]);
        
        if (users && users.length > 0) {
          const user = users[0];
          
          // Verify password using bcrypt from electronAPI
          const isPasswordValid = await window.electronAPI.bcrypt.compare(credentials.password, user.password_hash);
          
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }
          
          // Store user data (no token needed for local SQLite)
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
          }));
          localStorage.setItem('isAuthenticated', 'true');
          
          return {
            success: true,
            data: {
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user'
              }
            }
          };
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        // Browser mode - mock authentication for development
        if (credentials.email === 'admin@test.com' && credentials.password === 'admin') {
          const user = {
            id: 1,
            name: 'Admin User',
            email: 'admin@test.com',
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          
          return {
            success: true,
            data: { user }
          };
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  // Register user
  register: async (userData) => {
    try {
      if (window.electronAPI) {
        // Check if bcrypt is available
        if (!window.electronAPI.bcrypt) {
          throw new Error('Password encryption service not available. Please restart the application.');
        }
        
        // Electron mode - use SQLite        // First check if user already exists
        const checkQuery = `SELECT id FROM users WHERE email = ?`;
        const existingUsers = await window.electronAPI.query(checkQuery, [userData.email]);
        
        if (existingUsers && existingUsers.length > 0) {
          throw new Error('User with this email already exists');
        }
        
        // Hash password with bcrypt (includes salt automatically)
        const hashedPassword = await window.electronAPI.bcrypt.hash(userData.password, 10);
        
        // Insert new user
        const insertQuery = `
          INSERT INTO users (name, email, phonenumber, password_hash, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `;
          await window.electronAPI.query(insertQuery, [
          userData.name,
          userData.email,
          userData.phonenumber,
          hashedPassword,
          userData.role || 'user'
        ]);
        
        // Get the newly created user
        const newUsers = await window.electronAPI.query(checkQuery, [userData.email]);
        const newUser = newUsers[0];
        
        // Store user data
        const user = {
          id: newUser.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          data: { user }
        };      } else {
        // Browser mode - mock registration for development
        // For browser mode, just use a simple hash (not for production)
        const user = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user'
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          data: { user }
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  // Check if user is authenticated
  isAuthenticated: () => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const user = authService.getCurrentUser();
    return !!(isAuth === 'true' && user);
  },

  // Get auth token (not needed for SQLite, but keeping for compatibility)
  getToken: () => {
    return localStorage.getItem('isAuthenticated');
  }
};

export default authService;
