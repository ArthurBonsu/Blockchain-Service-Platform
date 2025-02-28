import { Select } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FC,useContext } from 'react'

// Page selection
const PageSelection: FC<{ value: string }> = ({ value }) => {
  const { query, push } = useRouter()

  const safeAddress = typeof query.safeAddress === 'string' ? query.safeAddress : ''
  const onPageSelect = (v: string) => push(`/safe/${safeAddress}/${v}`)

  return (
    <Select w="25%" onChange={(e) => onPageSelect(e.target.value)} value={value} mb={4}>
      <option value="assets">Assets</option>
      <option value="transfers">Transfer</option>
    </Select>
  )
}

export default PageSelection
