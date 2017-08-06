import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import anime from 'animejs';

import query from '../../schema/queries/me.gql';

import Menu from './Menu';

function Nav({ data, channel }, { modal }) {
  return (<header>
    <button onClick={() => modal.open(modalProps => (<Menu channel={channel} {...modalProps} />), {
      label: 'Main Menu',
      role: 'menu',
      delay: 2800,
      onOpen: () => anime({
        targets: Object.keys(modal.style).map(key => modal.style[key]),
        opacity: 1,
        easing: 'easeInOutExpo',
        duration: 800,
        complete: () => {
          console.log('opening completed!');
        },
      }),
      // onClose: cb => anime({
      //   targets: Object.keys(modal.style).map(key => modal.style[key]),
      //   opacity: 0,
      //   easing: 'easeInOutExpo',
      //   duration: 800,
      //   complete: () => {
      //     console.log('closing completed!');
      //     cb();
      //   },
      // }),
      styleNames: {
        className: 'Main_Menu_Content',
        portalClassName: 'ReactModalPortal Main_Menu',
        overlayClassName: 'Main_Menu_Overlay',
        // bodyOpenClassName: 'Main_Menu_Open',
      },
    })}>Menu</button>
    <span>{data.me ? 'Moi' : channel}</span>
  </header>);
}

Nav.propTypes = {
  channel: PropTypes.string,
};

Nav.defaultProps = {
  channel: '',
};

Nav.contextTypes = {
  modal: PropTypes.object,
};

const Header = graphql(query)(Nav);

export default Header;
