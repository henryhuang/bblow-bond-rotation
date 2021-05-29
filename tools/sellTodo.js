/**
 * Created by Henry Huang on 2021/5/26.
 */

const upRate = 1.032
const initialValue = 30.85
const share = 800

const fix2 = raw => {
  return Number(parseFloat(raw).toFixed(2))
}

/**
 * return {valueNew, shareNew}
 * @param valueNow
 * @param shareNow
 * @param upRate
 */
const sellIt = (valueNow, shareNow, upRate) => {
  if (shareNow >= 0) {
    console.log(`${valueNow}, ${shareNow}`)
    sellIt(fix2(valueNow * upRate), shareNow - 100, upRate)
  }
}

sellIt(initialValue, share, upRate)
console.log("================")
sellIt(28.87, 1100, upRate)
