const Nav = () => {
  return (
    <div className=" w-auto h-[65px] shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md">
      <div className="w-full h-full flex flex-row ">
        <a href="/" className="h-auto w-auto flex ml-3 flex-row items-center">
          <img src="/logoD.webp" alt="logo" width={40} height={50} className="cursor-pointer animate-pulse" />
        </a>
        <div className="w-full h-full flex flex-row justify-center mr-11">
          <div className="w-[600px] px-[10px] h-full flex flex-row items-center justify-between ">
            <div className="flex w-full h-auto border border-[#7042f861] bg-[#0300145e] py-[4px] rounded-full text-gray-200">
              <a
                href="/"
                className="text-white border mt-1  border-[#2d1672dc] bg-[#0300145e] from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-full ml-5 text-base px-5 py-2 text-center me-2 mb-2"
              >
                CreatorDashboard
              </a>
              <a
                href="/Withdraw"
                className="text-white border mt-1  border-[#2d1672dc] bg-[#0300145e] from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-full ml-44 text-base px-5 py-2 text-center me-2 mb-2"
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
