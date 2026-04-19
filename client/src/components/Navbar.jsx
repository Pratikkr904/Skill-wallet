import { Link, useNavigate } from 'react-router-dom';
import SkillSwapLogo from './SkillSwapLogo';
import DarkModeToggle from './DarkModeToggle';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('skillswap_token');

  const handleLogout = () => {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <SkillSwapLogo size={32} />
        </Link>
      </div>
      <div className="navbar-links">
        <DarkModeToggle />
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/search">Search</Link>
            <Link to="/messages">💬 Messages</Link>
            <Link to="/profile">Profile</Link>
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
