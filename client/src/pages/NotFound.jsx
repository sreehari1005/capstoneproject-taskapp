import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="center-box">
      <h1>404</h1>
      <p>We could not find that page.</p>
      <Link to="/" className="btn">Go to my tasks</Link>
    </section>
  );
}
