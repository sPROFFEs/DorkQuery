"use client"

import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Lock } from "lucide-react"
import { useTranslations } from "next-intl"

export default function CTFPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-green-500">{t("challenges.title")}</h1>
          <p className="text-gray-400 mb-8">{t("challenges.description")}</p>

          <div className="grid gap-6">
            <ChallengeCard
              title={t("challenges.challenges.xssBasic.title")}
              description={t("challenges.challenges.xssBasic.description")}
              difficulty="beginner"
              category="web"
              href="/ctf/desafio1"
              locked={false}
            />

            <ChallengeCard
              title={t("challenges.challenges.inputValidation.title")}
              description={t("challenges.challenges.inputValidation.description")}
              difficulty="beginner"
              category="web"
              href="/ctf/desafio2"
              locked={false}
            />

            <ChallengeCard
              title={t("challenges.challenges.sqlInjection.title")}
              description={t("challenges.challenges.sqlInjection.description")}
              difficulty="intermediate"
              category="web"
              href="/ctf/desafio3"
              locked={false}
            />

            <ChallengeCard
              title={t("challenges.challenges.authBypass.title")}
              description={t("challenges.challenges.authBypass.description")}
              difficulty="advanced"
              category="web"
              href="/ctf/desafio4"
              locked={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChallengeCard({
  title,
  description,
  difficulty,
  category,
  href,
  locked,
}: {
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  href: string
  locked: boolean
}) {
  const t = useTranslations()

  const difficultyColor = {
    beginner: "bg-green-500/10 text-green-500 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  }[difficulty]

  const difficultyText = {
    beginner: t("challenges.difficulty.beginner"),
    intermediate: t("challenges.difficulty.intermediate"),
    advanced: t("challenges.difficulty.advanced"),
  }[difficulty]

  const categoryText = {
    web: t("challenges.category.web"),
    crypto: t("challenges.category.crypto"),
    forensics: t("challenges.category.forensics"),
    reversing: t("challenges.category.reversing"),
  }[category as "web" | "crypto" | "forensics" | "reversing"]

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-600 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={difficultyColor}>
              {difficultyText}
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              {categoryText}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {locked ? (
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              <span>{t("challenges.locked")}</span>
            </div>
          ) : (
            <span>0 {t("challenges.points")}</span>
          )}
        </div>
        <Button
          asChild
          variant="ghost"
          className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
          disabled={locked}
        >
          <Link href={locked ? "#" : href} className="flex items-center">
            {t("challenges.startChallenge")} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
