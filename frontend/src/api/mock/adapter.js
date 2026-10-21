import { handleMockRequest } from './handlers.js'

export function mockAdapter(config) {
  return new Promise((resolve) => {
    const url = new URL(`${config.baseURL || ''}${config.url || ''}`, 'http://mock.local')
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value)
        }
      }
    }
    config.url = `${url.pathname}${url.search}`

    const data = handleMockRequest(config)
    resolve({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  })
}
