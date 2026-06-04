import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { RoleName } from '../types/Role';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: RoleName | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleName | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);

          const { data: roleData } = await supabase
            .from('team_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .is('team_id', null)
            .limit(1);

          if (roleData && roleData.length > 0) {
            setRole(roleData[0].role as RoleName);
          } else {
            setRole('member');
          }
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      }

      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        if (!newSession) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newSession.user);

        supabase
          .from('team_roles')
          .select('role')
          .eq('user_id', newSession.user.id)
          .is('team_id', null)
          .limit(1)
          .then(({ data: roleData }) => {
            if (mounted) {
              setRole((roleData?.[0]?.role as RoleName) || 'member');
              setLoading(false);
            }
          });
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}