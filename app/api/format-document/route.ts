import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const portfolioSchema = z.object({
  title: z.string(),
  description: z.string(),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      imageUrl: z.string().optional(),
      projectUrl: z.string().optional(),
    }),
  ),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      description: z.string(),
    }),
  ),
})

const cvSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    summary: z.string(),
  }),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      description: z.string(),
      achievements: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      duration: z.string(),
      gpa: z.string().optional(),
    }),
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { fileContent, fileType, documentType } = await request.json()

    if (!fileContent || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const schema = documentType === "portfolio" ? portfolioSchema : cvSchema
    const prompt =
      documentType === "portfolio"
        ? `Extract and format the following portfolio content into a structured format. Focus on projects, skills, and experience. Content: ${fileContent}`
        : `Extract and format the following CV/resume content into a structured format. Focus on work experience, education, skills, and achievements. Content: ${fileContent}`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema,
      prompt,
    })

    return NextResponse.json({
      success: true,
      formattedData: object,
      documentType,
    })
  } catch (error) {
    console.error("Document formatting error:", error)
    return NextResponse.json(
      {
        error: "Failed to format document",
      },
      { status: 500 },
    )
  }
}
