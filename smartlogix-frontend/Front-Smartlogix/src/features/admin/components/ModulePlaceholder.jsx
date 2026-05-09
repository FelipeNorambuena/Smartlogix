/*
 * Seccion temporal para modulos cuya API aun no esta implementada.
 * Mantiene el panel segmentado sin mezclar responsabilidades.
 */
function ModulePlaceholder({ moduleName, routes }) {
  return (
    <section className="module-placeholder" aria-label={moduleName}>
      <p className="admin-kicker">M&oacute;dulo pendiente</p>
      <h2>{moduleName}</h2>
      <p>
        La secci&oacute;n ya est&aacute; reservada en el panel. Se conectar&aacute; al
        gateway cuando el microservicio tenga endpoints disponibles.
      </p>
      <div className="placeholder-routes">
        {routes.map((route) => (
          <span key={route}>{route}</span>
        ))}
      </div>
    </section>
  )
}

export default ModulePlaceholder
