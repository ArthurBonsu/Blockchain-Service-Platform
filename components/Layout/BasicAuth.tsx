import { useRouter } from 'next/router'
import { useEffect, FC, ReactNode, useContext } from 'react'
import { useEthersStore } from 'stores/ethersStore'

// For authenticating address and setting the address

 export interface IAuthRouteProps{
  children?: ReactNode | undefined}
export const BasicAuth: FC<IAuthRouteProps> = ({ children }) => {
  const { replace } = useRouter()
  const address = useEthersStore((state) => state.address)

  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])

  return <>{children}</>
}

const getLayout = (page: ReactNode) => <BasicAuth>{page}</BasicAuth>
export default getLayout
