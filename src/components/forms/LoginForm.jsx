import React from 'react';
import { graphql } from 'react-apollo';
import PropTypes from 'prop-types';

import query from 'queries/me.gql';
import mutation from 'mutations/login.gql';

class Login extends React.PureComponent {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      handle: '',
      email: '',
      password: '',
    };
  }
  onSubmit(event) {
    event.preventDefault();
    const { handle, email, password } = this.state;
    this.props.mutate({
      variables: {
        handle,
        email,
        password,
      },
    }).then(({ data: { login } }) => {
      console.log(login);
    }).catch((result) => {
      console.log(result);
    });
  }
  onChange({ target: { id, value } }) {
    return this.setState({ [id.replace('login-', '')]: value });
  }
  render() {
    const { state: { handle, email, password }, onChange, onSubmit } = this;
    return (<form id="login-form" onSubmit={onSubmit}>
      <div>
        <label htmlFor="login-handle">Handle</label>
        <input id="login-handle" type="text" value={handle} onChange={onChange} />
      </div>
      <div>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={onChange} />
      </div>
      <div>
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={password} onChange={onChange} />
      </div>
      <button type="submit">Start</button>
    </form>);
  }
}

Login.propTypes = {
  mutate: PropTypes.func,
};

Login.defaultProps = {
  mutate: () => Promise.resolve({ login: {} }),
};

const LoginForm = graphql(mutation, {
  alias: 'LoginForm',
  options: {
    // update(proxy, { data: { login } }) {},
  },
})(Login);

export default LoginForm;
