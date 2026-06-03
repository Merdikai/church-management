import { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{
        marginTop: '64px',
        marginLeft: sidebarOpen ? '240px' : '0',
        padding: '2rem',
        transition: 'margin-left 0.3s ease',
        minHeight: 'calc(100vh - 64px)',
      }}>
        {children}
      </main>
    </div>
  );
}