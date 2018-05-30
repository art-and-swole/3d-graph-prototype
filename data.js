export const fetchData = () => {
  return fetch('data.json').then(res => {
    return res.json()
  })
}
