export class Edge {
  constructor(_edge, nodes){
    this.source = _edge.source
    this.target = _edge.target
    this.type = _edge.type

    const sourcePosition = nodes[this.source].getSourceLinkPosition()
    const targetPosition = nodes[this.target].getTargetLinkPosition()
    this.geometry = new THREE.BufferGeometry().setFromPoints([sourcePosition, targetPosition])
    this.material = new THREE.LineBasicMaterial({})

    this.material.color = {r:0.5, g:0.5, b:0.5}

    const line = new THREE.Line(this.geometry, this.material)

    this.mesh = line

    this.uuid = this.mesh.uuid
  }

  highlight(){
    this.material.color = {r:0.5, g:0.5, b:1}
  }

  unHighlight(){
    this.material.color = {r:0.5, g:0.5, b:0.5}
  }

  click(){

  }

  resetState(){

  }

  updateEdge (){
    const sourcePosition = nodes[this.source].getSourceLinkPosition()
    const targetPosition = nodes[this.target].getTargetLinkPosition()
    this.geometry.setFromPoints([sourcePosition, targetPosition])
  }
}