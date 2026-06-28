export function setScreenChrome(color) {
  const meta = document.querySelector('meta[name="theme-color"]')
  const previous = {
    meta: meta?.getAttribute('content'),
    html: document.documentElement.style.background,
    body: document.body.style.background,
    root: document.getElementById('root')?.style.background,
  }

  if (meta) meta.setAttribute('content', color)
  document.documentElement.style.background = color
  document.body.style.background = color
  const root = document.getElementById('root')
  if (root) root.style.background = color

  return () => {
    if (meta && previous.meta) meta.setAttribute('content', previous.meta)
    document.documentElement.style.background = previous.html
    document.body.style.background = previous.body
    if (root) root.style.background = previous.root
  }
}
