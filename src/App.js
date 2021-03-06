import React, { Component } from 'react';

import io from 'socket.io-client';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { red, blue, grey } from 'material-ui/colors';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

import Logo from './components/Logo';

import SearchContainer from './search/SearchContainer';

import TweetCountWidget from './widgets/TweetCountWidget';
import TopUsersWidget from './widgets/TopUsersWidget';
import TopEntitiesWidget from './widgets/TopEntitiesWidget';
import UserDistributionWidget from './widgets/UserDistributionWidget';
import UserStructureWidget from './widgets/UserStructureWidget';

import TweetStreamWidget from './widgets/TweetStreamWidget';
import TweetStructureWidget from './widgets/TweetStructureWidget';
import TweetInteractionDistributionWidget from './widgets/TweetInteractionDistributionWidget';

import Footer from './components/Footer';

import { AppWrapper, Body, SectionHead, Grid } from './styles/App';

import { setChartDefaults } from './config/chartOptions';

const socket = io(process.env.REACT_APP_API_URL);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: {
        usergroups: [],
        keywords: [],
        options: {
          exclude_retweets: false,
          exclude_replys: false,
        },
      },
      resultCount: {
        tweets: 0,
        users: 0,
      },
      show: false,
      isLoading: false,
      isDarkTheme: false,
    };
    setChartDefaults(this.setTheme());
  }

  componentDidMount() {
    socket.on('done_search', (resultCount) => {
      console.log('done_search')
      if (resultCount.tweets > 0) {
        this.setState({ resultCount, show: true, isLoading: false });
      } else {
        this.setState({ resultCount, show: false, isLoading: false });
      }
    });
  }

  setTheme = () => createMuiTheme({
    palette: {
      primary: blue,
      secondary: grey,
      accent: red,
      background: {
        search: this.state.isDarkTheme ? grey[800] : grey[200],
        footer: this.state.isDarkTheme ? grey[900] : grey[200],
      },
      type: this.state.isDarkTheme ? 'dark' : 'light',
    },
  });

  handleSearchChange = (search) => {
    if (search.usergroups.length > 0 || search.keywords.length > 0) {
      this.setState({ search, isLoading: true });
      // socket.emit('switch_room', search.input);
      socket.emit('req_search', search);
      console.log('req_search');
    } else {
      this.setState({ search, show: false, isLoading: false });
    }
  }

  handleUsergroupChange = (input) => {
    const search = { ...this.state.search };
    search.usergroups = input;
    search.keywords = [];
    this.setState({ search });
    socket.emit('req_search', search);
  }

  render() {
    let nothingFound = false;
    const { resultCount, show, search, isLoading } = this.state;
    if (isLoading === false && resultCount.tweets === 0 && (search.usergroups.length > 0 || search.keywords.length > 0)) {
      nothingFound = true;
    }
    return (
      <MuiThemeProvider theme={this.setTheme()}>
        <AppWrapper>
          <Body>
            <Logo />
            <SearchContainer
              search={search}
              onSearchChange={this.handleSearchChange}
            />
            {isLoading && <CircularProgress size={50} thickness={2} style={{ position: 'absolute', margin: '0 auto', left: '0', right: '0' }} />}
            {nothingFound && <Typography variant="display1" align="center">Sorry, wir haben nichts gefunden 😢</Typography>}
            <SectionHead show={show}>
              <Typography variant="display1">Auswertung der Tweets</Typography>
              <Typography color="textSecondary" noWrap>{resultCount.tweets} Tweets gefunden</Typography>
            </SectionHead>
            <Grid>
              <TweetStreamWidget search={search} socket={socket} show={show} loading={isLoading} />
              <TweetCountWidget search={search} socket={socket} show={show} loading={isLoading} />
              <TopEntitiesWidget search={search} socket={socket} show={show} loading={isLoading} />
              <TweetStructureWidget search={search} socket={socket} show={show} loading={isLoading} />
              <TweetInteractionDistributionWidget search={search} socket={socket} show={show} loading={isLoading} />
            </Grid>

            <SectionHead show={show}>
              <Typography variant="display1">Auswertung der Nutzer</Typography>
              <Typography color="textSecondary">{resultCount.users} gefunden</Typography>
            </SectionHead>
            <Grid>
              <TopUsersWidget search={search} socket={socket} show={show} loading={isLoading} />
              <UserDistributionWidget search={search} socket={socket} show={show} loading={isLoading} />
              <UserStructureWidget
                search={search}
                socket={socket}
                show={show}
                loading={isLoading}
                onTagClick={this.handleUsergroupChange}
              />
            </Grid>
          </Body>
          <Footer />
        </AppWrapper>
      </MuiThemeProvider>
    );
  }
}

export default App;
