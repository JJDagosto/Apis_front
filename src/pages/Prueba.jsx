import CardBar from '../components/CardBar'
import Card from '../components/Card.jsx'
import PriceMinMax from '../components/PriceMinMax.jsx'
import { useEffect, useState } from 'react'
import PruebaDumb from '../components/PruebaDumb.jsx'


function Prueba({id, title}) {

    const [count, setCount] = useState(0);
    useEffect(()=>{
        document.title = 'count ' + count;
    },[count])

    const [posts, setPosts] = useState([])
    console.log(posts)


    useEffect(()=>{
    const URL= 'https://jsonplaceholder.typicode.com/' //api
    fetch('URL'+'posts') 
    .then((response)=>response.json())
    .then((data) => {setPosts(data)})
    .catch((error)=>(console.error('error')))
  },[])




  return (
    <>
      <span>Contador {count}</span>
    <button onClick={()=> setCount(count+1) }>Incrementar</button>
    {posts.map((post)=>(
        <PruebaDumb key={post.id}
        title={post.title}
        id={post.id}/>
    ))}
    </>
  )
}

export default Prueba
