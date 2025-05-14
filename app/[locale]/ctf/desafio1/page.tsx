"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { validateFlag } from "@/lib/validate-flag"
import { useTranslations } from "next-intl"
import { AutoTranslate } from "@/components/auto-translate"
import { DynamicContentTranslator } from "@/components/dynamic-content-translator"
import { useTranslation } from "@/contexts/translation-context"

export default function XSSChallenge() {
  const t = useTranslations()
  const { translationMode, currentLocale } = useTranslation()
  const [userInput, setUserInput] = useState("")
  const [output, setOutput] = useState<string>("")
  const [flagInput, setFlagInput] = useState("")
  const [flagStatus, setFlagStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [hints, setHints] = useState<string[]>([])
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [completed, setCompleted] = useState(false)

  // Verificar si el desafío ya fue completado
  useEffect(() => {
    const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]")
    if (completedChallenges.includes("desafio1")) {
      setCompleted(true)
    }
  }, [])

  // Dynamic content that needs translation
  const challengeContent = {
    hints: [
      "El sitio muestra directamente lo que ingresas sin filtrar. ¿Qué pasaría si ingresas código HTML?",
      "Prueba a insertar una etiqueta <script> con código JavaScript.",
      "Para obtener la flag, necesitas hacer que se ejecute un alert() con el mensaje 'xss'.",
    ],
  }

  const renderOutput = () => {
    // Simulamos un sitio vulnerable a XSS que muestra directamente el input del usuario
    const outputDiv = document.createElement("div")
    outputDiv.innerHTML = userInput
    return outputDiv.innerHTML
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOutput(renderOutput())
  }

  const revealHint = () => {
    if (hintsRevealed < challengeContent.hints.length) {
      setHints([...hints, challengeContent.hints[hintsRevealed]])
      setHintsRevealed(hintsRevealed + 1)
    }
  }

  const checkFlag = () => {
    const isCorrect = validateFlag("desafio1", flagInput)

    if (isCorrect) {
      setFlagStatus("success")
      setMessage(t("challenge.xssBasic.submitFlag.success"))

      // Guardar progreso en localStorage
      const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]")
      if (!completedChallenges.includes("desafio1")) {
        completedChallenges.push("desafio1")
        localStorage.setItem("completedChallenges", JSON.stringify(completedChallenges))
      }

      setCompleted(true)
    } else {
      setFlagStatus("error")
      setMessage(t("challenge.xssBasic.submitFlag.error"))
    }
  }

  // Interceptar alert() para detectar cuando el usuario resuelve el desafío
  useEffect(() => {
    const originalAlert = window.alert
    window.alert = (message) => {
      if (message === "xss") {
        setFlagInput("CTF{xss_alert_executed}")
        setFlagStatus("success")
        setMessage(t("challenge.xssBasic.submitFlag.foundFlag") + " CTF{xss_alert_executed}")

        // Guardar progreso
        const completedChallenges = JSON.parse(localStorage.getItem("completedChallenges") || "[]")
        if (!completedChallenges.includes("desafio1")) {
          completedChallenges.push("desafio1")
          localStorage.setItem("completedChallenges", JSON.stringify(completedChallenges))
        }

        setCompleted(true)
      }
      return originalAlert.call(window, message)
    }

    return () => {
      window.alert = originalAlert
    }
  }, [t])

  return (
    <DynamicContentTranslator content={challengeContent} sourceLang="es">
      {(translatedContent) => (
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link href="/ctf" className="text-green-500 hover:text-green-400 flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("common.backToChallenges")}
                </Link>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-green-500">{t("challenge.xssBasic.title")}</h1>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {t("challenges.difficulty.beginner")}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {t("challenges.category.web")}
                    </Badge>
                    {completed && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {t("challenges.completed")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Card className="bg-gray-900 border-gray-800 mb-8">
                <CardHeader>
                  <CardTitle>{t("challenge.xssBasic.description")}</CardTitle>
                  <CardDescription>{t("challenge.xssBasic.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-blue-900/20 border-blue-800">
                    <InfoIcon className="h-4 w-4 text-blue-500" />
                    <AlertTitle>{t("challenge.xssBasic.objective.title")}</AlertTitle>
                    <AlertDescription>{t("challenge.xssBasic.objective.description")}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Tabs defaultValue="challenge">
                <TabsList className="bg-gray-900 border-gray-800">
                  <TabsTrigger value="challenge">{t("challenge.xssBasic.tabs.challenge")}</TabsTrigger>
                  <TabsTrigger value="hints">
                    {t("challenge.xssBasic.tabs.hints")} ({hintsRevealed}/{translatedContent.hints.length})
                  </TabsTrigger>
                  <TabsTrigger value="submit">{t("challenge.xssBasic.tabs.submit")}</TabsTrigger>
                </TabsList>

                <TabsContent value="challenge" className="mt-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>{t("challenge.xssBasic.vulnerableWebsite.title")}</CardTitle>
                      <CardDescription>{t("challenge.xssBasic.vulnerableWebsite.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="userInput" className="block text-sm font-medium text-gray-400 mb-1">
                            {t("challenge.xssBasic.vulnerableWebsite.inputLabel")}
                          </label>
                          <Input
                            id="userInput"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          {t("challenge.xssBasic.vulnerableWebsite.submitButton")}
                        </Button>
                      </form>

                      {output && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">
                            {t("challenge.xssBasic.vulnerableWebsite.resultLabel")}
                          </h3>
                          <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                            <div dangerouslySetInnerHTML={{ __html: output }} />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hints" className="mt-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>{t("challenge.xssBasic.tabs.hints")}</CardTitle>
                      <CardDescription>{t("challenge.xssBasic.hints.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hints.length > 0 ? (
                        <div className="space-y-3">
                          {hints.map((hint, index) => (
                            <Alert key={index} className="bg-yellow-900/20 border-yellow-800">
                              <InfoIcon className="h-4 w-4 text-yellow-500" />
                              <AlertDescription>
                                {translationMode === "auto" && currentLocale !== "es" ? (
                                  <AutoTranslate text={hint} sourceLang="es" />
                                ) : (
                                  hint
                                )}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">{t("challenge.xssBasic.hints.noHints")}</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={revealHint}
                        disabled={hintsRevealed >= translatedContent.hints.length}
                        variant="outline"
                        className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                      >
                        {t("challenge.xssBasic.hints.revealHint")} {hintsRevealed + 1}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="submit" className="mt-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>{t("challenge.xssBasic.submitFlag.title")}</CardTitle>
                      <CardDescription>{t("challenge.xssBasic.submitFlag.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="flagInput" className="block text-sm font-medium text-gray-400 mb-1">
                            {t("challenge.xssBasic.submitFlag.inputLabel")}
                          </label>
                          <Input
                            id="flagInput"
                            value={flagInput}
                            onChange={(e) => setFlagInput(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                            placeholder={t("challenge.xssBasic.submitFlag.placeholder")}
                          />
                        </div>

                        {flagStatus !== "idle" && (
                          <Alert
                            className={
                              flagStatus === "success"
                                ? "bg-green-900/20 border-green-800"
                                : "bg-red-900/20 border-red-800"
                            }
                          >
                            {flagStatus === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <AlertDescription>{message}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={checkFlag}
                        className={completed ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}
                      >
                        {completed
                          ? t("challenge.xssBasic.submitFlag.completedButton")
                          : t("challenge.xssBasic.submitFlag.verifyButton")}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </DynamicContentTranslator>
  )
}
