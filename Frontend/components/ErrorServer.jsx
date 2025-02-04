import { motion } from "framer-motion"
            import { Card } from "@/components/ui/card"

            const ErrorServer = ({ message = "Lo sentimos, algo salió mal." }) => {
              return (
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)]">
                  <Card className="overflow-hidden max-w-md w-full">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <div className="relative h-48 bg-green-800">
                        <motion.svg
                          className="absolute bottom-0 left-0 w-full"
                          viewBox="0 0 1440 320"
                          initial={{ y: 100 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                          <path
                            fill="#ffffff"
                            fillOpacity="1"
                            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,234.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                          ></path>
                        </motion.svg>
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                        >
                          <span className="text-9xl" role="img" aria-label="Error">
                          😕
                          </span>
                        </motion.div>
                      </div>
                      <div className="p-6 text-center">
                        <motion.h2
                          className="text-2xl font-bold text-gray-800 mb-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          ¡Ups! Ocurrió un error
                        </motion.h2>
                        <motion.p
                          className="text-gray-600"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          {message}
                        </motion.p>
                        <motion.button
                          className="mt-6 px-4 py-2 bg-green-800 text-white rounded-full font-medium hover:bg-red-900 transition-colors duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.reload()}
                        >
                          Intentar de nuevo
                        </motion.button>
                      </div>
                    </motion.div>
                  </Card>
                </div>
              )
            }

            export default ErrorServer