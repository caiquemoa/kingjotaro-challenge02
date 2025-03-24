const fs = require('fs').promises
let after = 0

const allProducts = []

async function fetchData() {
  try {
    const totalPages = await getTotalPages()

    for (let i = 0; i < totalPages; i++) {
      const response = await fetch(
        `https://mercado.carrefour.com.br/api/graphql?operationName=ProductsQuery&variables=%7B"isPharmacy"%3Afalse%2C"first"%3A100%2C"after"%3A"${after}"%2C"sort"%3A"score_desc"%2C"term"%3A""%2C"selectedFacets"%3A%5B%7B"key"%3A"category-1"%2C"value"%3A"bebidas"%7D%2C%7B"key"%3A"category-1"%2C"value"%3A"4599"%7D%2C%7B"key"%3A"channel"%2C"value"%3A"%7B%5C"salesChannel%5C"%3A2%2C%5C"regionId%5C"%3A%5C"v2.16805FBD22EC494F5D2BD799FE9F1FB7%5C"%7D"%7D%2C%7B"key"%3A"locale"%2C"value"%3A"pt-BR"%7D%2C%7B"key"%3A"region-id"%2C"value"%3A"v2.16805FBD22EC494F5D2BD799FE9F1FB7"%7D%5D%7D`
      )
      const { data } = await response.json()

      const { edges } = data.search.products
      const products = edges.map((item, index) => {
        console.log(
          `carregando de ${index + after + 1} itens totais: ${
            data.search.products.pageInfo.totalCount
          }`
        )
        return {
          itemCount: index + after + 1,
          name: item.node.name,
          price: {
            listPrice: item.node.offers.offers[0]
              ? item.node.offers.offers[0].listPrice
              : item.node.offers.lowPrice,
            priceWithDiscount: item.node.offers.offers[0]
              ? item.node.offers.offers[0].price
              : item.node.offers.lowPrice,
          },
          image: item.node.image[0].url,
          url: `https://mercado.carrefour.com.br/${item.node.slug}/p`,
        }
      })

      after += 100
      allProducts.push(...products)
    }
    await fs.writeFile(
      'output.json',
      JSON.stringify(allProducts, null, 2),
      'utf8'
    )
    console.log('done')
  } catch (error) {
    console.error('Erro no fetch:', error)
  }
}

async function getTotalPages() {
  try {
    const response = await fetch(
      'https://mercado.carrefour.com.br/api/graphql?operationName=ProductsQuery&variables=%7B"isPharmacy"%3Afalse%2C"first"%3A100%2C"after"%3A"0"%2C"sort"%3A"score_desc"%2C"term"%3A""%2C"selectedFacets"%3A%5B%7B"key"%3A"category-1"%2C"value"%3A"bebidas"%7D%2C%7B"key"%3A"category-1"%2C"value"%3A"4599"%7D%2C%7B"key"%3A"channel"%2C"value"%3A"%7B%5C"salesChannel%5C"%3A2%2C%5C"regionId%5C"%3A%5C"v2.16805FBD22EC494F5D2BD799FE9F1FB7%5C"%7D"%7D%2C%7B"key"%3A"locale"%2C"value"%3A"pt-BR"%7D%2C%7B"key"%3A"region-id"%2C"value"%3A"v2.16805FBD22EC494F5D2BD799FE9F1FB7"%7D%5D%7D'
    )
    const { data } = await response.json()
    return Math.ceil(data.search.products.pageInfo.totalCount / 100)
  } catch (error) {
    console.error('Erro no fetch:', error)
  }
}

fetchData()
