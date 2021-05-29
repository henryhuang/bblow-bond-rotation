/**
 * Created by Henry Huang on 2021/5/23.
 */

// 只能执行一次，再次执行需要刷新页面
// https://www.jisilu.cn/data/cbnew/#cb

const priceString = "现&nbsp;价"
const shuangDi = "双低"

findSortedMethod = () => {
  let sorted = $("#flex_cb > thead > tr:nth-child(2) > th.header.sticky.headerSortDown").html()
  if (!sorted) {
    sorted = $("#flex_cb > thead > tr:nth-child(2) > th.header.sticky.headerSortUp").html()
  }
  console.log(`sort method is ${sorted}`)
  return sorted
}

clickSortByColumnName = (isPrice) => {
  return new Promise((resolve) => {
    $(`#flex_cb > thead > tr:nth-child(2) > th:nth-child(${isPrice ? "3" : "27"})`).click()
    setTimeout(resolve, 3000)
  })
}

isAscSorted = () => {
  return $("#flex_cb > thead > tr:nth-child(2) > th.header.sticky.headerSortDown").is(":visible")
}

isDescSorted = () => {
  return $("#flex_cb > thead > tr:nth-child(2) > th.header.sticky.headerSortUp").is(":visible")
}

clickSortWithAscOrder = () => {
  $("#flex_cb > thead > tr:nth-child(2) > th.header.sticky.headerSortUp").click()
}

clickSort = () => {
  if (isAscSorted()) {
    // already sorted
    console.log("No need to sort by price, because already sorted with ascending order")
  } else if (isDescSorted()) {
    console.log("Should resort, because sorted with descending order")
    clickSortWithAscOrder()
  }
}

// click sort by price
findMidPrice = () => {
  return new Promise((resolve) => {
    sortByPrice().then(() => {
      const allItems = $("#flex_cb > tbody").children("tr")
      const size = allItems.length
      resolve(findPrice(allItems[parseInt(size * 0.5)]))
    })
  })
}

sortByPrice = () => {
  return new Promise((resolve) => {
    const sortMethod = findSortedMethod()
    if (sortMethod === priceString) {
      console.log("Found sort method is price")
      clickSort()
    } else {
      console.log("Found sort method is NOT price, then click sort by price")
      clickSortByColumnName(true).then(() => {
        if (!isAscSorted()) {
          // resort to confirm ascending order
          clickSortWithAscOrder()
        }
      })
    }
    setTimeout(resolve, 5000)
  })
}
// sortByPrice()

sortByShuangDi = () => {
  return new Promise((resolve) => {
    const sortMethod = findSortedMethod()
    if (sortMethod === shuangDi) {
      console.log("Found sort method is shuangDi")
      clickSort()
    } else {
      console.log("Found sort method is NOT shuangDi, then click sort by shuangDi")
      clickSortByColumnName(false).then(() => {
        if (!isAscSorted()) {
          // resort to confirm ascending order
          clickSortWithAscOrder()
        }
      })
    }
    setTimeout(resolve, 5000)
  })

}

findPrice = (item) => {
  const html = $(item).children("td[data-name='price']").html()
  return Number(html)
}

/**
 * 溢价率
 * @param item
 * @returns {number}
 */
findPremiumRt = (item) => {
  const html = $(item).children("td[data-name='premium_rt']").html()
  return parseFloat(html)
}

/**
 * 剩余价值
 * @param item
 */
findCurrIssAmt = (item) => {
  const html = $(item).children("td[data-name='curr_iss_amt']").html()
  return Number(html)
}

findBondId = item => $(item).children("td[data-name='bond_id']").children('a').html()

findName = item => $(item).children("td[data-name='bond_nm']").html()

findDBlow = item => $(item).children("td[data-name='dblow']").html()

exportCSV = (contentString) => {
  const csvContent = "data:text/csv;charset=utf-8,"
      + contentString;
  const encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

findMidPrice().then((midPrice) => {
  console.log(`Mid-price is ${midPrice}`)
  sortByShuangDi().then(() => {
    const pickRate = 0.1
    const maxPremiumRt = 20
    const maxPickCount = 20
    const allItems = $("#flex_cb > tbody").children("tr")
    const size = allItems.length
    const pickSize = size * pickRate
    const subItems = allItems.splice(0, pickSize)
    console.log(`SubItems size is ${subItems.length}`)
    const itemsFilterByPremiumRtAndMidPrice = []
    subItems.forEach((item) => {
      const premiumRt = findPremiumRt(item)
      const price = findPrice(item)
      if (premiumRt <= maxPremiumRt && price < midPrice) {
        itemsFilterByPremiumRtAndMidPrice.push(item)
      }
    })
    console.log(`Items filter by premium rt and mid price, then size is ${itemsFilterByPremiumRtAndMidPrice.length}`)
    // sort by CurrIssAmt
    let sorted = itemsFilterByPremiumRtAndMidPrice.sort((a, b) => {
      return findCurrIssAmt(a) - findCurrIssAmt(b)
    })
    const maxItems = sorted.splice(0, maxPickCount)
    // sort by ShuangDi
    sorted = maxItems.sort((a, b) => {
      return findDBlow(a) - findDBlow(b)
    })

    let csvContent = ""
    const titleRow = "代码, 转债名称, 现价, 溢价率, 剩余规模, 双低"
    console.log(titleRow)
    csvContent = csvContent + titleRow + "\n"
    sorted.forEach(item => {
      const row = `${findBondId(item)}, ${findName(item)}, ${findPrice(item)}, ${findPremiumRt(item)}, ${findCurrIssAmt(item)}, ${findDBlow(item)}`
      console.log(row)
      csvContent = csvContent + row + "\n"
    })
    exportCSV(csvContent)
  })
})
