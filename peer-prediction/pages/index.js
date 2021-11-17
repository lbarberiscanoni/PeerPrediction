import Link from 'next/link'

const Home = () => {  
    return(
      <div>
        <h1>Lorenzo's Collective Intelligence Mechanisms</h1>
        <div>
	        <Link href="/mechanisms/schelling-coin">
	          <a>Schelling Coin</a>
	        </Link>
	    </div>
	    <div>
	        <Link href="/mechanisms/dmi">
	          <a>Determinant-based Mutual Information</a>
	        </Link>
	    </div>
      </div>
    )
}
export default Home;