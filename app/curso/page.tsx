import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, BookOpen } from "lucide-react"

export default function CursoPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-green-500">Minicursos Interactivos</h1>
          <p className="text-gray-400 mb-8">
            Aprende conceptos de seguridad informática con estos minicursos interactivos. Cada módulo incluye ejemplos
            prácticos y código editable para experimentar.
          </p>

          <div className="grid gap-6">
            <CourseCard
              title="Introducción a SQL Injection"
              description="Aprende los fundamentos de las inyecciones SQL y cómo explotarlas de manera ética."
              duration="30 minutos"
              level="Principiante"
              href="/curso/sql-injection"
            />

            <CourseCard
              title="Cross-Site Scripting (XSS)"
              description="Descubre cómo funcionan los ataques XSS y cómo proteger tus aplicaciones web."
              duration="45 minutos"
              level="Principiante"
              href="/curso/xss-intro"
            />

            <CourseCard
              title="Seguridad en Formularios Web"
              description="Aprende a validar entradas de usuario y prevenir ataques comunes en formularios."
              duration="40 minutos"
              level="Intermedio"
              href="/curso/form-security"
            />

            <CourseCard
              title="Autenticación Segura"
              description="Implementa sistemas de autenticación robustos y evita vulnerabilidades comunes."
              duration="60 minutos"
              level="Intermedio"
              href="/curso/secure-auth"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseCard({
  title,
  description,
  duration,
  level,
  href,
}: {
  title: string
  description: string
  duration: string
  level: "Principiante" | "Intermedio" | "Avanzado"
  href: string
}) {
  const levelColor = {
    Principiante: "bg-green-500/10 text-green-500 border-green-500/20",
    Intermedio: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Avanzado: "bg-red-500/10 text-red-500 border-red-500/20",
  }[level]

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-600 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <Badge variant="outline" className={levelColor}>
            {level}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{duration}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>Incluye ejemplos prácticos</span>
        </div>
        <Button asChild variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
          <Link href={href} className="flex items-center">
            Comenzar <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
