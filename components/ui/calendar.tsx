"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-transparent w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row",
        month: "w-full space-y-4",
        caption: "flex justify-between items-center mb-4 px-1",
        caption_label: "text-lg font-semibold text-black",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 border-gray-300 hover:bg-gray-100 text-black",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex justify-between",
        head_cell: "text-black font-medium text-sm w-[calc(100%/7)] text-center pb-2",
        row: "flex w-full mt-2 justify-between",
        cell: "text-center text-sm p-0 relative w-[calc(100%/7)] aspect-square flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full p-2 font-normal text-black aria-selected:opacity-100",
        ),
        day_range_start: "day-range-start rounded-l-full",
        day_range_end: "day-range-end rounded-r-full",
        day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
        day_today: "bg-gray-200 text-black rounded-full",
        day_outside: "text-black opacity-50",
        day_disabled: "text-black opacity-50",
        day_range_middle: "aria-selected:bg-black aria-selected:text-white rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function CustomCaption({ ...props }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation()
  return (
    <div className="flex justify-between items-center">
      <h2 className="font-semibold text-lg text-black">{format(props.displayMonth, "MMMM yyyy")}</h2>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent border-gray-300"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
        >
          <ChevronLeft className="h-4 w-4 text-black" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent border-gray-300"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
        >
          <ChevronRight className="h-4 w-4 text-black" />
        </Button>
      </div>
    </div>
  )
}

export { Calendar }
