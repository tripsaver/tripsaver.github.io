
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 841, hash: 'ca51b338bed2afae5c1f51c79b2987ac4acda3a5216713db59b20d206b342be8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 952, hash: 'cc151d28e243297b2bcae0fd3ba3e5be48ebdb9ecc5553ac978b931d9de0050f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 8110, hash: '10cd44a4286035b0346ed55bcfd8eae7cd61a70075f5796df7dbc2624c6d5501', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ZT36SWQW.css': {size: 2868, hash: 'pc5HZjyL6tQ', text: () => import('./assets-chunks/styles-ZT36SWQW_css.mjs').then(m => m.default)}
  },
};
