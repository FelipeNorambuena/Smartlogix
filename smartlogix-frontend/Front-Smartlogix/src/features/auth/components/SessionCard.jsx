import '../styles/session-card.css'

function SessionCard({
  onLogout,
  roles,
  session,
  userDisplayName,
  userInitials,
}) {
  return (
    <div className="session-state">
      <div className="session-avatar" aria-hidden="true">
        {userInitials}
      </div>
      <p className="eyebrow">Sesi&oacute;n activa</p>
      <h2>{userDisplayName}</h2>
      <p className="session-email">{session.user?.email}</p>

      <div className="role-list" aria-label="Roles asignados">
        {roles.length > 0 ? (
          roles.map((role) => <span key={role}>{role}</span>)
        ) : (
          <span>Sin roles asignados</span>
        )}
      </div>

      <dl className="session-details">
        <div>
          <dt>Token</dt>
          <dd>{session.tokenType}</dd>
        </div>
        <div>
          <dt>Expira</dt>
          <dd>
            {session.expiresAt
              ? new Date(session.expiresAt).toLocaleString()
              : 'No informado'}
          </dd>
        </div>
      </dl>

      <button className="secondary-button" type="button" onClick={onLogout}>
        Cerrar sesi&oacute;n
      </button>
    </div>
  )
}

export default SessionCard
