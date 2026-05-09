import { OPERATION_MODULES } from '../constants/authConstants'
import '../styles/brand-panel.css'

/*
 * Panel de identidad del login.
 * Mantiene la marca y el resumen de modulos separado del formulario.
 */
function BrandPanel() {
  return (
    <section className="brand-panel" aria-label="SmartLogix">
      <div className="brand-header">
        <img
          className="brand-logo"
          src="/smartlogix-logo.svg"
          alt="SmartLogix"
        />
       
      </div>

      <div className="brand-copy">
        <p>
          Acceso seguro para operar la log&iacute;stica de tu empresa desde
          cualquier lugar de una manera f&aacute;cil y profesional.
        </p>
      </div>

      <div className="workflow-board" aria-label="Flujo operativo">
        {/* Indicador visual del flujo operativo entre modulos. */}
        <div className="workflow-track" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="module-stack">
          {OPERATION_MODULES.map((module) => (
            <div className="module-row" key={module.label}>
              <span className={`module-dot module-dot-${module.tone}`}></span>
              <div>
                <strong>{module.label}</strong>
                <span>{module.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BrandPanel
