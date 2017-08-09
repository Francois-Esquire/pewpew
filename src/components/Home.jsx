import React from 'react';
import PropTypes from 'prop-types';

import PewPew from './icons/pewpew';

const Home = ({ history, channel }) => (<section className="home">
  <PewPew color="#fff" />
  <form
    id="channel"
    onSubmit={(event) => {
      event.preventDefault();
      return history.push(`/${channel.url}`);
    }}>
    <label htmlFor="remote">/</label>
    <input
      id="remote"
      type="text"
      value={channel.url}
      placeholder="Tune in to..."
      onChange={({ target: { value } }) => channel.change(value.toLowerCase())} />
    <button type="submit">Go</button>
  </form>
</section>);

Home.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object,
};

Home.defaultProps = {
  history: {},
  channel: {},
};

export default Home;
