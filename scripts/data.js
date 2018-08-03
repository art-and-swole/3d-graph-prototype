import {Node} from './nodes.js'
import {Edge} from './edges.js'

export let DATA_FETCHING_STATUS = {fetching: false, fetched: false};


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

export const fetchData = (path = 'assets/data.json') => {
  status = {fetching: true, fetched: false};
  let nodes = {};
  let edges = []

  return fetch(path).then(res => {
    return res.json()
  })
  .then(data => {
    let nodes = {};
    let edges = [];
    let nodeIDLookupTable = {};

    Object.keys(data.nodes).forEach(key => {
      // When I create the node I grab the three.js objects uuid to reason about it
      // So I can have the same ID across the logic.
      let newNode = new Node(data.nodes[key]);
      nodes[newNode.uuid] = new Node(data.nodes[key])
      nodeIDLookupTable[key] = newNode.uuid
    })

    data.edges.forEach(e => {
      e.target = nodeIDLookupTable[e.target];
      e.source = nodeIDLookupTable[e.source];
      const newEdge = new Edge(e, nodes);
      edges.push(newEdge);
    })

    status = {fetching: false, fetched: true };
    return {nodes: nodes, edges: edges};
  })
  .catch(e => {
    console.warn("THERE WAS AN ERROR FETCHING DATA:", e);
    status = {fetching: false, fetched: false};
    return false;
  })
}
