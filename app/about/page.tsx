import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Code, BookOpen, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-green-500 hover:text-green-400 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al inicio
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-green-500">Sobre el Proyecto</h1>

          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Hacking Ético Interactivo
                </CardTitle>
                <CardDescription>
                  Una plataforma educativa para aprender ciberseguridad de forma práctica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Este proyecto nace con el objetivo de proporcionar un entorno seguro y accesible para que
                  principiantes en ciberseguridad y estudiantes de hacking ético puedan practicar habilidades reales
                  directamente desde su navegador, sin necesidad de configurar entornos complejos.
                </p>
                <p>
                  A través de desafíos tipo CTF (Capture The Flag) y minicursos interactivos, los usuarios pueden
                  aprender conceptos fundamentales de seguridad informática, como inyecciones SQL, Cross-Site Scripting
                  (XSS), validación de entradas y mucho más, todo ello en un entorno controlado y ético.
                </p>
                <p>
                  Todas las vulnerabilidades y técnicas presentadas en esta plataforma son con fines educativos, y
                  promovemos el uso responsable y ético de estos conocimientos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2 text-green-500" />
                  Características principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">Desafíos CTF</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Retos prácticos de seguridad</li>
                      <li>• Sistema de pistas y niveles</li>
                      <li>• Validación de flags</li>
                      <li>• Seguimiento de progreso</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">Minicursos</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Explicaciones paso a paso</li>
                      <li>• Código editable</li>
                      <li>• Ejemplos prácticos</li>
                      <li>• Recursos adicionales</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                  Tecnologías utilizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">Frontend</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Next.js (React)</li>
                      <li>• Tailwind CSS</li>
                      <li>• Shadcn UI</li>
                      <li>• Monaco Editor (para código)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">Almacenamiento</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• LocalStorage (progreso)</li>
                      <li>• Archivos estáticos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Github className="h-5 w-5 mr-2 text-green-500" />
                  Contribuir al proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Este proyecto es de código abierto y las contribuciones son bienvenidas. Si deseas colaborar, puedes
                  hacerlo de las siguientes maneras:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Añadir nuevos desafíos CTF</li>
                  <li>• Crear minicursos sobre temas de seguridad</li>
                  <li>• Mejorar la documentación</li>
                  <li>• Reportar errores o sugerir mejoras</li>
                </ul>
                <div className="mt-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Github className="h-4 w-4 mr-2" />
                    Ver en GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
