import {fetchData} from './data.js'

let camera
let scene
let renderer
let controls

let geometry
let group

let objects = []

let nodes = []
let edges = []
var frustumSize = 100;


const getInitialNodePosition = (node) => {
  if(node.lat !== null && node.lng !== null && node.alt !== null){
    return {x: node.lat, y: node.lng, z: node.alt, draggable: false}
  }
  return {x: (Math.random() * 100) - 100, y: (Math.random() * 100) - 100, z: Math.random() * 50, draggable: true}
}

class Node {
  constructor(_node){
    this.properties = _node
    // @todo refactor position away, as we will use only mesh position
    this.position = getInitialNodePosition(_node)
    this.draggable = this.position.draggable
    this.redraw = true

    const material = new THREE.MeshBasicMaterial({ wireframe: true, color: Math.random() * 0xffffff })
    const geometry = new THREE.BoxBufferGeometry(5, 5, 5)

    this.group = new THREE.Group()
    this.mesh = new THREE.Mesh( geometry, material )
    this.mesh.position.x = this.position.x
    this.mesh.position.y = this.position.y
    this.mesh.position.z = this.position.z
    this.group.add(this.mesh)
    if(this.draggable) objects.push(this.mesh)
    this.uuid = this.mesh.uuid


  }

  getSourceLinkPosition(){
    return this.mesh.position
  }

  getTargetLinkPosition(){
    // const x = this.position.x + 10
    // const y = this.position.y + 10
    // const z = this.position.z + 10
    // return {x,y,z}
    return this.mesh.position
  }

}

class Edge {
  constructor(_edge){
    this.source = _edge.source
    this.target = _edge.target
    const sourcePosition = nodes.filter(n => n.properties.id === this.source)[0].getSourceLinkPosition()
    const targetPosition = nodes.filter(n => n.properties.id === this.target)[0].getTargetLinkPosition()
    this.geometry = new THREE.BufferGeometry().setFromPoints([sourcePosition, targetPosition])
    const line = new THREE.Line(this.geometry, new THREE.LineBasicMaterial({
      color:0xffffff, opacity: 0.5}))

    this.mesh = line
  }

  updateEdge (){
    const sourcePosition = nodes.filter(n => n.properties.id === this.source)[0].getSourceLinkPosition()
    const targetPosition = nodes.filter(n => n.properties.id === this.target)[0].getTargetLinkPosition()
    this.geometry.setFromPoints([sourcePosition, targetPosition])
  }
}

const addEdgeToScene = (edge) => {
  edges.push(new Edge(edge))
  scene.add(edges[edges.length - 1].mesh)
}

const addNodeToScene = (node) => {
  nodes.push(new Node(node))
  scene.add(nodes[nodes.length - 1].mesh)
}

const init = () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 )
  camera.position.z = 100

  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0x000000)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio)
  renderer.setSize( window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  document.body.appendChild( renderer.domElement)

  controls = new THREE.TrackballControls( camera );
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.5
  controls.autoRotate = true
  controls.screenSpacePanning = false
  controls.minDistance = 100
  controls.maxDistance = 500
  controls.maxPolarAngle = Math.PI / 2

  window.addEventListener('resize', onWindowResize, false)


  scene.add( new THREE.AmbientLight( 0x505050 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.angle = Math.PI / 9;

  light.castShadow = true;
  light.shadow.camera.near = 1000;
  light.shadow.camera.far = 4000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add( light );

  fetchData().then(data => {
    Object.keys(data.nodes).forEach(key => {
      let newNode = data.nodes[key]
      newNode.id = key
      addNodeToScene(newNode)
    })

    data.edges.forEach(e => addEdgeToScene(e))
  })



  var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
  dragControls.addEventListener( 'dragstart', function ( event ) {
    controls.enabled = false; } );
  dragControls.addEventListener('drag', function(event){
    const draggedNodeId = nodes.filter(n => n.uuid === event.object.uuid)[0].properties.id
    const updatedEdges = edges.filter(e => {
      return e.source === draggedNodeId || e.target === draggedNodeId
    })
    updatedEdges.forEach(e => e.updateEdge())

  })
  dragControls.addEventListener( 'dragend', function ( event ) {
    controls.enabled = true;
  } );


}

const onWindowResize = () => {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight)
}

const render = () => {
  controls.update()
  renderer.render( scene, camera)

}

const animate = () => {
  requestAnimationFrame( animate)

  render()
}

init()
animate()
