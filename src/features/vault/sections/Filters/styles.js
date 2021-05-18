import commonStyles, { BORDER, COLORS, FONT, MEDIA } from 'assets/jss/common';

const styles = {
  filters: {
    display: 'flex',
    justifyContent: 'space-between',

    padding: '25px 0 5px',

    '& > *': {
      display: 'flex',
      alignItems: 'center'
    },

    [MEDIA.mobile]: {
      flexDirection: 'column-reverse',
      paddingTop: 10,

      '& > *:first-child': {
        flexDirection: 'column',
        marginTop: 10
      }
    }
  },

  checkboxes: {
    marginLeft: 42,

    [MEDIA.mobile]: {
      width: '100%',
      margin: '10px 0'
    }
  },

  checkbox: {
    ...commonStyles.checkbox,

    marginRight: 16,

    [MEDIA.mobile]: {
      display: 'block',
      margin: '7px 0'
    }
  },

  search: {
    position: 'relative',

    width: 40,
    height: 40,
    marginRight: 10,

    flexShrink: 0,

    background: COLORS.bgSurface,
    borderRadius: BORDER.radius,

    cursor: 'pointer',

    transition: 'width .15s ease-in-out',

    '& svg': {
      position: 'absolute',

      width: 20,
      height: 20,
      top: 10,
      left: 10,

      color: COLORS.textSecondaryDark,
    },

    '& input': {
      display: 'none',

      width: 146,
      height: '100%',

      marginLeft: 40,

      color: COLORS.textSecondaryLight,
      fontSize: FONT.size.normal,

      background: 'transparent',
      border: 'none',
    },

    '&.open': {
      width: 200,
      border: '1px solid ' + COLORS.border,
    },

    '&.open input': {
      display: 'block'
    },

    [MEDIA.mobile]: {
      width: '50%',

      '&.open': {
        width: '50%'
      },

      '&.open input': {
        width: 'calc(100% - 54px)'
      }
    }
  },

  categoriesSelect: {
    width: 200,

    [MEDIA.mobile]: {
      width: '100%',
    }
  },

  sortSelect: {
    [MEDIA.mobile]: {
      width: 'calc(50% - 10px)',
    }
  }
}

export default styles;