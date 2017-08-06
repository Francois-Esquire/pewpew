import React from 'react';
import PropTypes from 'prop-types';

const Html = ({ head, html, scripts, window, css }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {head.meta.toComponent()}
      {head.title.toComponent()}
      {css.map(href => <link key={href} rel="stylesheet" href={href} />)}
    </head>
    <body>
      <div
        id="app"
        dangerouslySetInnerHTML={{ __html: html }} />
      <script
        dangerouslySetInnerHTML={{
          __html: Object.keys(window).reduce(
            /* eslint-disable */
            (out, key) => out += `window.${key}=${JSON.stringify(window[key])};`, ''),
            /* eslint-enable */
        }} />
      {scripts.map(src => <script key={src} src={src} />)}
    </body>
  </html>);

Html.propTypes = {
  html: PropTypes.string.isRequired,
  head: PropTypes.shape({
    meta: PropTypes.object,
    title: PropTypes.object,
  }).isRequired,
  window: PropTypes.shape({
    __$$__: PropTypes.object,
    pewpew: PropTypes.object,
  }).isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  css: PropTypes.arrayOf(PropTypes.string).isRequired,
  // _meta: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Html;
