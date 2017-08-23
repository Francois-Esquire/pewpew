import React from 'react';
import { graphql } from 'react-apollo';
import { Field, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';

import mutation from 'mutations/signup.gql';

// class HandleBar extends React.PureComponent {
//   constructor(props) {
//     super(props);
//
//     this.rules = new Map();
//     this.onSubmit = this.onSubmit.bind(this);
//     this.onChange = this.onChange.bind(this);
//
//     this.state = {
//       email: '',
//       handle: '',
//       password: '',
//     };
//   }
//   onSubmit(event) {
//     event.preventDefault();
//     const { handle, email, password } = this.state;
//     this.props.mutate({
//       variables: {
//         handle,
//         email,
//         password,
//       },
//     }).then(({ data: { signup } }) => {
//       console.log(signup);
//     }).catch((result) => {
//       console.log(result);
//     });
//   }
//   onChange({ target: { id, value } }) {
//     return this.setState({ [id]: value });
//   }
//   render() {
//     const { state: { handle, email, password }, onChange, onSubmit } = this;
//     return (<form className="create-handle" onSubmit={onSubmit}>
//       <div>
//         <label htmlFor="handle">Grab A Handle</label>
//         <input id="handle" type="text" value={handle} onChange={onChange} required />
//       </div>
//       <div>
//         <label htmlFor="email">Set Your Email</label>
//         <input id="email" type="email" value={email} onChange={onChange} required />
//       </div>
//       <div>
//         <label htmlFor="password">Password</label>
//         <input id="password" type="password" value={password} onChange={onChange} required />
//       </div>
//       <button type="submit">Start</button>
//     </form>);
//   }
// }
//
// HandleBar.propTypes = {
//   mutate: PropTypes.func,
// };
//
// HandleBar.defaultProps = {
//   mutate: () => Promise.resolve({ signup: {} }),
// };

const renderField = (props) => {
  const { id, input, label, type, meta: { touched, error, warning } } = props;

  return (<div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...input} type={type} />
    {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  </div>);
};

const HandleBarForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Field id="handle" name="handle" type="text" component={renderField} label="Username" />
      <Field id="email" name="email" type="email" component={renderField} label="Email" />
      <Field id="password" name="password" type="password" component={renderField} label="Age" />
      <button type="submit" disabled={pristine || submitting}>Submit</button>
    </form>
  );
};

const SignUp = graphql(mutation, {
  alias: 'SignUp',
  props: ({ mutate }) => ({
    onSubmit: (variables) => {
      console.log(variables);
      return mutate({ variables }).catch(errors => console.log(errors));
    },
    onSubmitSuccess(result) {
      console.log(result);
    },
    onSubmitFail(result) {
      console.log(result);
    },
  }),
})(reduxForm({
  form: 'HandleBar',
})(HandleBarForm));

export default SignUp;
