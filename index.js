import {fetchData} from './data.js'
import {Node} from './nodes.js'
import {Edge} from './edges.js'
import {showHud} from './hud.js'
import {showLabel, hideLabel} from './label.js'

let camera
let scene
let renderer
let controls
let raycaster
let geometry
let group

let mouse = new THREE.Vector2()
let realMousePosition = new THREE.Vector2()
let INTERSECTED
let DRAGGING = false
let ALLOWCLICK = true

let draggableNodes = []
let ignoredUUIDS = []
let nodes = []
let edges = []
let frustumSize = 300;

const init = () => {

  addCamera()

  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0xffffff)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio)
  renderer.setSize( window.innerWidth, window.innerHeight)
  renderer.domElement.classList.add('viz')
  document.body.appendChild( renderer.domElement)

  controls = new THREE.OrbitControls( camera )

  window.addEventListener('resize', onWindowResize, false)

  addLights()
  addFloor()


  fetchData().then(data => {
    data.nodes.forEach(n => {
      addNodeToScene(n)
    })
    data.edges.forEach(e => addEdgeToScene(e))
  })


  const dragControls = new THREE.DragControls( draggableNodes, camera, renderer.domElement )
  dragControls.addEventListener( 'dragstart', function ( event ) {
    DRAGGING = true
    controls.enabled = false } )

  dragControls.addEventListener('drag', function(event){
    const draggedNode = nodes.filter(n => n.uuid === event.object.uuid)[0]
    const draggedNodeId = draggedNode.properties.id
    const updatedEdges = edges.filter(e => {
      return e.source === draggedNodeId || e.target === draggedNodeId
    })
    updatedEdges.forEach(e => e.updateEdge())
  })

  dragControls.addEventListener( 'dragend', function ( event ) {
    DRAGGING = false
    controls.enabled = true;
  } );

  raycaster = new THREE.Raycaster();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false )
  document.addEventListener('click', onDocumentMouseClick, false)
}

const addEdgeToScene = (edge) => {
  edges.push(new Edge(edge, nodes))
  scene.add(edges[edges.length - 1].mesh)
}

const addNodeToScene = (_node) => {
  const node = new Node(_node)
  nodes.push(node)
  scene.add(node.mesh)
  if(node.draggable) draggableNodes.push(node.mesh)
}

const addFloor = (floorURL = '/assets/grid.png') => {
  // DRAW GROUND PLANE
  var map = new THREE.TextureLoader().load( floorURL );
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;

  var planeMaterial = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide, color: 0xfffff00, transparent: true} );
  let plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200, 4, 4 ), planeMaterial );
  plane.position.set( 0, -10, 0 );
  plane.rotation.x = Math.PI / 2
  scene.add( plane );
  ignoredUUIDS.push(plane.uuid)
  window.planeadjust = plane
}

const addCamera = () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
  camera.position.set( 0, 200, 200 );
  camera.lookAt(0,0,0)

}

const addLights = () => {
  scene.add( new THREE.AmbientLight( 0x505050 ) )
  var light = new THREE.SpotLight( 0xffffff, 1.5 )
  light.position.set( 0, 500, 2000 )
  light.angle = Math.PI / 9
  light.castShadow = true
  light.shadow.camera.near = 1000
  light.shadow.camera.far = 4000
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  scene.add( light )
}



function onDocumentMouseMove( event ) {
  event.preventDefault()
  realMousePosition.x = event.clientX
  realMousePosition.y = event.clientY
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

const getObjectByUUID = (uuid) => {
  // console.log(uuid)
  let obj = nodes.filter(n => n.uuid === uuid)[0]
  if(obj === undefined){
    obj = edges.filter(e => e.uuid === uuid)[0]
    if(obj === undefined){
      // console.warn("UUID NOT FOUND. THIS SHOULD NOT HAPPEN")
      return
    }
    obj.objtype = "EDGE"
  } else {
    obj.objtype = "NODE"
  }
  return obj
}

const getConnectedNodes = (id) => {
  const sourceEdges = edges.filter(e => e.source === id)
  const targetEdges = edges.filter(e => e.target === id)
  let connectedNodes = []
  sourceEdges.forEach(s => {
    if(connectedNodes.filter(cn => cn.id === s.target).length > 0) return
    connectedNodes.push(nodes.filter(n => n.properties.id === s.target)[0].properties)
  })
  targetEdges.forEach(t => {
    if(connectedNodes.filter(cn => cn.id === t.source).length > 0) return

    connectedNodes.push(nodes.filter(n => n.properties.id === t.source)[0].properties)
  })
  return connectedNodes
}

let selectedObject = {}

const showHudFromId = (id) => {
  let obj = nodes.filter(n => n.properties.id === id)[0]
  obj.objtype = "NODE"
  console.log("SHOW HUD FROM ID:", id, obj)
  showHudFromObject(obj)
}

const showHudFromObject = (obj) => {
  controls.enabled = false
  ALLOWCLICK = false
  if(obj.objtype === "NODE"){
    showHud(obj.properties, getConnectedNodes(obj.properties.id), showHudFromId)
    obj.markAsRead()
  } else {
    console.log("EDGES NOT IMPLEMENTED YET ")
  }
}

export const reenableControls = () => {
  controls.enabled = true
  ALLOWCLICK = true
}

function onDocumentMouseClick (event ){
  if(DRAGGING || !ALLOWCLICK) return
  event.preventDefault()

  mouse.x = (event.clientX / window.innerWidth) * 2 -1
  mouse.y = (event.clientY / window.innerHeight) * 2 + 1

  let intersects = raycaster.intersectObjects( scene.children )

  if(intersects.length > 0){
    selectedObject = getObjectByUUID(intersects[0].object.uuid)
    if(selectedObject.objtype === "NODE"){
      showHudFromObject(selectedObject)
    } else {
      console.log("SELECTED EDGE:", selectedObject)
    }

  }

}

const onWindowResize = () => {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight)
}

let hoveredObject = {}


const detectHoveredObjects = () => {
  raycaster.setFromCamera( mouse, camera );

  let intersects = raycaster.intersectObjects( scene.children )
  if(intersects.length > 0){
    let UUID = intersects[0].object.uuid
    let iterator = 1
    while(ignoredUUIDS.indexOf(UUID) > -1 && iterator < intersects.length ){
      UUID = intersects[iterator].object.uuid
      iterator++
    }

    if(hoveredObject && hoveredObject.unHighlight){
      hoveredObject.unHighlight()
      hideLabel()
    }
    hoveredObject = getObjectByUUID(UUID)
    if(hoveredObject && hoveredObject.unHighlight) hoveredObject.highlight()
    if(hoveredObject !== undefined) showLabel(hoveredObject, realMousePosition)
  }
}

const render = () => {
  detectHoveredObjects()
  renderer.render( scene, camera)

}

const animate = () => {
  requestAnimationFrame( animate)
  controls.update()
  render()
}

init()
animate()
