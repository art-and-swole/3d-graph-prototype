// Converts a hash of objects into an array
// where the key is the ID.
const hashToArray = (hash) => {
  let arr = []
  Object.keys(hash).forEach(key => {
    let item = hash[key]
    item.id = key
    arr.push(item)
  })

  return arr
}

// Finds the nodes in the array that have a fixed position
const getNodesWithPosition = (nodes) => {
  let foundNodes = [], leftovers = []
  nodes.forEach(n => {
    if(n.lat !== null && n.lng !== null && n.alt !== null){
      n.level = 0
      foundNodes.push(n)
    } else {
      leftovers.push(n)
    }
  })

  return {foundNodes: foundNodes, leftovers: leftovers}
}

// const getConnectedNodes = (id) => {
//   const sourceEdges = edges.filter(e => e.source === id)
//   const targetEdges = edges.filter(e => e.target === id)
//   let connectedNodes = []
//   sourceEdges.forEach(s => {
//     if(connectedNodes.filter(cn => cn.id === s.target).length > 0) return
//     connectedNodes.push(nodes.filter(n => n.properties.id === s.target)[0].properties)
//   })
//   targetEdges.forEach(t => {
//     if(connectedNodes.filter(cn => cn.id === t.source).length > 0) return

//     connectedNodes.push(nodes.filter(n => n.properties.id === t.source)[0].properties)
//   })
//   return connectedNodes
// }


const getAllConnectedNodes = (baseSet, edges, nodes, level) => {
  let foundNodes = [], leftovers = [], foundIds = []
  baseSet.forEach(bs => {
    const sourceEdges = edges.filter(e => e.source === bs.id)
    const targetEdges = edges.filter(e => e.target === bs.id)
    sourceEdges.forEach(s => {
      foundIds.push(s.target)
    })
    targetEdges.forEach(t => {
      foundIds.push(t.source)
    })
  })
  nodes.forEach(n => {
    if(foundIds.indexOf(n.id) > -1){
      n.level = level
      foundNodes.push(n)
    } else {
      leftovers.push(n)
    }
  })
  return {foundNodes: foundNodes, leftovers: leftovers}
}


// @todo refactor this to step through the entire data set, not just four levels
const orderData = (data) => {

  // @todo this was a bad idea, need to refactor so only the edges
  // are in an array, with nodes as a hash
  data.nodes = hashToArray(data.nodes)
  let nodesWithPosition = getNodesWithPosition(data.nodes)



  let level1 = getAllConnectedNodes(nodesWithPosition.foundNodes, data.edges, nodesWithPosition.leftovers, 1)
  let level2 = getAllConnectedNodes(level1.foundNodes, data.edges,level1.leftovers, 2 )
  let level3 = getAllConnectedNodes(level2.foundNodes, data.edges,level2.leftovers, 3 )
  let level4 = getAllConnectedNodes(level3.foundNodes, data.edges, level3.leftovers, 4 )
  data.nodes = nodesWithPosition.foundNodes.concat(level1.foundNodes,level2.foundNodes,level3.foundNodes,level4.foundNodes)
  return data
}

export const fetchData = (path = 'assets/data.json') => {
  return fetch(path).then(res => {
    return res.json()
  }).then(r => {
    return orderData(r)
  })
}
