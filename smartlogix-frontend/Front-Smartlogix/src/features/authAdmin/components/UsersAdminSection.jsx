import { useState } from 'react'
import { useUsersAdmin } from '../hooks/useUsersAdmin'
import '../styles/users-admin-section.css'

/*
 * Seccion ADMIN del auth-service.
 * Permite usar los endpoints protegidos /users desde el gateway.
 */
function UsersAdminSection({ session }) {
  const usersAdmin = useUsersAdmin(session)
  const [openSections, setOpenSections] = useState({
    create: false,
    edit: false,
    list: false,
  })
  const [lastCopiedUserId, setLastCopiedUserId] = useState('')
  const [copiedFeedbackUserId, setCopiedFeedbackUserId] = useState('')

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
    }))
  }

  function handleEditUser(user) {
    usersAdmin.selectUserForEdit(user)
    setOpenSections((currentSections) => ({
      ...currentSections,
      edit: true,
    }))
  }

  async function handleCopyUserId(userId) {
    const nextUserId = String(userId)

    await copyToClipboard(nextUserId)
    setLastCopiedUserId(nextUserId)
    setCopiedFeedbackUserId(nextUserId)
    window.setTimeout(() => setCopiedFeedbackUserId(''), 1600)
  }

  function handlePasteUserId() {
    // Usa el ultimo ID copiado desde la tabla para evitar depender del permiso del navegador.
    usersAdmin.setLookupId(lastCopiedUserId)
  }

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

      <div className="users-accordion">
        <CollapsibleUserSection
          id="create"
          isOpen={openSections.create}
          onToggle={toggleSection}
          title="Crear usuarios"
        >
          <CreateUserCard usersAdmin={usersAdmin} />
        </CollapsibleUserSection>

        <CollapsibleUserSection
          id="list"
          isOpen={openSections.list}
          onToggle={toggleSection}
          title="Listar usuarios"
        >
          <UsersListCard
            copiedFeedbackUserId={copiedFeedbackUserId}
            onCopyUserId={handleCopyUserId}
            onEditUser={handleEditUser}
            usersAdmin={usersAdmin}
          />
        </CollapsibleUserSection>

        <CollapsibleUserSection
          id="edit"
          isOpen={openSections.edit}
          onToggle={toggleSection}
          title="Editar usuarios"
        >
          <EditUserCard
            canPasteUserId={Boolean(lastCopiedUserId)}
            onPasteUserId={handlePasteUserId}
            usersAdmin={usersAdmin}
          />
        </CollapsibleUserSection>
      </div>
    </section>
  )
}

function CollapsibleUserSection({ children, id, isOpen, onToggle, title }) {
  const contentId = `users-section-${id}`

  return (
    <article className="users-disclosure">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="users-disclosure-button"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span>{title}</span>
        <span className="users-disclosure-icon" aria-hidden="true">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      {isOpen ? (
        <div className="users-disclosure-content" id={contentId}>
          {children}
        </div>
      ) : null}
    </article>
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
    <form className="users-form" onSubmit={usersAdmin.handleCreateUser}>
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

      <div className="users-actions">
        <button className="users-primary-button" disabled={usersAdmin.isSaving} type="submit">
          {usersAdmin.isSaving ? 'Guardando...' : 'Crear usuario'}
        </button>
        <button
          className="users-ghost-button"
          disabled={usersAdmin.isSaving}
          onClick={usersAdmin.resetCreateForm}
          type="button"
        >
          Limpiar formulario
        </button>
      </div>
    </form>
  )
}

function UsersListCard({ copiedFeedbackUserId, onCopyUserId, onEditUser, usersAdmin }) {
  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {usersAdmin.users.length > 0 ? (
            usersAdmin.users.map((user) => (
              <tr key={user.id}>
                <td className="users-id-cell">
                  <button
                    aria-label={`Copiar ID del usuario ${user.email}`}
                    className="users-copy-id-button"
                    onClick={() => onCopyUserId(user.id)}
                    title="Copiar ID"
                    type="button"
                  >
                    {copiedFeedbackUserId === String(user.id) ? 'Copiado' : 'Copiar'}
                  </button>
                </td>
                <td>{user.email}</td>
                <td>{formatName(user)}</td>
                <td>{(user.roles || []).join(', ')}</td>
                <td>{user.enabled ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <button
                    className="users-table-action"
                    onClick={() => onEditUser(user)}
                    type="button"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                {usersAdmin.isLoading
                  ? 'Cargando usuarios...'
                  : 'Presiona Cargar usuarios para consultar auth-service.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function EditUserCard({ canPasteUserId, onPasteUserId, usersAdmin }) {
  return (
    <>
      <div className="users-lookup">
        <input
          onChange={(event) => usersAdmin.setLookupId(event.target.value)}
          placeholder="ID del usuario"
          value={usersAdmin.lookupId}
        />
        <button
          className="users-ghost-button"
          disabled={!canPasteUserId}
          onClick={onPasteUserId}
          type="button"
        >
          Pegar
        </button>
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
              onClick={usersAdmin.resetEditSearch}
              type="button"
            >
              Buscar otro usuario
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
    </>
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

async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default UsersAdminSection
