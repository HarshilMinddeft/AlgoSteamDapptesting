import { useState } from 'react'

interface MethodCallINterface {
  methodFuncition: () => Promise<void>
  text: string
}

const MethodCall = ({ methodFuncition, text }: MethodCallINterface) => {
  const [loding, setLoding] = useState<boolean>(false)
  const callMethodFunction = async () => {
    setLoding(true)
    await methodFuncition()
    setLoding(false)
  }
  return (
    <button className="btn m-2" onClick={callMethodFunction}>
      {loding ? <span className="loading loading-spinner" /> : text}
    </button>
  )
}

export default MethodCall
