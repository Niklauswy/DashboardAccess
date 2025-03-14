import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const NoData = ({ message = "No hay datos disponibles en este momento." }) => {
    return (
        <div className="flex items-center justify-center w-full h-full ">
            <Card className="overflow-hidden max-w-md w-full">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 0.5 }}
                >
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
                            d="M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,101.3C672,107,768,117,864,138.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                          ></path>
                        </motion.svg>
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                        >
                          <span className="text-9xl" role="img" aria-label="Sin datos">
                            📭
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
                          ¡Ups! No encontramos datos
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
                          className="mt-6 px-4 py-2 bg-green-800 text-white rounded-full font-medium hover:bg-blue-800 transition-colors duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.reload()}
                        >
                          Recargar
                        </motion.button>
                    </div>
                </motion.div>
            </Card>
        </div>
    );
};

export default NoData;
