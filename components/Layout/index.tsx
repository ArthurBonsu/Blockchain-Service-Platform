import { ReactNode, FC, useContext } from 'react'

export { default as getLayout } from './Layout'
export { default as BasicAuth } from './BasicAuth'
export interface WithPageLayout<T = {}> extends FC<T> {
  getLayout?: (page: ReactNode) => JSX.Element
}
