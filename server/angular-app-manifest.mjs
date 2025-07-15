
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/blog"
  },
  {
    "renderMode": 1,
    "route": "/blog/*"
  },
  {
    "renderMode": 1,
    "route": "/amp/*"
  },
  {
    "renderMode": 2,
    "route": "/reply"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 46140, hash: '46f78d03e048bc262753f5d909858ae64bce9ee1859ade4c9675f312b97fec22', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 36850, hash: 'ecf5a447eb88dc13dac6d9397a8eb61ed4c949a3546e48f69ae4c63b47d962dc', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'blog/index.html': {size: 225463, hash: 'afe2a74e194d4eca93362bd6a04f2ca97a55be7cbda94d9dcf7e3c6eba6d4a69', text: () => import('./assets-chunks/blog_index_html.mjs').then(m => m.default)},
    'index.html': {size: 206763, hash: '71621c449496e5730237cf537f9a7c433195acc190c662e7668d6f7eb9ae7a3d', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'reply/index.html': {size: 227631, hash: '7c1cb1545a66636e42e82918046a256da74dd2c7f94d7ac5842747581318093b', text: () => import('./assets-chunks/reply_index_html.mjs').then(m => m.default)},
    'styles-ONO6VCR6.css': {size: 68554, hash: '0TfHPgOPFdM', text: () => import('./assets-chunks/styles-ONO6VCR6_css.mjs').then(m => m.default)}
  },
};
