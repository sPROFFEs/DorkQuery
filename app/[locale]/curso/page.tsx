"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, BookOpen } from "lucide-react"
import { useTranslations } from "next-intl"

export default function CursoPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-green-500">{t("courses.title")}</h1>
          <p className="text-gray-400 mb-8">{t("courses.description")}</p>

          <div className="grid gap-6">
            <CourseCard
              title={t("courses.courses.sqlInjection.title")}
              description={t("courses.courses.sqlInjection.description")}
              duration={t("courses.courses.sqlInjection.duration")}
              level="beginner"
              href="/curso/sql-injection"
            />

            <CourseCard
              title={t("courses.courses.xss.title")}
              description={t("courses.courses.xss.description")}
              duration={t("courses.courses.xss.duration")}
              level="beginner"
              href="/curso/xss-intro"
            />

            <CourseCard
              title={t("courses.courses.formSecurity.title")}
              description={t("courses.courses.formSecurity.description")}
              duration={t("courses.courses.formSecurity.duration")}
              level="intermediate"
              href="/curso/form-security"
            />

            <CourseCard
              title={t("courses.courses.secureAuth.title")}
              description={t("courses.courses.secureAuth.description")}
              duration={t("courses.courses.secureAuth.duration")}
              level="intermediate"
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
  level: "beginner" | "intermediate" | "advanced"
  href: string
}) {
  const t = useTranslations()

  const levelColor = {
    beginner: "bg-green-500/10 text-green-500 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  }[level]

  const levelText = {
    beginner: t("courses.level.beginner"),
    intermediate: t("courses.level.intermediate"),
    advanced: t("courses.level.advanced"),
  }[level]

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-600 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <Badge variant="outline" className={levelColor}>
            {levelText}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            {duration} {t("courses.duration")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{t("courses.includes")}</span>
        </div>
        <Button asChild variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
          <Link href={href} className="flex items-center">
            {t("common.start")} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
