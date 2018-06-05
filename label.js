const el = document.getElementById("label")

export const showLabel = (node, position) => {
  // console.log(node, position)
  let title = node.properties && node.properties.title ? node.properties.title : node.type ? node.type : 'TITLE T/K'
  el.innerHTML = `<span>${title}</span>`
  el.style = `left:${position.x+30}px;top:${position.y-10}px`
}

export const hideLabel = () => {
  el.innterHTML = ''
}