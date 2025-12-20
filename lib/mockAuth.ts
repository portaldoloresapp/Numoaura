// Mock Authentication - Temporary solution while Supabase activates
// TODO: Remove this file and revert to Supabase auth when ready

interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

interface MockSession {
  access_token: string;
  user: MockUser;
}

const MOCK_USERS_KEY = '@numoaura:mock_users';
const MOCK_SESSION_KEY = '@numoaura:mock_session';

export const mockAuth = {
  // Sign up a new user
  signUp: async (email: string, password: string) => {
    try {
      // Validate email format
      if (!email.includes('@')) {
        return { data: null, error: { message: 'Email inválido' } };
      }

      // Validate password length
      if (password.length < 6) {
        return { data: null, error: { message: 'Senha deve ter pelo menos 6 caracteres' } };
      }

      // Check if user already exists
      const existingUsers = await getStoredUsers();
      if (existingUsers[email]) {
        return { data: null, error: { message: 'Email já cadastrado' } };
      }

      // Create new user
      const newUser: MockUser = {
        id: `mock-${Date.now()}`,
        email,
        created_at: new Date().toISOString(),
      };

      // Store user
      existingUsers[email] = { ...newUser, password };
      await storeUsers(existingUsers);

      // Create session
      const session: MockSession = {
        access_token: `mock-token-${Date.now()}`,
        user: newUser,
      };

      await storeSession(session);

      return { data: { session, user: newUser }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  // Sign in existing user
  signInWithPassword: async (email: string, password: string) => {
    try {
      const users = await getStoredUsers();
      const user = users[email];

      if (!user || user.password !== password) {
        return { data: null, error: { message: 'Invalid login credentials' } };
      }

      const session: MockSession = {
        access_token: `mock-token-${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
      };

      await storeSession(session);

      return { data: { session }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(MOCK_SESSION_KEY);
      }
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const session = await getStoredSession();
      return { data: { session }, error: null };
    } catch (error: any) {
      return { data: { session: null }, error: { message: error.message } };
    }
  },
};

// Helper functions for browser localStorage
async function getStoredUsers(): Promise<any> {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  return {};
}

async function storeUsers(users: any): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }
}

async function storeSession(session: MockSession): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  }
}

async function getStoredSession(): Promise<MockSession | null> {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(MOCK_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}
