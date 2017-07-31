import React from 'react';
import PropTypes from 'prop-types';

import withChannels from './withChannel';

class Channel extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (<div>MyComponent</div>);
  }
}

Channel.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    channel: PropTypes.object,
  }),
  url: PropTypes.string,
};

Channel.defaultProps = {
  data: {},
  url: '/',
};

export default withChannels(Channel);
