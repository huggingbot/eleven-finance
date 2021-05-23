import commonStyles, { COLORS, BREAKPOINTS } from 'assets/jss/common';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    gap: '28px',
  },
  box: {
    ...commonStyles.card,
    display: 'flex',
    flexDirection: 'column',

    ['@media(max-width: ' + BREAKPOINTS.lg + ')']: {
      gridColumn: 'span 2'
    },
  },
  boxLast: {
    gridColumn: 'span 2'
  },
  divider: {
    height: 1,
    background: COLORS.primary,
    margin: '20px 0',

    '&.small': {
      margin: '12px 0'
    }
  },
  referralLinkTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  copyButton: {
    height: '24px',
    border: 'none',
    background: 'none',
    color: 'inherit',
    '&:hover': {
      cursor: 'pointer',
    }
  },
  referralLinkBody: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};



export default styles;