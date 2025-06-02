import { Client, Account, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export { client };

export const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailSession(email, password);
    return { success: true, data: session };
  } catch (error: any) {
    return { 
      success: false, 
      error: { message: error.message || 'Failed to login' } 
    };
  }
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    // After successful registration, automatically log in
    const session = await login(email, password);
    return { success: true, data: { user, session } };
  } catch (error: any) {
    return { 
      success: false, 
      error: { message: error.message || 'Failed to create account' } 
    };
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: { message: error.message || 'Failed to logout' } 
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return { success: true, data: user };
  } catch (error: any) {
    return { 
      success: false, 
      error: { message: error.message || 'Failed to get current user' } 
    };
  }
};