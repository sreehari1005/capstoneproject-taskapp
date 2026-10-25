import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">TaskFlow</Link>
        <nav aria-label="Main">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button type="button" className="btn btn-small btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-small">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
