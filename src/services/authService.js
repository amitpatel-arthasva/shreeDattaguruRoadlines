const authService = {
  // Login user
  login: async (credentials) => {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (window.electronAPI) {
        // Check if bcrypt is available
        if (!window.electronAPI.bcrypt) {
          throw new Error('Password encryption service not available. Please restart the application.');
        }

        let users = [];
        try {
          const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
          const result = await window.electronAPI.query(query, [credentials.email.toLowerCase()]);
          if (!result.success) {
            throw new Error(result.error || 'Database query failed');
          }
          users = result.data || [];
        } catch (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Database connection failed. Please try again.');
        }

        if (!users || users.length === 0) {
          throw new Error('Invalid email or password');
        }

        const user = users[0];

        try {
          const isPasswordValid = await window.electronAPI.bcrypt.compare(credentials.password, user.password_hash);
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Store user data (no token needed for local SQLite)
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            phonenumber: user.phonenumber
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');

          return {
            success: true,
            data: {
              user: userData
            }
          };
        } catch (bcryptError) {
          console.error('Password verification error:', bcryptError);
          throw new Error('Authentication error. Please try again.');
        }
      } else {
        // Browser mode - mock authentication for development
        if (credentials.email === 'admin@test.com' && credentials.password === 'admin') {
          const user = {
            id: 1,
            name: 'Admin',
            email: 'admin@test.com',
            role: 'admin',
            phonenumber: '1234567890'
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          return {
            success: true,
            data: { user }
          };
        }
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
        
        // Validate input
        if (!userData.email || !userData.password || !userData.name || !userData.phonenumber) {
          throw new Error('All fields are required: name, email, password, and phone number');
        }

        // First check if user already exists
        const checkQuery = 'SELECT id FROM users WHERE email = ? LIMIT 1';
        const checkResult = await window.electronAPI.query(checkQuery, [userData.email.toLowerCase()]);
        
        if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
          throw new Error('User with this email already exists');
        }

        // Hash the password
        const saltRounds = 10;
        let hashedPassword;
        try {
          hashedPassword = await window.electronAPI.bcrypt.hash(userData.password, saltRounds);
        } catch (hashError) {
          console.error('Password hashing error:', hashError);
          throw new Error('Error processing password. Please try again.');
        }

        let transaction = false;
        let newUser;
        try {
          // Start transaction
          await window.electronAPI.query('BEGIN TRANSACTION');
          transaction = true;

          // Double-check that user doesn't exist within the transaction
          const doubleCheckQuery = 'SELECT id FROM users WHERE email = ? LIMIT 1';
          const doubleCheckResult = await window.electronAPI.query(doubleCheckQuery, [userData.email.toLowerCase()]);
          
          if (doubleCheckResult.success && doubleCheckResult.data && doubleCheckResult.data.length > 0) {
            await window.electronAPI.query('ROLLBACK');
            throw new Error('User with this email already exists');
          }

          // Insert the new user
          const insertQuery = `
            INSERT INTO users (name, email, phonenumber, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          const insertResult = await window.electronAPI.query(insertQuery, [
            userData.name,
            userData.email.toLowerCase(),
            userData.phonenumber,
            hashedPassword,
            userData.role || 'user'
          ]);

          if (!insertResult.success) {
            throw new Error(insertResult.error || 'Failed to create user');
          }

          // Get the newly created user using last_insert_rowid()
          const newUserQuery = `
            SELECT * FROM users 
            WHERE id = (SELECT last_insert_rowid()) 
            LIMIT 1
          `;
          const newUserResult = await window.electronAPI.query(newUserQuery);

          if (!newUserResult.success || !newUserResult.data || newUserResult.data.length === 0) {
            throw new Error('Failed to retrieve created user');
          }

          // If we get here, commit the transaction
          await window.electronAPI.query('COMMIT');
          transaction = false;

          newUser = newUserResult.data[0];
          console.log('New user created:', newUser);

          // Store user data (no token needed for local SQLite)
          const userToStore = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role || 'user',
            phonenumber: newUser.phonenumber
          };

          try {
            localStorage.setItem('user', JSON.stringify(userToStore));
            localStorage.setItem('isAuthenticated', 'true');
          } catch (storageError) {
            console.error('LocalStorage error:', storageError);
            // Continue even if localStorage fails - user is still created
          }

          return {
            success: true,
            data: {
              user: userToStore
            }
          };
        } catch (error) {
          // If there was an error and we started a transaction, roll it back
          if (transaction) {
            await window.electronAPI.query('ROLLBACK');
          }
          console.error('Registration error:', error);
          throw error;
        }
      } else {
        // Browser mode - mock registration
        if (!userData.email || !userData.password || !userData.name || !userData.phonenumber) {
          throw new Error('All fields are required: name, email, password, and phone number');
        }

        // Mock user creation for development
        const user = {
          id: Math.floor(Math.random() * 1000) + 1, // Random ID for development
          name: userData.name,
          email: userData.email.toLowerCase(),
          role: userData.role || 'user',
          phonenumber: userData.phonenumber
        };

        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
        } catch (storageError) {
          console.error('LocalStorage error:', storageError);
          // Continue even if localStorage fails
        }

        return {
          success: true,
          data: { user }
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Enhance error message for user display
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Get authentication token (not used in SQLite mode)
  getToken: () => {
    return null; // No token needed for SQLite
  }
};

export default authService;
