import { useUsersAdmin } from '../hooks/useUsersAdmin'
import '../styles/users-admin-section.css'

/*
 * Seccion ADMIN del auth-service.
 * Permite usar los endpoints protegidos /users desde el gateway.
 */
function UsersAdminSection({ session }) {
  const usersAdmin = useUsersAdmin(session)

  return (
    <section className="users-admin-section" aria-label="Administracion de usuarios">
      <div className="users-header">
        <div>
          <p className="users-kicker">Auth-service</p>
          <h2>Usuarios y roles</h2>
        </div>
        <button
          className="users-ghost-button"
          disabled={usersAdmin.isLoading}
          onClick={usersAdmin.loadUsers}
          type="button"
        >
          {usersAdmin.isLoading ? 'Cargando...' : 'Cargar usuarios'}
        </button>
      </div>

      <UsersMessages usersAdmin={usersAdmin} />

      <div className="users-grid">
        <CreateUserCard usersAdmin={usersAdmin} />
        <UsersListCard usersAdmin={usersAdmin} />
      </div>

      <EditUserCard usersAdmin={usersAdmin} />
    </section>
  )
}

function UsersMessages({ usersAdmin }) {
  return (
    <>
      {usersAdmin.errorMessage ? (
        <p className="users-error" role="alert">
          {usersAdmin.errorMessage}
        </p>
      ) : null}
      {usersAdmin.successMessage ? (
        <p className="users-success" role="status">
          {usersAdmin.successMessage}
        </p>
      ) : null}
    </>
  )
}

function CreateUserCard({ usersAdmin }) {
  return (
    <form className="users-card users-form" onSubmit={usersAdmin.handleCreateUser}>
      <div className="users-card-heading">
        <h3>Crear usuario</h3>
        <p>POST /users</p>
      </div>

      <div className="users-form-grid">
        <UserField
          label="Email"
          name="email"
          onChange={usersAdmin.handleUserFormChange}
          placeholder="usuario@smartlogix.cl"
          type="email"
          value={usersAdmin.userForm.email}
        />
        <UserField
          label="Password"
          name="password"
          onChange={usersAdmin.handleUserFormChange}
          placeholder="Minimo 8 caracteres"
          type="password"
          value={usersAdmin.userForm.password}
        />
        <UserField
          label="Nombre"
          name="firstName"
          onChange={usersAdmin.handleUserFormChange}
          value={usersAdmin.userForm.firstName}
        />
        <UserField
          label="Apellido"
          name="lastName"
          onChange={usersAdmin.handleUserFormChange}
          value={usersAdmin.userForm.lastName}
        />
      </div>

      <RoleSelector
        roles={usersAdmin.userForm.roles}
        availableRoles={usersAdmin.availableRoles}
        onToggle={usersAdmin.toggleCreateRole}
      />

      <label className="users-check-row">
        <input
          checked={usersAdmin.userForm.enabled}
          name="enabled"
          onChange={usersAdmin.handleUserFormChange}
          type="checkbox"
        />
        <span>Usuario activo</span>
      </label>

      <button className="users-primary-button" disabled={usersAdmin.isSaving} type="submit">
        {usersAdmin.isSaving ? 'Guardando...' : 'Crear usuario'}
      </button>
    </form>
  )
}

function UsersListCard({ usersAdmin }) {
  return (
    <div className="users-card">
      <div className="users-card-heading">
        <h3>Usuarios registrados</h3>
        <p>GET /users</p>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Roles</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usersAdmin.users.length > 0 ? (
              usersAdmin.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{formatName(user)}</td>
                  <td>{(user.roles || []).join(', ')}</td>
                  <td>{user.enabled ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  {usersAdmin.isLoading
                    ? 'Cargando usuarios...'
                    : 'Presiona Cargar usuarios para consultar auth-service.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EditUserCard({ usersAdmin }) {
  return (
    <div className="users-card">
      <div className="users-card-heading">
        <h3>Editar usuario</h3>
        <p>GET /users/id, PUT /users/id, PATCH roles y status</p>
      </div>

      <div className="users-lookup">
        <input
          onChange={(event) => usersAdmin.setLookupId(event.target.value)}
          placeholder="ID del usuario"
          value={usersAdmin.lookupId}
        />
        <button className="users-ghost-button" onClick={usersAdmin.handleSearchUser} type="button">
          Buscar
        </button>
      </div>

      {usersAdmin.editForm.id ? (
        <form className="users-form" onSubmit={usersAdmin.handleUpdateUser}>
          <div className="users-form-grid">
            <UserField
              label="Email"
              name="email"
              onChange={usersAdmin.handleEditFormChange}
              type="email"
              value={usersAdmin.editForm.email}
            />
            <UserField
              label="Nombre"
              name="firstName"
              onChange={usersAdmin.handleEditFormChange}
              value={usersAdmin.editForm.firstName}
            />
            <UserField
              label="Apellido"
              name="lastName"
              onChange={usersAdmin.handleEditFormChange}
              value={usersAdmin.editForm.lastName}
            />
          </div>

          <RoleSelector
            roles={usersAdmin.editForm.roles}
            availableRoles={usersAdmin.availableRoles}
            onToggle={usersAdmin.toggleEditRole}
          />

          <label className="users-check-row">
            <input
              checked={usersAdmin.editForm.enabled}
              name="enabled"
              onChange={usersAdmin.handleEditFormChange}
              type="checkbox"
            />
            <span>Usuario activo</span>
          </label>

          <div className="users-actions">
            <button className="users-primary-button" disabled={usersAdmin.isSaving} type="submit">
              Actualizar datos
            </button>
            <button
              className="users-ghost-button"
              disabled={usersAdmin.isSaving}
              onClick={usersAdmin.handleUpdateRoles}
              type="button"
            >
              Guardar roles
            </button>
            <button
              className="users-ghost-button"
              disabled={usersAdmin.isSaving}
              onClick={usersAdmin.handleUpdateStatus}
              type="button"
            >
              Guardar estado
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

function RoleSelector({ availableRoles, onToggle, roles }) {
  return (
    <div className="role-selector" aria-label="Roles">
      {availableRoles.map((role) => (
        <button
          className={roles.includes(role) ? 'role-pill role-pill-active' : 'role-pill'}
          key={role}
          onClick={() => onToggle(role)}
          type="button"
        >
          {role}
        </button>
      ))}
    </div>
  )
}

function UserField({ label, name, onChange, placeholder, type = 'text', value }) {
  return (
    <label className="users-field">
      <span>{label}</span>
      <input
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}

function formatName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sin nombre'
}

export default UsersAdminSection
