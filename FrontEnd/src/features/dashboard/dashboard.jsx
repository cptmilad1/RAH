import { useAuth } from '../auth/authStore'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-mark">R</span>
          <span>RAH</span>
        </div>

        <nav className="dashboard-nav">
          <button type="button" className="nav-item active">Overview</button>
          <button type="button" className="nav-item">Trips</button>
          <button type="button" className="nav-item">Deliveries</button>
          <button type="button" className="nav-item">Profile</button>
        </nav>

        <button className="logout-button" type="button" onClick={logout}>Logout</button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow dashboard-eyebrow">WELCOME BACK</p>
            <h1>{user?.name || 'User'}</h1>
          </div>
          <span className="role-pill">{user?.role || 'user'}</span>
        </header>

        <div className="dashboard-grid">
          <article className="stat-card accent">
            <span className="stat-label">Active account</span>
            <strong>{user?.verify ? 'Verified' : 'Pending'}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Role</span>
            <strong>{user?.role || 'user'}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Email</span>
            <strong>{user?.email || '—'}</strong>
          </article>
        </div>

        <div className="panel-card">
          <h2>Profile snapshot</h2>
          <ul>
            <li><span>Username</span><strong>{user?.username || '—'}</strong></li>
            <li><span>Phone</span><strong>{user?.phone || '—'}</strong></li>
            <li><span>Address</span><strong>{user?.address || '—'}</strong></li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
