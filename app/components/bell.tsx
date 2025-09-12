import { BellIcon } from "lucide-react"

interface BellProps {
  className?: string
}

export default function Bell({ className }: BellProps) {
  return <BellIcon className={className} />
}
