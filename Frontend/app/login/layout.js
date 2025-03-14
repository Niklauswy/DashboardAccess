export const metadata = {
  title: 'Acceso al Sistema de Registros',
  description: 'Inicia sesión con tus credenciales para acceder al sistmea de registros de la Universidad Autónoma de Baja California',
}

export default function RootLayout({ children }) {
  return (
      <html lang="es">
      <body>{children}</body>
      </html>
  )
}