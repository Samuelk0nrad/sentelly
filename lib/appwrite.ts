import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);

export const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailSession(email, password);
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error };
  }
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const user = await account.create('unique()', email, password, name);
    if (user) {
      await login(email, password);
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error };
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error };
  }
};