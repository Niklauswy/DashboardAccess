'use client'

import { FrownIcon, HomeIcon, RotateCcwIcon, Binary, Atom, Database, Dna, PiSquare, Microscope, Beaker, Cpu, Infinity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

const ScientificBackground = () => {
  const icons = [Binary, Atom, Database, Dna, PiSquare, Microscope, Beaker, Cpu, Infinity]
  return (
    <div className="fixed inset-0 overflow-hidden opacity-10">
      {Array.from({ length: 100 }).map((_, index) => {
        const Icon = icons[index % icons.length]
        return (
          <Icon
            key={index}
            className="absolute text-primary"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20 overflow-hidden">
      <ScientificBackground />
      <Card className="w-[400px] overflow-hidden shadow-lg backdrop-blur-sm bg-background/80">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <CardTitle className="text-2xl font-bold text-center">¡Ups! Error en el Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <FrownIcon className="w-32 h-32 text-red-500" /> 
          </div>
          <p className="text-center text-muted-foreground mb-4">
            Parece que hay una anomalía en el espacio-tiempo.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Estamos trabajando en resolverlo. Mientras tanto, puede intentar recargar o volver al inicio.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 p-6 bg-muted/50">
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 hover:bg-secondary"
          >
            <RotateCcwIcon className="w-4 h-4" />
            Recargar
          </Button>
          <Button asChild className="flex items-center gap-2">
            <Link href="/">
              <HomeIcon className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}