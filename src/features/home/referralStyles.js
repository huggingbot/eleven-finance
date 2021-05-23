import commonStyles, { TRANSITIONS, BREAKPOINTS } from 'assets/jss/common';

const styles = {
  // flex: {
  //   display: 'flex',
  // },
  // flexColumn: {
  //   display: 'flex',
  //   flexDirection: 'column',
  // },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    gap: '28px',
  },
  box: {
    ...commonStyles.card,

    ['@media(max-width: ' + BREAKPOINTS.lg + ')']: {
      gridColumn: 'span 2'
    },
  },
  boxLast: {
    gridColumn: 'span 2'
  },
  ...TRANSITIONS.slide
};

export default styles;