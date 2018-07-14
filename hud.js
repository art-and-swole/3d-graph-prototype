
// @todo fix this call back, it's just bad style
import { reenableControls } from './index.js'
const hud = document.getElementById('hud')
const hudContent = document.getElementById('hud-content')
const closeHud = document.getElementById('close-hud')

export const showHud = (node, _edges, callback) => {
  const edges = _edges.map(edge => {
    return `<li class="edges ${edge.state}" id="${edge.id}">${edge.title}</li>`
  }).join('')

  hudContent.innerHTML = `<h1>${node.name ? node.name : node.title}</h1>
    <section class="summary"><p>${marked(node.summary)}</p></section>
    <section>${marked(node.content)}</section>
    <ul>${edges}</ul>`

  const possibleEdges = document.getElementsByClassName("edges")
  for (var i = possibleEdges.length - 1; i >= 0; i--) {
    possibleEdges[i].addEventListener('click', function(e){
      showHud(callback(e.target.id))
    })
  }

  hud.classList.add('visible')

}

const hideHud = () => {
  hud.classList.remove('visible')

  // @todo fix this call back
  reenableControls()
}

closeHud.addEventListener('click', hideHud)