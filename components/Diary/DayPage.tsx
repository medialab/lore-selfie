

function DayPage({
  label,
  events,
  format,
  imposed,
}) {
  return (
    <section className={`page DayPage ${format}  ${imposed ? 'is-imposed' : ''}`}>
      <h2
        dangerouslySetInnerHTML={{
          __html: label
        }}
      />
    </section>
  )
}
export default DayPage;