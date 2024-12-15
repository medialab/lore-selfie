import { useMemo } from "react";


function Cover({
  format,
  days,
  imposed
}) {
  const firstDay = useMemo(() => Object.keys(days).length ? days[Object.keys(days)[0]].label : null, [days])
  const lastDay = useMemo(() => Object.keys(days).length ? days[Object.keys(days)[Object.keys(days).length - 1]].label : null, [days])
  if (!firstDay || !lastDay) {
    return (
      <section className={`page cover ${format} ${imposed ? 'is-imposed' : ''}`}>
      <h2>{'Lore selfie'}</h2>
      <h3>
        Chargement
      </h3>
    </section>
    )
  }
  return (
    <section className={`page cover ${format} ${imposed ? 'is-imposed' : ''}`}>
      <h2>{'Lore selfie'}</h2>
      <h3 
        dangerouslySetInnerHTML={{
          __html: `Du ${firstDay} au ${lastDay}`
        }}
      />        
    </section>
  )

}

export default Cover;