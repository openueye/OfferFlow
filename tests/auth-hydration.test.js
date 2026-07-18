import test from 'node:test'
import assert from 'node:assert/strict'
import React, { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import AuthLayout from '../src/app/auth/layout.jsx'
import { ThemeProvider } from '../src/store/ThemeContext.jsx'

function renderAuthLayout() {
  return renderToString(
    createElement(
      ThemeProvider,
      null,
      createElement(AuthLayout, null, createElement('main', null, 'Login'))
    )
  )
}

test('auth layout produces the same initial HTML on the server and client', (t) => {
  globalThis.React = React
  t.after(() => {
    delete globalThis.React
    delete globalThis.window
    delete globalThis.localStorage
    delete globalThis.sessionStorage
  })

  delete globalThis.window
  delete globalThis.localStorage
  delete globalThis.sessionStorage
  const serverHtml = renderAuthLayout()

  globalThis.window = {
    matchMedia: () => ({ matches: true }),
  }
  globalThis.localStorage = {
    getItem: (key) => (key === 'app-theme' ? 'light' : null),
  }
  globalThis.sessionStorage = {
    getItem: (key) => (key === 'offerflow_splash_shown' ? 'true' : null),
  }
  const clientHtml = renderAuthLayout()

  assert.equal(clientHtml, serverHtml)
})
