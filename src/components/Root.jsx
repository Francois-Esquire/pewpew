import { withRouter } from 'react-router-dom';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Application from './Application';

const Root = compose(
  withRouter,
  connect(
    // eslint-disable-next-line prefer-arrow-callback
    function mapStateToProps(state, ownProps) { return { ...state, ...ownProps }; },
    // eslint-disable-next-line prefer-arrow-callback
    function mapDispatchToProps(dispatch) {
      return {
        channel: {
          change: url => dispatch({ type: '@@channel/change', url }),
        },
        modal: bindActionCreators({
          open: (view, { label, role, delay, onOpen, onClose, styleNames, style }) => ({
            type: '@@modal/open',
            view,
            label,
            role,
            delay,
            onOpen,
            onClose,
            styleNames,
            style,
          }),
          close: () => dispatch({ type: '@@modal/close' }),
        }, dispatch),
      };
    },
    // eslint-disable-next-line prefer-arrow-callback
    function mergeProps(stateProps, dispatchers) {
      // eslint-disable-next-line no-confusing-arrow
      return Object.keys(dispatchers).reduce((props, next) => props[next] ?
        Object.assign({}, props, { [next]: { ...props[next], ...dispatchers[next] } }) :
        Object.assign({}, props, { [next]: dispatchers[next] }),
      stateProps);
    }, { pure: true }))(Application);

export default Root;
