import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const validate = () => {
    const found = {};
    const name = values.name.trim();
    if (name.length < 2 || name.length > 50) found.name = 'Name must be 2 to 50 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (values.password.length < 8) found.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) found.password = 'Use at least one letter and one number.';
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="card form" onSubmit={handleSubmit} noValidate aria-label="Create account">
        <h1>Create account</h1>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby="pw-hint" />
          <p id="pw-hint" className="hint">At least 8 characters, with a letter and a number.</p>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button type="submit" className="btn btn-block" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
        <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
