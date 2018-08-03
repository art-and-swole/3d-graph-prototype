export class Edge {
  constructor(_edge, nodes){
    this.source = _edge.source
    this.target = _edge.target
    this.type = _edge.type
    console.log(this.source, this.target, this.type, _edge);
    const sourcePosition = nodes.filter(n => n.properties.id === this.source)[0].getSourceLinkPosition()
    const targetPosition = nodes.filter(n => n.properties.id === this.target)[0].getTargetLinkPosition()
    this.geometry = new THREE.BufferGeometry().setFromPoints([sourcePosition, targetPosition])
    this.material = new THREE.LineBasicMaterial({})

    this.material.color = {r:1, g:1, b:0.0}

    const line = new THREE.Line(this.geometry, this.material)

    this.mesh = line

    this.uuid = this.mesh.uuid
  }

  highlight(){
    this.material.color = {r:1, g:0, b:1}
  }

  unHighlight(){
    this.material.color = {r:0.5, g:0.5, b:0.5}
  }

  click(){

  }

  resetState(){

  }

  updateEdge (){
    const sourcePosition = nodes.filter(n => n.properties.id === this.source)[0].getSourceLinkPosition()
    const targetPosition = nodes.filter(n => n.properties.id === this.target)[0].getTargetLinkPosition()
    this.geometry.setFromPoints([sourcePosition, targetPosition])
  }
}