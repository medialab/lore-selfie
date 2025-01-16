import { useMemo } from "react"

interface A5ImposedProps {
  renderPage: Function
  numberOfPages: number
}
function A5Imposed({ renderPage, numberOfPages }: A5ImposedProps) {
  const doublePagesIndexes: Array<[number, number]> = useMemo(() => {
    // const renderedPages = pages();
    // let numberOfPages = (frontPage ? 1 : 0) + renderedPages.length;
    const roundNumberOfPages =
      numberOfPages % 4 === 0
        ? numberOfPages
        : numberOfPages - (numberOfPages % 4) + 4
    const pairs = []
    let reversed = true
    let i = 0
    let j = roundNumberOfPages - 1
    while (i < j && j > 0) {
      if (reversed) {
        pairs.push([j, i])
      } else {
        pairs.push([i, j])
      }
      reversed = !reversed
      i++
      j--
    }
    return pairs
  }, [numberOfPages])
  return (
    <>
      {doublePagesIndexes.map(([i1, i2], index) => (
        <section key={index} className={`page A4-landscape imposition-page`}>
          {renderPage(i1)}
          {renderPage(i2)}
        </section>
      ))}
    </>
  )
}

export default A5Imposed
