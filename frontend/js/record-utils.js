import _ from 'lodash';


export function fieldHasSubfield(code, value) {
  const querySubfield = { code, value };

  return function(field) {
    return field.subfields.some(subfield => _.isEqual(subfield, querySubfield));
  };
}

export function selectFieldsByValue(record, tag, subcode, value) {

  return record.fields
    .filter(field => field.tag === 'SID')
    .filter(field => {
      return field.subfields.some(subfield => subfield.code === subcode && subfield.value === value);
    });
}

export function selectValues(record, tag, subcode) {
  return _.chain(record.fields)
    .filter(field => tag.equals ? tag.equals(field.tag) : tag === field.tag)
    .flatMap(field => field.subfields)
    .filter(subfield => subcode.equals ? subcode.equals(subfield.code) : subcode === subfield.code)
    .map(subfield => subfield.value)
    .filter(value => value !== undefined)
    .value();
}

export function selectRecordId(record) {

  const field001List = record.fields.filter(field => field.tag === '001');

  if (field001List.length === 0) {
    throw new Error('Could not parse record id');
  } else {
    return field001List[0].value;
  }
}

export function selectFirstValue(field, subcode) {
  if (field.subfields) {
    return _.chain(field.subfields)
      .filter(subfield => subcode.equals ? subcode.equals(subfield.code) : subcode === subfield.code)
      .map(subfield => subfield.value)
      .head()
      .value();
  } else {
    return field.value;
  }
}
