'use client'
import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

const NotFound = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId

    // Ajustar el tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Crear partículas
    const particlesArray = []
    const numberOfParticles = 100

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.size > 0.2) this.size -= 0.1
      }
      draw() {
        ctx.fillStyle = "rgba(173, 216, 230, 0.5)"
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }
    init()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
        if (particlesArray[i].size <= 0.2) {
          particlesArray.splice(i, 1)
          i--
          particlesArray.push(new Particle())
        }
      }
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="relative inline-block"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <svg className="w-64 h-64 md:w-80 md:h-80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#3B82F6"
              d="M43.5,-68.5C56.6,-61.3,67.6,-49.4,75.4,-35.3C83.2,-21.2,87.8,-4.9,85.6,10.3C83.4,25.5,74.3,39.6,62.7,50.6C51.1,61.6,37,69.5,21.7,74.1C6.4,78.8,-10.1,80.2,-25.3,76.2C-40.5,72.2,-54.3,62.8,-65.2,50.3C-76,37.8,-83.8,22.2,-85.5,5.7C-87.2,-10.8,-82.8,-28.3,-73.2,-41.9C-63.5,-55.5,-48.7,-65.2,-34.2,-71.7C-19.8,-78.1,-5.7,-81.3,7.4,-79.1C20.5,-76.9,30.4,-75.7,43.5,-68.5Z"
              transform="translate(100 100)"
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white text-7xl md:text-8xl font-bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            404
          </motion.div>
        </motion.div>
        <motion.h1
          className="mt-8 text-4xl md:text-5xl font-bold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Página no encontrada
        </motion.h1>
        <motion.p
          className="mt-4 text-xl text-gray-600 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </motion.p>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-block px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound

