"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, ArrowLeft, Terminal, Code, CheckCircle2 } from "lucide-react"
import CodeEditor from "@/components/code-editor"

export default function SQLInjectionCourse() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [userCode, setUserCode] = useState(`// Ejemplo de código vulnerable a SQL Injection
function loginUser(username, password) {
  // Esta consulta es vulnerable a SQL Injection
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  
  // Ejecutar la consulta en la base de datos
  return executeQuery(query);
}

// Función simulada para ejecutar la consulta
function executeQuery(query) {
  console.log("Ejecutando consulta:", query);
  return { success: true, query: query };
}`)

  const steps = [
    {
      title: "Introducción a SQL Injection",
      content: (
        <div className="space-y-4">
          <p>
            Las inyecciones SQL (SQL Injection) son uno de los ataques más comunes y peligrosos contra aplicaciones web.
            Ocurren cuando un atacante puede insertar o "inyectar" código SQL malicioso en una consulta que la
            aplicación envía a su base de datos.
          </p>

          <Alert className="bg-blue-900/20 border-blue-800">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle>¿Por qué es peligroso?</AlertTitle>
            <AlertDescription>
              Un ataque de SQL Injection exitoso puede permitir a los atacantes:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Acceder a datos sensibles</li>
                <li>Modificar datos en la base de datos</li>
                <li>Eliminar información importante</li>
                <li>En algunos casos, ejecutar comandos en el servidor</li>
              </ul>
            </AlertDescription>
          </Alert>

          <p>
            En este minicurso, aprenderás a identificar vulnerabilidades de SQL Injection, cómo explotarlas de manera
            ética y, lo más importante, cómo proteger tus aplicaciones contra ellas.
          </p>
        </div>
      ),
    },
    {
      title: "Identificando código vulnerable",
      content: (
        <div className="space-y-4">
          <p>
            El primer paso para entender las inyecciones SQL es identificar código vulnerable. Observa el siguiente
            ejemplo de una función de login típica:
          </p>

          <div className="p-4 bg-gray-800 rounded-md border border-gray-700 font-mono text-sm">
            <pre>{`function loginUser(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return executeQuery(query);
}`}</pre>
          </div>

          <p>
            Este código es vulnerable porque concatena directamente los valores de entrada del usuario en la consulta
            SQL. Si un atacante ingresa valores especiales, puede manipular la estructura de la consulta.
          </p>

          <Alert className="bg-yellow-900/20 border-yellow-800">
            <InfoIcon className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Ejemplo de ataque</AlertTitle>
            <AlertDescription>
              Si un atacante ingresa <code className="bg-gray-800 px-1 rounded">admin' --</code> como nombre de usuario,
              la consulta resultante sería:
              <div className="p-2 bg-gray-800 rounded-md mt-2 font-mono text-sm">
                SELECT * FROM users WHERE username = 'admin' --' AND password = 'cualquier_cosa'
              </div>
              El <code className="bg-gray-800 px-1 rounded">--</code> comenta el resto de la consulta, haciendo que la
              verificación de contraseña se ignore.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "Práctica: Explotar una vulnerabilidad",
      content: (
        <div className="space-y-4">
          <p>
            Ahora es tu turno de practicar. Modifica el código en el editor para explotar la vulnerabilidad de SQL
            Injection. Tu objetivo es modificar la función <code className="bg-gray-800 px-1 rounded">testLogin()</code>{" "}
            para que devuelva
            <code className="bg-gray-800 px-1 rounded">true</code> sin conocer la contraseña correcta.
          </p>

          <CodeEditor value={userCode} onChange={setUserCode} language="javascript" height="300px" />

          <Alert className="bg-blue-900/20 border-blue-800">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle>Pista</AlertTitle>
            <AlertDescription>
              Intenta usar comentarios SQL (<code className="bg-gray-800 px-1 rounded">--</code> o{" "}
              <code className="bg-gray-800 px-1 rounded">#</code>) o la cláusula{" "}
              <code className="bg-gray-800 px-1 rounded">OR</code> para manipular la lógica de la consulta.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => {
              if (!completedSteps.includes(2)) {
                setCompletedSteps([...completedSteps, 2])
              }
              setActiveStep(3)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar
          </Button>
        </div>
      ),
    },
    {
      title: "Prevención de SQL Injection",
      content: (
        <div className="space-y-4">
          <p>
            Ahora que entiendes cómo funcionan las inyecciones SQL, es crucial aprender a prevenirlas. Aquí hay algunas
            técnicas efectivas:
          </p>

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium text-green-500 mb-1">1. Uso de Consultas Parametrizadas</h3>
              <p className="text-gray-300">
                Las consultas parametrizadas (o preparadas) separan el código SQL de los datos, evitando que los datos
                del usuario se interpreten como código SQL.
              </p>
              <div className="p-4 bg-gray-800 rounded-md border border-gray-700 font-mono text-sm mt-2">
                <pre>{`// Ejemplo en Node.js con MySQL
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
connection.query(query, [username, password], function(error, results) {
  // Manejar resultados
});`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-500 mb-1">2. ORM (Object-Relational Mapping)</h3>
              <p className="text-gray-300">
                Utilizar un ORM como Sequelize, Prisma o TypeORM puede ayudar a prevenir inyecciones SQL al manejar
                automáticamente la sanitización de datos.
              </p>
              <div className="p-4 bg-gray-800 rounded-md border border-gray-700 font-mono text-sm mt-2">
                <pre>{`// Ejemplo con Prisma
const user = await prisma.user.findFirst({
  where: {
    username: username,
    password: password
  }
});`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-500 mb-1">3. Validación de Entrada</h3>
              <p className="text-gray-300">
                Siempre valida y sanitiza los datos de entrada del usuario antes de usarlos en consultas SQL.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-500 mb-1">4. Principio de Menor Privilegio</h3>
              <p className="text-gray-300">
                Utiliza cuentas de base de datos con los mínimos privilegios necesarios para la aplicación.
              </p>
            </div>
          </div>

          <Alert className="bg-green-900/20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Buena práctica</AlertTitle>
            <AlertDescription>
              Nunca confíes en los datos de entrada del usuario. Siempre valida, sanitiza y utiliza consultas
              parametrizadas para proteger tu aplicación contra inyecciones SQL.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => {
              if (!completedSteps.includes(3)) {
                setCompletedSteps([...completedSteps, 3])
              }
              setActiveStep(4)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar
          </Button>
        </div>
      ),
    },
    {
      title: "Ejercicio Final",
      content: (
        <div className="space-y-4">
          <p>
            Para finalizar este minicurso, vamos a corregir el código vulnerable que vimos anteriormente. Tu tarea es
            modificar la función <code className="bg-gray-800 px-1 rounded">loginUser</code> para que utilice consultas
            parametrizadas y sea segura contra inyecciones SQL.
          </p>

          <CodeEditor value={userCode} onChange={setUserCode} language="javascript" height="300px" />

          <Alert className="bg-blue-900/20 border-blue-800">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle>Solución de ejemplo</AlertTitle>
            <AlertDescription>
              <div className="p-2 bg-gray-800 rounded-md mt-2 font-mono text-sm">
                {`function loginUser(username, password) {
  // Usar consulta parametrizada
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  
  // Pasar los parámetros por separado
  return executeParameterizedQuery(query, [username, password]);
}

// Función simulada para ejecutar consulta parametrizada
function executeParameterizedQuery(query, params) {
  console.log("Ejecutando consulta segura:", query);
  console.log("Con parámetros:", params);
  return { success: true, query: query, params: params };
}`}
              </div>
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => {
              if (!completedSteps.includes(4)) {
                setCompletedSteps([...completedSteps, 4])
              }
              // Marcar el curso como completado en localStorage
              const completedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]")
              if (!completedCourses.includes("sql-injection")) {
                completedCourses.push("sql-injection")
                localStorage.setItem("completedCourses", JSON.stringify(completedCourses))
              }
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Completar curso
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/curso" className="text-green-500 hover:text-green-400 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a los cursos
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-green-500">Introducción a SQL Injection</h1>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Principiante
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  30 minutos
                </Badge>
              </div>
            </div>
          </div>

          <Tabs defaultValue="content" className="mb-8">
            <TabsList className="bg-gray-900 border-gray-800">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{steps[activeStep].title}</CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Paso {activeStep + 1} de {steps.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>{steps[activeStep].content}</CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="border-gray-700 text-gray-300"
                  >
                    Anterior
                  </Button>

                  {activeStep < steps.length - 1 && (
                    <Button
                      onClick={() => {
                        if (!completedSteps.includes(activeStep)) {
                          setCompletedSteps([...completedSteps, activeStep])
                        }
                        setActiveStep(activeStep + 1)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Siguiente
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Recursos adicionales</CardTitle>
                  <CardDescription>Enlaces y materiales complementarios para profundizar en el tema.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-green-500 mb-2">Documentación y guías</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://owasp.org/www-community/attacks/SQL_Injection"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <Code className="h-4 w-4 mr-2" />
                            OWASP: SQL Injection
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://portswigger.net/web-security/sql-injection"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <Code className="h-4 w-4 mr-2" />
                            PortSwigger: SQL Injection
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-green-500 mb-2">Herramientas de práctica</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://github.com/sqlmapproject/sqlmap"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <Terminal className="h-4 w-4 mr-2" />
                            SQLMap - Herramienta de detección y explotación de SQL Injection
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://www.hacksplaining.com/exercises/sql-injection"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <Terminal className="h-4 w-4 mr-2" />
                            Hacksplaining: SQL Injection Interactive Tutorial
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
