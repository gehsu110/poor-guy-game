export function setScreenChrome(theme) {
  const color = typeof theme === 'string' ? theme : theme.color
  const background = typeof theme === 'string' ? theme : theme.background ?? theme.color
  const meta = document.querySelector('meta[name="theme-color"]')
  const previous = {
    meta: meta?.getAttribute('content'),
    html: document.documentElement.style.background,
    body: document.body.style.background,
    root: document.getElementById('root')?.style.background,
  }

  if (meta) meta.setAttribute('content', color)
  document.documentElement.style.background = background
  document.body.style.background = background
  const root = document.getElementById('root')
  if (root) root.style.background = background

  return () => {
    if (meta && previous.meta) meta.setAttribute('content', previous.meta)
    document.documentElement.style.background = previous.html
    document.body.style.background = previous.body
    if (root) root.style.background = previous.root
  }
}
