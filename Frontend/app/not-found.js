'use client'
import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Professional geometric background pattern */}
      <div className="absolute inset-0 pattern-background "></div>
      
      <motion.div
        className="text-center relative z-10 px-4 max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-12">
          {/* Left side: 404 number */}
          <motion.div
            className="text-[120px] md:text-[180px] font-bold text-black leading-none relative mb-8 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="relative z-10">404</span>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] h-[40%] bg-[#00723F] opacity-20 rounded-full -z-10"></div>
          </motion.div>
          
          {/* Right side: Content */}
          <div className="text-left">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Página no encontrada
            </motion.h1>
            
            <motion.div
              className="h-1 w-16 bg-[#00723F] rounded mb-4"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            ></motion.div>
            
            <motion.p
              className="text-gray-600 mb-8 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Lo sentimos, la página que estás buscando no existe o ha sido movida. 
              Por favor, verifica la URL o regresa a la página principal.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-[#00723F] text-white font-medium rounded-md hover:bg-[#005c32] transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Regresar al inicio
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* UABC small logo watermark */}
      <div className="absolute bottom-6 right-6 text-[#00723F] opacity-30 font-semibold text-xl">
        UABC
      </div>
      
      {/* CSS for the geometric pattern background */}
      <style jsx>{`
        .pattern-background {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300723F' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}

export default NotFound

