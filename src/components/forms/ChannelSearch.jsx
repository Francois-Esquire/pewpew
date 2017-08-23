import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const ChannelSearch = ({ channel, updateChannel, changeChannel }) => (<form
  id="channel-search"
  onSubmit={(event) => {
    event.preventDefault();
    updateChannel(channel);
    // return false;
  }}>
  {console.log(channel) || null}
  <label htmlFor="remote">/</label>
  <input
    id="remote"
    type="text"
    form="channel-search"
    value={channel}
    placeholder="Tune in to..."
    onChange={({ target: { value } }) => changeChannel(value)} />
  <button type="submit">Go</button>
</form>);

const Search = withRouter(connect(
  ({ channel }) => ({ channel: channel.url }),
  (dispatch, { history }) => ({
    changeChannel: url => dispatch({ type: '@@channel/change', url }),
    updateChannel: url => history.push(`/${url}`),
  }), ({ channel }, { changeChannel, updateChannel }) => ({
    channel,
    changeChannel,
    updateChannel,
  }))(ChannelSearch));

export default Search;
