import {expect} from 'chai';
import {readEnvironmentVariable} from '../utils';

describe('utils', () => {

  describe('readEnvironmentVariable', () => {

    it('should read the environment value if it is set', () => {

      process.env['TEST_VAR_SET'] = 'test_value';
      const defaultValue = 'DEFAULT_VALUE';
      const configValue = readEnvironmentVariable('TEST_VAR_SET', defaultValue);
      expect(configValue).to.eql('test_value');
      
    });

    it('should use default value if present', () => {

      const defaultValue = 'DEFAULT_VALUE';
      const configValue = readEnvironmentVariable('TEST_VAR', defaultValue);
      expect(configValue).to.eql(defaultValue);
      
    });

    it('should throw if environment variable is missing and no default value is given', () => {
      const testKey = 'TEST_VAR_THROW';
      expect(readEnvironmentVariable.bind(null, testKey)).to.throw(Error);      
    });

  });

});