
import Image from "next/image"
import EcoHarvestLogo from "../images/ecoHarvestLogo.png"

const Loading = () => {
    return(
        <div className="flex flex-col justify-center items-center h-[100vh] w-[100vw] bg-black">
            <Image src={EcoHarvestLogo} alt="EcoHarvest Logo" className="h-80 w-80"/>
            <p className="mt-[20px]">Cooking.. Please wait</p>
        </div>
    )
}

export default Loading 