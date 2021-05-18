import commonStyles, { TRANSITIONS } from 'assets/jss/common';

const styles = {
  pool: {
    ...commonStyles.card,
    marginBottom: 14
  },

  ...TRANSITIONS.slide
};

export default styles;