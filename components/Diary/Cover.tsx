import { useMemo } from "react"

import type { DiaryDataByDayType } from "~types/common"

interface CoverProps {
  format: string
  days: DiaryDataByDayType
  imposed: boolean
  editionTitle: string
}
function Cover({
  format,
  days,
  imposed,
  editionTitle = "lore selfie"
}: CoverProps) {
  const firstDay: string = useMemo(
    () => (Object.keys(days).length ? days[Object.keys(days)[0]].label : null),
    [days]
  )
  const lastDay: string = useMemo(
    () =>
      Object.keys(days).length
        ? days[Object.keys(days)[Object.keys(days).length - 1]].label
        : null,
    [days]
  )
  if (!firstDay || !lastDay) {
    return (
      <section
        className={`page cover ${format} ${imposed ? "is-imposed" : ""}`}>
        <h2>{editionTitle}</h2>
        <h3>Chargement</h3>
      </section>
    )
  }
  return (
    <section className={`page cover ${format} ${imposed ? "is-imposed" : ""}`}>
      <div className="cover-header">
        <div>
          <h1>{editionTitle}</h1>
          <h3
            dangerouslySetInnerHTML={{
              __html: `Mon activité du ${firstDay.toLowerCase()} au ${lastDay.toLowerCase()}`
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default Cover
