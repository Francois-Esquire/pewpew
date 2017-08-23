import React from 'react';
import PropTypes from 'prop-types';

const Html = ({ head, css, scripts, html, window }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {head.meta.toComponent()}
      {head.title.toComponent()}
      {css.map(href => <link key={href} rel="stylesheet" href={href} />)}
      <link rel="manifest" href="/manifest.json" />
    </head>
    <body>
      <div
        id="app"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }} />
      <script
        id="$$"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: Object.keys(window).reduce(
            /* eslint-disable */
            (out, key) => out += `window.${key}=${JSON.stringify(window[key])};`, ''),
            /* eslint-enable */
        }} />
      {scripts.map(src => <script key={src} src={`/${src}`} defer />)}
    </body>
  </html>);

Html.propTypes = {
  head: PropTypes.shape({
    meta: PropTypes.object,
    title: PropTypes.object,
  }).isRequired,
  css: PropTypes.arrayOf(PropTypes.string).isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  html: PropTypes.string.isRequired,
  window: PropTypes.shape({
    __$$__: PropTypes.object,
    pewpew: PropTypes.object,
  }).isRequired,
};

export default Html;
