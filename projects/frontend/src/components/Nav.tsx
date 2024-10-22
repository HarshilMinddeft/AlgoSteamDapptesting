const Nav = () => {
  return (
    <div className=" w-auto h-[65px] shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md">
      <div className="w-full h-full flex flex-row ">
        <a className="h-auto w-auto flex ml-3 flex-row items-center">
          <img src="/logoD.webp" alt="logo" width={40} height={50} className="cursor-default animate-pulse" />
        </a>
        <div className="w-full h-full flex flex-row justify-center mr-11">
          <div className="w-[600px] px-[10px] h-full flex flex-row items-center justify-between ">
            <div className="flex w-full h-auto py-[1px] rounded-3xl text-gray-200">
              <a
                href="/"
                className="text-white mt-1 ml-8 border-[#170c31f5] from-[#170c31f5] to-[#170c31f5] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl  text-[19px] px-5 py-2 text-center me-2 mb-2"
              >
                CreatorDashboard
              </a>
              <p className="ml-10 mr-10 mt-2 text-2xl">|</p>
              <a
                href="/Withdraw"
                className="text-white  mt-1  border-[#2d1672dc] from-[#170c31f5] to-[#170c31f5] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl  ml-6 text-[19px] px-5 py-2 text-center me-2 mb-2"
              >
                ReciverDashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nav
