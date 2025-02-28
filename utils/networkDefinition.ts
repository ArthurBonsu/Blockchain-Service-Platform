type netType = {
  name: string
}
type networkType = Record<string, netType>

export const network: networkType = {
  '0x1': {
    name: 'Ethereum Main Network (Mainnet)',
  },
  '0x3': {
    name: 'Ropsten Test Network',
  },
  '0x4': {
    name: 'Rinkeby Test Network',
  },
  '0x5': {
    name: 'Goerli Test Network',
  },
  '0x2a': {
    name: 'Kovan Test Network',
  },
}
