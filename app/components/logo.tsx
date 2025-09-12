"use client"

import Image from "next/image"

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="/wiser-logo.png"
        alt="Wiser Logo"
        width={125}
        height={25}
        className="h-[25px] w-auto sm:h-[25px] md:h-[25px] lg:h-[25px] mt-0.5"
        priority
      />
    </div>
  )
}
