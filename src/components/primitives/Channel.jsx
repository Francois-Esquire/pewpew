import React from 'react';

const Channel = ({ id, url, title, by, children }) => (<section>
  <header>
    <p>{id}</p>
    <p>{url}</p>
    <p>{title}</p>
    <p>{by}</p>
  </header>
  {children}
</section>);

export default Channel;
