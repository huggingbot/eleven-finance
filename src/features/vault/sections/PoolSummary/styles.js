import commonStyles, { BORDER, COLORS, FONT, MEDIA } from 'assets/jss/common';

const styles = {
  poolSummary: {
    position: 'relative',

    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',

    '&.discontinued': {
      opacity: 0.5
    },

    [MEDIA.mobile]: {
      flexWrap: 'wrap'
    }
  },

  poolInfo: {
    display: 'flex',
    flex: '0 0 auto',
    width: 310,

    [MEDIA.mobile]: {
      width: '100%',
      marginBottom: 10
    }
  },

  logo: {
    width: 48,
    height: 48,
    marginRight: 22,
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',

    '& img': {
      height: '100%',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      margin: 'auto'
    }
  },

  nameBlock: {
    width: 240,
  },

  name: {
    ...commonStyles.h4,
    margin: '5px 0',
  },

  description: {
    ...commonStyles.textSecondary,
    marginBottom: 0,
    lineHeight: '18px'
  },

  counter: {
    width: 150,
    textAlign: 'center',

    '& p': {
      margin: 0,

      '&:first-child': {
        ...commonStyles.h4,
        margin: '5px 0'
      },

      '&:last-child': {
        ...commonStyles.textSecondary,
        lineHeight: '18px'
      }
    },

    [MEDIA.mobile]: {
      width: '40%',
      paddinLeft: 10,
      textAlign: 'left',
      margin: '10px 0'
    }
  },

  discontinuedMessage: {
    position: 'relative',

    minHeight: 24,

    marginBottom: 20,
    paddingLeft: 120,

    color: COLORS.textSecondaryLight,
    fontSize: FONT.size.normal,
    fontWeight: 500,

    '& :first-child': {
      position: 'absolute',

      padding: '5px 14px',
      top: -5,
      left: -20,

      color: COLORS.textLight,
      fontSize: FONT.size.normal,

      background: COLORS.bgDark,
      borderRadius: [0, BORDER.radiusSmall, BORDER.radiusSmall, 0],

      fontSize: FONT.size.small,
      textTransform: 'uppercase',
      fontWeight: 500,
    }
  }
}

export default styles;