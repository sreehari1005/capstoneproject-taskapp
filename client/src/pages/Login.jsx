import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!values.email.trim()) found.email = 'Email is required.';
    if (!values.password) found.password = 'Password is required.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="card form" onSubmit={handleSubmit} noValidate aria-label="Log in">
        <h1>Log in</h1>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button type="submit" className="btn btn-block" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
        <p className="muted center">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
