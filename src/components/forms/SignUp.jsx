import React from 'react';
import { graphql } from 'react-apollo';
import { Field, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';

import mutation from 'mutations/signup.gql';

import renderField from './InputField';

const SignUpForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (<form onSubmit={handleSubmit}>
    <Field id="handle" name="handle" type="text" component={renderField} label="Grab A Handle" />
    <Field id="email" name="email" type="email" component={renderField} label="Set Your Email" />
    <Field id="password" name="password" type="password" component={renderField} label="Password" />
    <button type="submit" disabled={pristine || submitting}>Get Started</button>
  </form>);
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
  form: 'sign-up',
})(SignUpForm));

export default SignUp;
