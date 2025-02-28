import { isBrowser } from 'utils/envUtils'
import Head from 'next/head'
import { FC, useContext } from 'react'

interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
}

const MetaTags: FC<MetaTagsProps> = ({ title, description, image }) => {
  const derivedTitle = title || process.env.appName
  const derivedDescription = description || process.env.appDescription
  const derivedImage = image || process.env.appIcon
  return (
    <Head>
      <title>{derivedTitle}</title>
      <meta name="title" content={derivedTitle} />
      <meta name="description" content={derivedDescription} />
      <meta property="og:type" content="website" />
      {isBrowser && <meta property="og:url" content={window.location.href} />}
      <meta property="og:title" content={derivedTitle} />
      <meta property="og:description" content={derivedDescription} />
      <meta property="og:image" content={derivedImage} />
      <meta property="twitter:card" content="summary_large_image" />
      {isBrowser && <meta property="twitter:url" content={window.location.href} />}
      <meta property="twitter:title" content={derivedTitle} />
      <meta property="twitter:description" content={derivedDescription} />
      <meta property="twitter:image" content={derivedImage} />
    </Head>
  )
}

export default MetaTags
