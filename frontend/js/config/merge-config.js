module.exports = {
  'fields': {

    '00[67]': {
      'action': 'controlfield'
    },

    '08.': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9'],
        'mustBeIdentical': true
      }
    },

    '015': {
      'action': 'copy',
      'options': {
        'compareWithout': [
          'z',
          'q'
        ]
      }
    },


    '02[047]': {
      'action': 'copy',
      'options': {
        'compareWithout': [
          'z',
          'c',
          'q'
        ],
        'combine': ['c']
      }
    },


    '028': {
      'action': 'copy',
      'options': {
        'compareWithout': [
          'q'
        ]
      }
    },

    '022': {
      'action': 'copy',
      'options': {
        'compareWithoutIndicators': true
      }
    },

    '0[12345679].': {
      'action': 'copy'
    },

    '130': {
      'action': 'copy',
      'options': {
        'mustBeIdentical': true,
        'transformOnInequality': {
          'tag': '930',
          'add': {
            '5': 'ANDER'
          }
        }
      }
    },

    '240': {
      'action': 'copy',
      'options': {
        'mustBeIdentical': true,
        'transformOnInequality': {
          'tag': '940',
          'add': {
            '5': 'ANDER'
          }
        }
      }
    },

    '210': {
      'action': 'copy'
    },

    '222': {
      'action': 'copy'
    },

    '24(^5)': {
      'action': 'copy'
    },

    '3..': {
      'action': 'selectBetter',
      'options': {
        'onlyIfMissing': true,
        'skipOnMultiple': true
      }
    },

    '4..': {
      'action': 'copy'
    },

    '5..': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9'],
        'mustBeIdentical': true
      }
    },

    '6..': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9'],
        'mustBeIdentical': true
      }
    },

    '773': {
      'action': 'selectBetter',
      'options': {
        'onlyIfMissing': true,
        'skipOnMultiple': true,
        'pick': {
          'subfields': ['g', 'q'],
          'missingOnly': true
        }
      }
    },

    '7[01]0': {
      'action': 'copy',
      'options': {
        'compareWithout': [
          '9',
          '4',
          'e'
        ]
      }
    },

    '711': {
      'action': 'copy',
      'options': {
        'compareWithout': [
          '9',
          '4',
          'j'
        ]
      }
    },

    '7..': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9']
      }
    },

    '8..': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9']
      }
    },

    '9..': {
      'action': 'copy',
      'options': {
        'compareWithout': ['9']
      }
    },

    'SID': {
      'action': 'copy'
    },

    'LOW': {
      'action': 'copy'
    },

    'HLI': {
      'action': 'copy'
    }
  }
};