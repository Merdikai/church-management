import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-wrapper">
      <div className="home-logo">✝️</div>
      <h1 className="home-title">{t('appName')}</h1>
      <p className="home-subtitle">
        Connect with your church community, join ministries, stay updated on events, and grow together in faith.
      </p>
      <div className="home-buttons">
        <Link to="/login" className="home-btn home-btn-primary">
          {t('login')}
        </Link>
        <Link to="/register" className="home-btn home-btn-outline">
          {t('register')}
        </Link>
      </div>
      <p className="home-footer">© {new Date().getFullYear()} Church Management System</p>
    </div>
  );
}