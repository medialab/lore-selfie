

function DayPage({
  label,
  events,
  format,
  imposed,
  type = 'left'
}) {
  return (
    <section className={`page DayPage ${format}  ${imposed ? 'is-imposed' : ''}`}>
      <h2
        dangerouslySetInnerHTML={{
          __html: label
        }}
      />
      {type}
    </section>
  )
}
export default DayPage;