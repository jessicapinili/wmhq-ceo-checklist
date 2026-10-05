import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { StoreProvider } from './store'
import { loadMember, MemberCtx } from './session'
import './index.css'

const root = createRoot(document.getElementById('root')!)

loadMember().then((member) => {
  if (!member) { location.href = '/login/'; return }
  root.render(
    <StrictMode>
      <MemberCtx.Provider value={member}>
        <StoreProvider member={member}><App /></StoreProvider>
      </MemberCtx.Provider>
    </StrictMode>,
  )
})
