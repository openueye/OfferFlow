export const dynamic = 'force-dynamic'

import MainLayoutClient from './MainLayoutClient'

export default function MainLayout({ children }) {
  return <MainLayoutClient>{children}</MainLayoutClient>
}
