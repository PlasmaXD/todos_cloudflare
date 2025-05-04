/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // POST /api/todos → 追加
  if (url.pathname === '/api/todos' && request.method === 'POST') {
    const { id, text } = await request.json()
    await TODOS.put(id, JSON.stringify({ id, text, completed: false }))
    return new Response(null, { status: 204 })
  }

  // GET  /api/todos → JSON 一覧
  if (url.pathname === '/api/todos' && request.method === 'GET') {
    const listResult = await TODOS.list()  // keys 配列を含むオブジェクトを取得 :contentReference[oaicite:3]{index=3}
    const todos = []
    for (const { name } of listResult.keys) {
      const item = await TODOS.get(name, 'json')  // JSON として取得 :contentReference[oaicite:4]{index=4}
      todos.push(item)
    }
    return new Response(JSON.stringify({ todos }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // PUT  /api/todos/:id → 完了トグル
  if (url.pathname.startsWith('/api/todos/') && request.method === 'PUT') {
    const id = url.pathname.split('/').pop()
    const data = await TODOS.get(id, 'json')
    const updated = { ...data, completed: !data.completed }
    await TODOS.put(id, JSON.stringify(updated))
    return new Response(null, { status: 204 })
  }

  // DELETE /api/todos/:id → 削除
  if (url.pathname.startsWith('/api/todos/') && request.method === 'DELETE') {
    const id = url.pathname.split('/').pop()
    await TODOS.delete(id)
    return new Response(null, { status: 204 })
  }

  // GET  / → HTML を返却
  if (url.pathname === '/' && request.method === 'GET') {
    const listResult = await TODOS.list()
    const todos = []
    for (const { name } of listResult.keys) {
      const item = await TODOS.get(name, 'json')
      todos.push(item)
    }
    return new Response(renderHTML(todos), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }

  return new Response('Not Found', { status: 404 })
}

function renderHTML(todos) {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>Cloudflare Workers Todo</title></head>
<body>
  <h1>Todo App</h1>
  <form id="todo-form">
    <input type="text" id="todo-text" placeholder="New todo" required>
    <button type="submit">Add</button>
  </form>
  <ul id="todo-list">
    ${todos.map(item => `
      <li>
        <input type="checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <span${item.completed ? ' style="text-decoration: line-through;"' : ''}>
          ${item.text}
        </span>
        <button data-id="${item.id}" class="delete">×</button>
      </li>
    `).join('')}
  </ul>
  <script>
    document.getElementById('todo-form').addEventListener('submit', async e => {
      e.preventDefault()
      const text = document.getElementById('todo-text').value
      const id = Date.now().toString()
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text })
      })
      location.reload()
    })
    document.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', async () => {
        await fetch(\`/api/todos/\${cb.dataset.id}\`, { method: 'PUT' })
        location.reload()
      })
    })
    document.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(\`/api/todos/\${btn.dataset.id}\`, { method: 'DELETE' })
        location.reload()
      })
    })
  </script>
</body>
</html>`
}
