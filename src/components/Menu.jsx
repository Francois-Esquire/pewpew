import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainMenu = ({ children, channel, modal }) => (
  <nav className="main-menu">
    <header>
      <button type="button" onClick={() => modal.onClose(modal.close)}>Close</button>
    </header>
    {children}
    <NavLink exact to="/" className="home" activeClassName="jackpot">
      <span>Home</span>
    </NavLink>
    <footer>
      <h5>{channel}</h5>
    </footer>
  </nav>);

MainMenu.propTypes = {
  children: PropTypes.node,
};

MainMenu.defaultProps = {
  children: null,
};

MainMenu.contextTypes = {
  modal: PropTypes.object,
};

export default MainMenu;
