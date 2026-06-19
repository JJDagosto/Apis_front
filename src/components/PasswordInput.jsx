import { useId, useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import "./PasswordInput.css"

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  required = false,
  name,
}) {
  const inputId = useId()
  const [visible, setVisible] = useState(false)
  const title = visible ? "Ocultar contraseña" : "Mostrar contraseña"

  return (
    <label className="password-input-label" htmlFor={inputId}>
      {label}
      <span className="password-input-wrap">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={title}
          title={title}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </span>
    </label>
  )
}

export default PasswordInput
