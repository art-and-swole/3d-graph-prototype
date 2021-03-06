const nodeShapes = ['circle-icon.png','cone-icon.png','cross-icon.png','cube-icon.png','dashed-parallelogram-icon.png','hexagram-icon.png','paralellogram-icon.png']



// If node has a fixed position place it. Otherwise find a good place for it.
const getInitialNodePosition = (node) => {
  if(node.lat !== null && node.lng !== null && node.alt !== null){
    return {x: node.lat, y: node.alt, z: node.lng, draggable: true}
  }
  return {x: (Math.random() * 200) - 100, y: (Math.random() * 20), z:  (Math.random() * 200) - 100, draggable: true}
}

export class Node {
  constructor(_node, spriteURL = "/assets/sprite.png"){

    spriteURL = "/assets/" + nodeShapes[Math.floor(Math.random() * nodeShapes.length - 1)];


    const spriteMap = new THREE.TextureLoader().load(spriteURL);
    this.state = "NONE"
    this.color = {r:1,g:1,b:1}
    this.properties = _node
    // @todo refactor position away, as we will use only mesh position
    this.position = getInitialNodePosition(_node)
    this.draggable = this.position.draggable
    this.redraw = true
    // this.material = new THREE.MeshBasicMaterial({ wireframe: true })
    // this.material.color = this.color
    // this.geometry = new THREE.BoxBufferGeometry(10, 10, 10)
    this.material = new THREE.SpriteMaterial({
      map: spriteMap,
      transparent: true
    })

    this.material.color = {r:1, g:0.5, b:0.5}

    this.sprite = new THREE.Sprite(this.material)
    this.sprite.scale.set(10, 10, 1)
    this.group = new THREE.Group()
    this.sprite.position.x = this.position.x
    this.sprite.position.y = this.position.y
    this.sprite.position.z = this.position.z
    this.group.add(this.sprite)
    this.uuid = this.sprite.uuid
    this.mesh = this.sprite
  }

  markAsRead(){
    this.updateState("READ")
  }

  updateState(newState){
    this.state = newState
    switch(newState){
      case("HOVERED"):
        this.material.color = {r:1,g:1,b:0}
        break
      case("ACTIVE"):
        this.material.color = {r:0,g:1,b:1}
        break
      case("NONE"):
        this.material.color = this.color
        break
      case("READ"):
        this.material.opacity = 0.3
        break
      default:
        this.material.color = this.color
    }
  }

  click(){
    this.updateState("ACTIVE")
  }

  highlight(){
    if(this.state !== "NONE") return
    this.updateState("HOVERED")
  }

  unHighlight(){
    if(this.state === "HOVERED") this.updateState("NONE")
  }

  resetState(){
    this.updateState("NONE")
  }

  getSourceLinkPosition(){
    return this.sprite.position
  }

  getTargetLinkPosition(){
    // const x = this.position.x + 10
    // const y = this.position.y + 10
    // const z = this.position.z + 10
    // return {x,y,z}
    return this.sprite.position
  }

}
