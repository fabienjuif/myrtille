/* eslint-env jest */
const { getFromPath } = require('./index')

describe('util', () => {
  describe('getFromPath', () => {
    it('should get data from the given path', () => {
      const state = {
        data: {
          should: {
            be: 'retrieven',
          },
        },
        not: {
          this: 'one',
        },
      }

      expect(getFromPath(state, 'data.should.be')).toEqual('retrieven')
    })

    it('should get data from root if path is no given', () => {
      const state = {
        some: {
          data: 'here',
        },
        and: 'here',
      }

      expect(getFromPath(state, undefined)).toEqual(state)
    })
  })
})
