import { useRouter } from "next/router"
import { Home1 } from "."

const price = () =>{
    const router = useRouter()
return(
    <>
        <div>
            <header className="flex justify-center">
            </header>
            <Home1></Home1>
        </div>
    </>
)
}

export default price