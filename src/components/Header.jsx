import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route } from 'react-router-dom';
import { graphql } from 'react-apollo';
import anime from 'animejs';

import query from 'queries/me.gql';

import Menu from './Menu';
import PewPew from './icons/pewpew';

import LogoutButton from './actions/LogoutButton';
import LoginForm from './forms/LoginForm';
import SignUp from './forms/SignUp';

const MenuButton = ({ me, channel, children }, { modal }) => (<button onClick={() => modal.open(
  modalProps => (<Menu me={me} channel={channel.url} {...modalProps} />), {
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
    },
  })}>{children}</button>);

MenuButton.contextTypes = {
  modal: PropTypes.object,
};

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      login: false,
      signup: false,
    };
  }
  render() {
    const { data, channel } = this.props;

    return (<header>
      <section>
        <Switch>
          <Route exact path="/?signup" component={SignUp} />
          <Route exact path="/?login" component={LoginForm} />
          <Route
            exact
            path="/:channel"
            render={() => (
              <nav>
                <NavLink to="/">
                  <PewPew color="#2bc0da" />
                </NavLink>
                <span>{channel.url}</span>
              </nav>
            )} />
        </Switch>
        <div>
          <MenuButton me={data.me} channel={channel}>Menu</MenuButton>
          {data.me ? (<LogoutButton>Log Out</LogoutButton>) : (<NavLink to="/?login">login</NavLink>)}
        </div>
      </section>
    </header>);
  }
}

Nav.propTypes = {
  channel: PropTypes.object,
};

Nav.defaultProps = {
  channel: {},
};

const Header = graphql(query, {
  alias: 'Header',
})(Nav);

export default Header;
