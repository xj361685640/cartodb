var analysisDefinitionNodeIds = require('../../../../javascripts/cartodb3/value-objects/analysis-node-ids');

describe('value-objects/analysis-node-ids', () => {
  describe('.next', () => {
    it('should generate a new id for a given source id', () => {
      expect(analysisDefinitionNodeIds.next('a0')).toEqual('a1');
      expect(analysisDefinitionNodeIds.next('a123')).toEqual('a124');
      expect(analysisDefinitionNodeIds.next('z9000')).toEqual('z9001');
      expect(analysisDefinitionNodeIds.next('zab9')).toEqual('zab10');
    });

    it('should generate new id starting from 0 if no sequence number is given', () => {
      expect(analysisDefinitionNodeIds.next('a')).toEqual('a0');
      expect(analysisDefinitionNodeIds.next('x')).toEqual('x0');
    });

    it('should throw an error if given invalid source id', () => {
      expect(() => { analysisDefinitionNodeIds.next('A1'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next('1X2'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next(); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next(''); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next(123); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next('123'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next(true); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.next({}); }).toThrow();
    });
  });

  describe('.prev', () => {
    it('should not allow to go further than 0', () => {
      expect(analysisDefinitionNodeIds.prev('a0')).toEqual('a0');
    });

    it('should generate a new id for a given source id', () => {
      expect(analysisDefinitionNodeIds.prev('a123')).toEqual('a122');
      expect(analysisDefinitionNodeIds.prev('z9000')).toEqual('z8999');
      expect(analysisDefinitionNodeIds.prev('zab9')).toEqual('zab8');
    });

    it('should generate new id starting from 0 if no sequence number is given', () => {
      expect(analysisDefinitionNodeIds.prev('a')).toEqual('a0');
      expect(analysisDefinitionNodeIds.prev('x')).toEqual('x0');
    });

    it('should throw an error if given invalid source id', () => {
      expect(() => { analysisDefinitionNodeIds.prev('A1'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev('1X2'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev(); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev(''); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev(123); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev('123'); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev(true); }).toThrow();
      expect(() => { analysisDefinitionNodeIds.prev({}); }).toThrow();
    });
  });

  describe('.letter', () => {
    it('should return the letter from an id', () => {
      expect(analysisDefinitionNodeIds.letter('a0')).toEqual('a');
      expect(analysisDefinitionNodeIds.letter('a123')).toEqual('a');
      expect(analysisDefinitionNodeIds.letter('z9000')).toEqual('z');
      expect(analysisDefinitionNodeIds.letter('zab9')).toEqual('zab');
    });

    it('should return an empty string for invalid ids', () => {
      expect(analysisDefinitionNodeIds.letter('')).toEqual('');
      expect(analysisDefinitionNodeIds.letter(null)).toEqual('');
      expect(analysisDefinitionNodeIds.letter(undefined)).toEqual('');
      expect(analysisDefinitionNodeIds.letter(false)).toEqual('');
      expect(analysisDefinitionNodeIds.letter({})).toEqual('');
      expect(analysisDefinitionNodeIds.letter('"other_username".secondary_table_that_might_look_like_this')).toEqual('');
    });
  });

  describe('.changeLetter', () => {
    it('should return a new id with changed letter', () => {
      expect(analysisDefinitionNodeIds.changeLetter('a0', 'b')).toEqual('b0');
      expect(analysisDefinitionNodeIds.changeLetter('a1', 'c')).toEqual('c1');
      expect(analysisDefinitionNodeIds.changeLetter('cd101', 'd')).toEqual('d101');
    });
  });
});
