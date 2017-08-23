// eslint-disable-next-line import/no-extraneous-dependencies
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
// eslint-disable-next-line
import UploadWorker from 'worker?name=workers/[name].[hash].js!./workers/upload.js';

export default function install() {
  const appElement = document.getElementById('app');
  const {
    pewpew: { hrefs },
  } = window;

  const app = {
    hrefs,
    appElement,
    upload(file) {
      const body = new FormData();
      body.append('file', file);

      // eslint-disable-next-line compat/compat
      return fetch(hrefs.upload, {
        body,
        method: 'POST',
        headers: {},
        credentials: 'same-origin',
      });
    },
  };

  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      runtime.register({ scope: '/' }).then((registration) => {
        app.registration = registration;
        console.log(registration);
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(err => console.log('ServiceWorker registration failed: ', err));
    }
  });

  // prying access to hot middleware event stream.
  if ('__whmEventSourceWrapper' in window) {
    let evtSrc;

    // eslint-disable-next-line no-underscore-dangle
    window.__whmEventSourceWrapper[hrefs.hmr_url].addMessageListener((event) => {
      if (evtSrc === undefined) evtSrc = event.target;
    });

    // const restartStream = function updateStream() {
    //   if (evtSrc) {
    //     if (evtSrc.readyState === 1) evtSrc.close();
    //
    //     // setTimeout(() => {
    //     //   const source = new window.EventSource(evtSrc.url);
    //     //   source.onopen = evtSrc.onopen;
    //     //   source.onerror = evtSrc.onerror;
    //     //   source.onmessage = evtSrc.onmessage;
    //     //
    //     //   evtSrc = source;
    //     // }, 0);
    //   }
    // };

    // const hmr = require.cache[330];
    // const hmr = require.cache[require.resolve(hrefs.hmr)].exports;

    // if (hmr) {
    //   hmr.exports.subscribe(({ name, target, action, time }) => {
    //
    //     if (action === 'update') console.log(`[${target.toUpperCase()}] - updating `, time);
    //   });
    // }
  }

  const worker = new UploadWorker();

  worker.onmessage = evt => console.log(evt.data);

  worker.postMessage({ type: 'setup' });

  // const el = document.getElementById('$$');
  // el.parentNode.removeChild(el);
  // delete window.pewpew;
  // // eslint-disable-next-line no-underscore-dangle
  // delete window.__$$__;

  return {
    hrefs,
    appElement,
    app,
  };
}
