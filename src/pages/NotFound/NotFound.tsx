import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#0f3460' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>Page not found</p>
      <Link
        to="/"
        style={{
          marginTop: '1rem',
          color: '#0f3460',
          fontWeight: 600,
          textDecoration: 'underline'
        }}
      >
        Go home
      </Link>
    </div>
  );
}