import React, { Component } from 'react';
import _ from 'lodash';

import Typography from 'material-ui/Typography';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
} from 'material-ui/Table';

import withFade from '../components/withFade';

import WidgetHead from './WidgetHead';
import { StyledPaper, Content } from '../styles/TopEntitiesWidget';

let socket;

function TopEntities(props) {

  const numAbbrev = (num) => {
    if (num > 999999) num = (num / 1000000).toFixed(1) + 'M'
    if (num > 99999) num = (num / 1000).toFixed(0) + 'K'
    if (num > 999) num = (num / 1000).toFixed(1) + 'K'
    return num
  }

  const getCount = (user) => {
    let count;
    switch(props.mode) {
      case 0: count = numAbbrev(user.followers_count); break;
      case 1: count = numAbbrev(user.tweets_count); break;
    }
    return count;
  }

  const getMode = () => {
    let mode;
    switch(props.mode) {
      case 0: mode = 'Hashtag'; break;
      case 1: mode = 'Link'; break;
    }
    return mode;
  }

  return (
    <Table>
      <TableHead>
        <TableCell>#</TableCell>
        <TableCell>{getMode()}</TableCell>
        <TableCell>Zahl</TableCell>
      </TableHead>
      <TableBody>
        {props.data.map((entity, i) => (
          <TableRow hover key={entity.group}>
            <TableCell>
              {i + 1}
            </TableCell>
            <TableCell>
              <Typography>{entity.group}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{entity.reduction}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
        </TableRow>
      </TableFooter> */}
    </Table>
  );
}


class TopEntitiesWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchChange: false,
      selectedMenuItem: 0,
      isLoading: true,
      data: [],
    };
    socket = this.props.socket;
  }

  componentDidMount() {
    switch(this.state.selectedMenuItem) {
      case 0: socket.emit('req_top_entities_hastags', this.props.search); break;
      case 1: socket.emit('req_top_entities_urls', this.props.search); break;
    }

    socket.on('top_entities_hastags', (data) => {
      if (data !== null) {
        this.setState({ data });
      }
      this.setState({ isLoading: false });
    });

    socket.on('top_entities_urls', (data) => {
      if (data !== null) {
        this.setState({ data });
      }
      this.setState({ isLoading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.search, this.props.search)) {
      this.setState({ searchChange: true });
    }

    if (this.state.searchChange && nextProps.show && !nextProps.loading) {
      switch(this.state.selectedMenuItem) {
        case 0: socket.emit('req_top_entities_hastags', nextProps.search); break;
        case 1: socket.emit('req_top_entities_urls', nextProps.search); break;
      }
      this.setState({ isLoading: true, searchChange: false });
    }
  }

  handleMenuChange = (index) => {
    this.setState({ selectedMenuItem: index, isLoading: true }, () => {
      switch(this.state.selectedMenuItem) {
        case 0: socket.emit('req_top_entities_hastags', this.props.search); break;
        case 1: socket.emit('req_top_entities_urls', this.props.search); break;
      }
    });
  }

  render() {
    return (
      <StyledPaper>
        <WidgetHead
          title="Top-Entities"
          options={['Hashtags', 'Links']}
          loading={this.state.isLoading}
          onMenuChange={this.handleMenuChange}
          selectedMenuItem={this.state.selectedMenuItem}
        />
        <Content>
          <TopEntities
            data={this.state.data}
            mode={this.state.selectedMenuItem}
          />
        </Content>
      </StyledPaper>
    );
  }
}

export default withFade()(TopEntitiesWidget);