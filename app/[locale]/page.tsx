"use client"

import type React from "react"
import Link from "next/link"
import { Shield, Code, Trophy, BookOpen, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function Home() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('/images/cyber-bg.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black"></div>

        <div className="container relative z-20 mx-auto px-4 py-32">
          <div className="flex flex-col items-center text-center">
            <Shield className="h-20 w-20 text-green-500 mb-6" />
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {t("home.title")}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mb-8 text-gray-300">{t("home.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="/ctf">
                  {t("home.ctfButton")} <Trophy className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-green-600 text-green-500 hover:bg-green-900/20"
              >
                <Link href="/curso">
                  {t("home.coursesButton")} <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-green-500">{t("home.whatYouWillLearn")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title={t("home.sqlInjection.title")}
            description={t("home.sqlInjection.description")}
            icon={<Code className="h-8 w-8 text-green-500" />}
            href="/curso/sql-injection"
          />

          <FeatureCard
            title={t("home.xss.title")}
            description={t("home.xss.description")}
            icon={<Code className="h-8 w-8 text-green-500" />}
            href="/curso/xss-intro"
          />

          <FeatureCard
            title={t("home.ctf.title")}
            description={t("home.ctf.description")}
            icon={<Trophy className="h-8 w-8 text-green-500" />}
            href="/ctf"
          />
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-green-500">{t("home.aboutSection.title")}</h2>
            <p className="text-lg text-gray-300 mb-8">{t("home.aboutSection.description")}</p>
            <Button asChild variant="outline" className="border-green-600 text-green-500 hover:bg-green-900/20">
              <Link href="/about">
                {t("home.aboutSection.learnMore")} <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  const t = useTranslations("common")

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-600 transition-all">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400 text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20 p-0">
          <Link href={href} className="flex items-center">
            {t("explore")} <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
