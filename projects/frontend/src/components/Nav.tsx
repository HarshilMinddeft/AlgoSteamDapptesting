import { useState } from 'react'
import './Nav.css'

const Nav = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('Select Network')
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="borderRadius w-full h-[65px] fixed shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md z-50">
      <div className="w-full h-full flex flex-row items-center justify-between m-auto">
        <a href="/" className="h-auto w-auto flex ml-4 flex-row items-center">
          <img src="/LogoD.webp" alt="logo" width={40} height={50} className="cursor-pointer animate-pulse" />
        </a>
        <div className="leftnav">
          <div className="w-[300px] px-[10px] h-full flex flex-row items-center justify-between ml-5">
            <div className="flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
              <a
                href="/userClaim"
                className="focus:ring focus:outline-none btn btn-primary cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Claim
              </a>
              <a
                href="/userAirdropData"
                className="btn btn-primary focus:ring focus:outline-none cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Create
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nav
