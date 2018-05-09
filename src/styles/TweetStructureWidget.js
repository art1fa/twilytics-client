import styled from 'styled-components';
import Paper from 'material-ui/Paper';

const StyledPaper = styled(Paper)`
    /* grid-row: 1 / 2; */
    display: flex;
    flex-direction: column;

    &.fade-enter {
    opacity: 0;
  }

  &.fade-enter.fade-enter-active {
    opacity: 1;
    transition: opacity 1s 1.25s;
  }

  &.fade-exit {
    opacity: 1;
  }

  &.fade-exit.fade-exit-active {
    opacity: 0;
    transition: opacity 1s;
  }
`;

const Content = styled.div`
    padding: 20px;
    padding-bottom: 50px;
    flex-grow: 1;
`;


export { StyledPaper, Content };
