"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Code, BookOpen, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-green-500 hover:text-green-400 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("common.backToHome")}
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-green-500">{t("about.title")}</h1>

          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  {t("about.title")}
                </CardTitle>
                <CardDescription>{t("about.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t("about.description.part1")}</p>
                <p>{t("about.description.part2")}</p>
                <p>{t("about.description.part3")}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2 text-green-500" />
                  {t("about.features.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">{t("about.features.ctf.title")}</h3>
                    <ul className="space-y-2 text-gray-300">
                      {t("about.features.ctf.items").map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">{t("about.features.courses.title")}</h3>
                    <ul className="space-y-2 text-gray-300">
                      {t("about.features.courses.items").map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                  {t("about.technologies.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">
                      {t("about.technologies.frontend.title")}
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      {t("about.technologies.frontend.items").map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-md">
                    <h3 className="text-lg font-medium text-green-500 mb-2">{t("about.technologies.storage.title")}</h3>
                    <ul className="space-y-2 text-gray-300">
                      {t("about.technologies.storage.items").map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Github className="h-5 w-5 mr-2 text-green-500" />
                  {t("about.contribute.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t("about.contribute.description")}</p>
                <ul className="space-y-2 text-gray-300">
                  {t("about.contribute.items").map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Github className="h-4 w-4 mr-2" />
                    {t("about.contribute.github")}
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
