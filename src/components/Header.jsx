import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import query from '../../schema/queries/me.gql';

import Menu from './Menu';

function Nav({ data }, { modal }) {
  return (<header>
    <button onClick={() => modal.open(props => (<Menu {...props} />), {
      label: 'Main Menu',
      role: 'menu',
    })}>Menu</button>
    <span>{data.me ? 'Moi' : null}</span>
  </header>);
}

Nav.contextTypes = {
  modal: PropTypes.object,
};

const Header = graphql(query)(Nav);

export default Header;
