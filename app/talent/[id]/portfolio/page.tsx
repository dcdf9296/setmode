"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { getTalentBySlug, type PortfolioItem, type Talent } from "@/lib/data-store"

type FlattenedImage = {
  imageUrl: string
  item: PortfolioItem
}

function PortfolioPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const id = typeof params.id === "string" ? params.id : null
  const initialIndexParam = searchParams.get("index")

  const [talent, setTalent] = useState<Talent | null>(null)
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Fetch data only when ID changes
  useEffect(() => {
    if (id) {
      const talentData = getTalentBySlug(id)
      setTalent(talentData)
    }
  }, [id])

  // Memoize flattened images to prevent re-calculation on every render
  const allImages = useMemo(() => {
    if (!talent) return []
    return talent.portfolio.flatMap((item) => item.imageUrls.map((url) => ({ imageUrl: url, item })))
  }, [talent])

  // Determine initial selected index only when params or data change
  useEffect(() => {
    if (!talent || allImages.length === 0) return

    const initialPortfolioIndex = Number.parseInt(initialIndexParam || "0", 10)
    const initialPortfolioItem = talent.portfolio[initialPortfolioIndex]

    let finalIndex = 0
    if (initialPortfolioItem) {
      const initialImageIndex = allImages.findIndex((img) => img.item.id === initialPortfolioItem.id)
      finalIndex = initialImageIndex >= 0 ? initialImageIndex : 0
    }

    setSelectedIndex(finalIndex)
  }, [initialIndexParam, talent, allImages])

  // Sync carousel to selectedIndex when it's ready
  useEffect(() => {
    if (api && api.selectedScrollSnap() !== selectedIndex) {
      api.scrollTo(selectedIndex, true)
    }
  }, [api, selectedIndex])

  // Handle user interaction with carousel
  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  const currentItem = allImages[selectedIndex]?.item

  if (!talent || allImages.length === 0 || !currentItem) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-black">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="p-4 flex-shrink-0 absolute top-0 left-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/80 hover:bg-white"
          onClick={() => router.back()}
        >
          <X className="h-5 w-5 text-black" />
        </Button>
      </header>

      <main className="pt-20">
        <div className="text-center px-4 pb-8">
          <p className="text-sm text-gray-500">{currentItem.year}</p>
          <h2 className="text-xl font-bold text-black">{currentItem.title}</h2>
          <p className="text-md text-gray-700">{currentItem.role}</p>
        </div>

        <div className="relative">
          <Carousel setApi={setApi} className="w-full" opts={{ startIndex: selectedIndex, loop: true }}>
            <CarouselContent>
              {allImages.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative">
                    <Image
                      src={img.imageUrl || "/placeholder.svg"}
                      alt={`${img.item.title} image ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollPrev()}
                className="rounded-full bg-white/80 hover:bg-white shadow-md"
              >
                <ChevronLeft className="h-6 w-6 text-black" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollNext()}
                className="rounded-full bg-white/80 hover:bg-white shadow-md"
              >
                <ChevronRight className="h-6 w-6 text-black" />
              </Button>
            </div>
          </Carousel>
        </div>
      </main>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-white">
          <p className="text-black">Loading...</p>
        </div>
      }
    >
      <PortfolioPageContent />
    </Suspense>
  )
}
