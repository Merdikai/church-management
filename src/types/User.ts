export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  gender?: 'male' | 'female';
  address?: string;
  date_joined?: string;
  emergency_contact?: string;
  preferred_language: 'en' | 'am';
  avatar_url?: string;
  created_at: string;
}