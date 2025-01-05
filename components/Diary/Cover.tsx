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
      <h2>{'lore selfie'}</h2>
      <h3>
        Chargement
      </h3>
    </section>
    )
  }
  return (
    <section className={`page cover ${format} ${imposed ? 'is-imposed' : ''}`}>
      <div className="cover-header">
        <div>
        <h1>{'lore selfie'}</h1>
        <h3 
          dangerouslySetInnerHTML={{
            __html: `Du ${firstDay} au ${lastDay}`
          }}
        /> 
        </div>
      </div>       
    </section>
  )

}

export default Cover;