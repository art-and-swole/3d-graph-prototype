
const hud = document.getElementById('hud')
const hudContent = document.getElementById('hud-content')
const closeHud = document.getElementById('close-hud')

export const showHud = node => {
  const edges = getEdges(node.id).map(edge => {
    return `<li class="edges" id="${edge.id}">${edge.id}</li>`
  }).join('')


  hudContent.innerHTML = `<h1>${node.name ? node.name : node.title}</h1>
    <section class="summary"><p>${marked(node.summary)}</p></section>
    <section>${marked(node.content)}</section>
    <ul>${edges}</ul>`

  const possibleEdges = document.getElementsByClassName("edges")
  for (var i = possibleEdges.length - 1; i >= 0; i--) {
    possibleEdges[i].addEventListener('click', function(e){
      showHud(getNodeById(e.target.id))
    })
  }

  hud.classList.add('visible')

}

const hideHud = () => {
  hud.classList.remove('visible')
}

closeHud.addEventListener('click', hideHud)