'use client'

import { useState, useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown } from 'lucide-react'

export default function FAQPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-6xl font-bold text-center mb-8 text-primary">FAQ</h1>
      

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="hover:bg-secondary/50 px-4 py-2 rounded-lg transition-colors">
                  Tipos de grupos
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-secondary/20 rounded-lg mt-2">
                  <p>Existen dos tipos de grupos:</p>
                  <ul className="list-disc list-inside mt-2">

                    <li>Security Groups: Se utilizan para asignar permisos y políticas de seguridad a los usuarios.</li>
                    <li>Distribution Groups: Se utilizan para enviar correos electrónicos a un grupo de usuarios.</li>

                  </ul>

                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="hover:bg-secondary/50 px-4 py-2 rounded-lg transition-colors">
                  Schema Admin y Domain Admin
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-secondary/20 rounded-lg mt-2">
                  <p>Schema Admin y Domain Admin son roles de administración en Active Directory:</p>
                  <ul className="list-disc list-inside mt-2">

                    <li>Schema Admin: Permite modificar el esquema de Active Directory.</li>
                    <li>Domain Admin: Permite administrar todos los objetos y configuraciones de un dominio.</li>

                  </ul>

                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="hover:bg-secondary/50 px-4 py-2 rounded-lg transition-colors">
                  ¿Cuáles son los horarios de atención?
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-secondary/20 rounded-lg mt-2">
                  Nuestro equipo de atención al cliente está disponible de lunes a viernes, de 9:00 AM a 6:00 PM (hora local).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-b-0">
                <AccordionTrigger className="hover:bg-secondary/50 px-4 py-2 rounded-lg transition-colors">
                  ¿Cómo puedo restablecer mi contraseña?
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-secondary/20 rounded-lg mt-2">
                  Para restablecer su contraseña, haga clic en el enlace &quot;¿Olvidó su contraseña?&quot; en la página de inicio de sesión y siga las instrucciones enviadas a su correo electrónico registrado.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-b-0">
                <AccordionTrigger className="hover:bg-secondary/50 px-4 py-2 rounded-lg transition-colors">
                  ¿Ofrecen reembolsos?
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-secondary/20 rounded-lg mt-2">
                  Sí, ofrecemos reembolsos completos dentro de los 30 días posteriores a la compra si no está satisfecho con nuestro producto o servicio. Por favor, contacte con nuestro equipo de soporte para iniciar el proceso de reembolso.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" className="w-full justify-start transition-colors hover:bg-primary/10">
              <FileDown className="mr-2 h-4 w-4" /> Maquinas Windows 🪟
            </Button>
            <Button variant="outline" className="w-full justify-start transition-colors hover:bg-primary/10">
              <FileDown className="mr-2 h-4 w-4" /> Maquinas Linux 🐧
            </Button>
            <Button variant="outline" className="w-full justify-start transition-colors hover:bg-primary/10">
              <FileDown className="mr-2 h-4 w-4" /> Manual de Usuario
            </Button>
            <Button variant="outline" className="w-full justify-start transition-colors hover:bg-primary/10">
              <FileDown className="mr-2 h-4 w-4" /> Guía de Inicio Rápido
            </Button>

          </CardContent>
        </Card>
      </div>
      
   
    </div>
  )
}