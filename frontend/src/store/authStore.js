import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  fetchProfile: async (userId) => {
    if (!userId) {
      set({ profile: null });
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        set({ profile: data });
        return data;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      set({ session, user, loading: false });

      if (user) {
        get().fetchProfile(user.id);
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user || null;
        set({ session, user });
        if (user) {
          get().fetchProfile(user.id);
        } else {
          set({ profile: null });
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session, user: data.user });
    if (data.user) {
      await get().fetchProfile(data.user.id);
    }
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  isAuthenticated: () => !!get().user,
  isAdmin: () => get().profile?.role === 'admin',
}));

export default useAuthStore;
