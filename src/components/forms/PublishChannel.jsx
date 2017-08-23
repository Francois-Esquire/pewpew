import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { graphql } from 'react-apollo';
import PropTypes from 'prop-types';

import publishChannelMutation from 'mutations/publishChannel.gql';

import renderField from './InputField';

const PublishChannelForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (<form onSubmit={handleSubmit}>
    <Field id="title" name="title" type="text" component={renderField} label="Title" />
    <Field id="description" name="description" type="text" component={renderField} label="Description" />
    <Field id="tags" name="tags" type="text" component={renderField} label="Tags" />
    <button type="submit" disabled={pristine || submitting}>Submit</button>
  </form>);
};

const PublishChannel = graphql(publishChannelMutation, {
  alias: 'PublishChannel',
  props: ({ ownProps: { channel: { url } }, mutate }) => ({
    onSubmit(variables) {
      Object.assign(variables, { url });
      return mutate({ variables });
    },
  }),
})(reduxForm({
  form: 'publish-channel',
})(PublishChannelForm));

export default PublishChannel;
