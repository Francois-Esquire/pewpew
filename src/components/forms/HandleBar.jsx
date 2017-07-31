import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import PropTypes from 'prop-types';

import mutation from '../../../schema/mutations/createHandle.gql';

class HandleBar extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      handle: '',
    };
  }
  onSubmit(event) {
    event.preventDefault();
    this.props.createHandle(this.state.handle);
  }
  onChange({ target: { value: handle } }) {
    return this.setState({ handle });
  }
  render() {
    const { state: { handle }, onChange, onSubmit } = this;
    return (<form className="create-handle" onSubmit={onSubmit}>
      <div>
        <label htmlFor="handle">Grab A Handle</label>
        <input id="handle" type="text" value={handle} onChange={onChange} />
      </div>
      <button>Start</button>
    </form>);
  }
}

HandleBar.propTypes = {
  createHandle: PropTypes.func,
};

HandleBar.defaultProps = {
  createHandle: () => Promise.resolve({}),
};

export default graphql(mutation)(HandleBar);
