import Link from 'next/link'

const Home = () => {  
    return(
      <div>
        <h1>Lorenzo's Collective Intelligence Mechanisms</h1>
        <Link href="/mechanisms/schelling-coin">
          <a>Schelling Coin</a>
        </Link>
      </div>
    )
}
export default Home;