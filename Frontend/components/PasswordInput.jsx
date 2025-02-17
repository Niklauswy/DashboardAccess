import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

export function PasswordInput({ id, value, onChange, placeholder }) {
  const [error, setError] = useState("")

  const validate = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  useEffect(() => {
    if (value && !validate(value)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un dígito.")
    } else {
      setError("")
    }
  }, [value])

  return (
    <div>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
