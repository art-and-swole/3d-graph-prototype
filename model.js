
const hideRead = document.getElementById('hide-read')
let hideReadState = false

let readList = []

hideRead.addEventListener('change', function(e){
  hideReadState = e.target.checked
  if(hideReadState){
    readList.forEach(removeNodeById)
  } else {
    showAllNodes()
  }
})


const getEdges = (nodeId) => {
  console.log(nodeId, graph)
  const edges = graph.links.filter(edge => {
    return edge.target.id === nodeId || edge.source.id === nodeId
  })

  let nodes = []

  edges.forEach(edge => {
    if(edge.target.id === nodeId){
      const newNode = graph.nodes.filter(node => {
        return node.id === edge.source.id
      })[0]
      nodes.push(newNode)
    } else {
      const newNode = graph.nodes.filter(node => {
        return node.id === edge.target.id
      })[0]
    }
  })
  return nodes
}




const getNodeById = (id) => {
  return graph.nodes.filter(node => node.id === id)[0]
}


const removeNodeById = (id) => {
  let {nodes, links } = Graph.graphData()
  links = links.filter(l => l.source.id !== id && l.target.id !== id)
  nodes.splice(id, 1)
  Graph.graphData({ nodes, links})
}

const showAllNodes = () => {
  let {nodes, links} = graph
  Graph.graphData({nodes, links})
}

const scene = Graph.scene()

const mapTexture = THREE.ImageUtils.loadTexture( "./test.jpg" );


const mapMaterial = new THREE.MeshLambertMaterial({ map : mapTexture });
let plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), mapMaterial);
plane.position.y = -200

// rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
// Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
plane.rotation.x = (Math.PI / 2) * -1;

scene.add(plane)
