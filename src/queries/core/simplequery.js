/*jslint indent: 2, maxlen: 80, sloppy: true, nomen: true */
/*global Query: true, inherits: true, query_class_dict: true, _export: true,
  convertStringToRegExp: true */

/**
 * The SimpleQuery inherits from Query, and compares one metadata value
 *
 * @class SimpleQuery
 * @extends Query
 * @param  {Object} [spec={}] The specifications
 * @param  {String} [spec.operator="="] The compare method to use
 * @param  {String} spec.key The metadata key
 * @param  {String} spec.value The value of the metadata to compare
 */
function SimpleQuery(spec, key_schema) {
  Query.call(this);

  // XXX check for correctness of key_schema:
  // XXX 'keys' must exist
  // XXX 'types' is optional
  // XXX 'comparators' is optional
  // XXX anything else is invalid
  // XXX each key can have readFrom, castTo, defaultMatch
  //     (can be checked in the match function)
  this._key_schema = key_schema || {};

  /**
   * Operator to use to compare object values
   *
   * @attribute operator
   * @type String
   * @default "="
   * @optional
   */
  this.operator = spec.operator || "=";
  this._spec = spec.operator;

  /**
   * Key of the object which refers to the value to compare
   *
   * @attribute key
   * @type String
   */
  this.key = spec.key;

  /**
   * Value is used to do the comparison with the object value
   *
   * @attribute value
   * @type String
   */
  this.value = spec.value;

}
inherits(SimpleQuery, Query);


/**
 * #crossLink "Query/match:method"
 */
SimpleQuery.prototype.match = function (item, wildcard_character) {
  var object_value = null,
    defaultMatch = null,
    castTo = null,
    matchMethod = null,
    value = null,
    key = this.key;

  matchMethod = this[this.operator];

  if (this._key_schema.keys && this._key_schema.keys[key] !== undefined) {
    key = this._key_schema.keys[key];
  }

  if (typeof key === 'object') {
    object_value = item[key.readFrom];

    // defaultMatch overrides the default '=' operator
    defaultMatch = key.defaultMatch;

    // defaultMatch can be a string
    if (typeof defaultMatch === 'string') {
      // XXX raise error if defaultMatch not in comparators
      defaultMatch = this._key_schema.comparators[defaultMatch];
    }

    // defaultMatch overrides the default '=' operator
    matchMethod = (defaultMatch || matchMethod);

    // but an explicit operator: key overrides DefaultMatch
    if (this._spec && this._spec.operator) {
      matchMethod = this[this.operator];
    }

    value = this.value;
    castTo = key.castTo;
    if (castTo) {
      // castTo can be a string
      if (typeof castTo === 'string') {
        // XXX raise error if castTo not in types
        castTo = this._key_schema.types[castTo];
      }

      value = castTo(value);
      object_value = castTo(object_value);
    }
  } else {
    object_value = item[key];
    value = this.value;
  }
  return matchMethod(object_value, value, wildcard_character);
};

/**
 * #crossLink "Query/toString:method"
 */
SimpleQuery.prototype.toString = function () {
  return (this.key ? this.key + ": " : "") + (this.operator || "=") + ' "' +
    this.value + '"';
};

/**
 * #crossLink "Query/serialized:method"
 */
SimpleQuery.prototype.serialized = function () {
  return {
    "type": "simple",
    "operator": this.operator,
    "key": this.key,
    "value": this.value
  };
};

/**
 * Comparison operator, test if this query value matches the item value
 *
 * @method =
 * @param  {String} object_value The value to compare
 * @param  {String} comparison_value The comparison value
 * @param  {String} wildcard_character The wildcard_character
 * @return {Boolean} true if match, false otherwise
 */
SimpleQuery.prototype["="] = function (object_value, comparison_value,
                      wildcard_character) {
  var value, i;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  for (i = 0; i < object_value.length; i += 1) {
    value = object_value[i];
    if (typeof value === 'object' && value.hasOwnProperty('content')) {
      value = value.content;
    }
    if (comparison_value === undefined) {
      if (value === undefined) {
        return true;
      }
      return false;
    }
    if (value === undefined) {
      return false;
    }
    if (
      convertStringToRegExp(
        comparison_value.toString(),
        wildcard_character
      ).test(value.toString())
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Comparison operator, test if this query value does not match the item value
 *
 * @method !=
 * @param  {String} object_value The value to compare
 * @param  {String} comparison_value The comparison value
 * @param  {String} wildcard_character The wildcard_character
 * @return {Boolean} true if not match, false otherwise
 */
SimpleQuery.prototype["!="] = function (object_value, comparison_value,
                       wildcard_character) {
  var value, i;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  for (i = 0; i < object_value.length; i += 1) {
    value = object_value[i];
    if (typeof value === 'object' && value.hasOwnProperty('content')) {
      value = value.content;
    }
    if (comparison_value === undefined) {
      if (value === undefined) {
        return false;
      }
      return true;
    }
    if (value === undefined) {
      return true;
    }
    if (
      convertStringToRegExp(
        comparison_value.toString(),
        wildcard_character
      ).test(value.toString())
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Comparison operator, test if this query value is lower than the item value
 *
 * @method <
 * @param  {Number, String} object_value The value to compare
 * @param  {Number, String} comparison_value The comparison value
 * @return {Boolean} true if lower, false otherwise
 */
SimpleQuery.prototype["<"] = function (object_value, comparison_value) {
  var value;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  value = object_value[0];
  if (typeof value === 'object' && value.hasOwnProperty('content')) {
    value = value.content;
  }
  return value < comparison_value;
};

/**
 * Comparison operator, test if this query value is equal or lower than the
 * item value
 *
 * @method <=
 * @param  {Number, String} object_value The value to compare
 * @param  {Number, String} comparison_value The comparison value
 * @return {Boolean} true if equal or lower, false otherwise
 */
SimpleQuery.prototype["<="] = function (object_value, comparison_value) {
  var value;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  value = object_value[0];
  if (typeof value === 'object' && value.hasOwnProperty('content')) {
    value = value.content;
  }
  return value <= comparison_value;
};

/**
 * Comparison operator, test if this query value is greater than the item
 * value
 *
 * @method >
 * @param  {Number, String} object_value The value to compare
 * @param  {Number, String} comparison_value The comparison value
 * @return {Boolean} true if greater, false otherwise
 */
SimpleQuery.prototype[">"] = function (object_value, comparison_value) {
  var value;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  value = object_value[0];
  if (typeof value === 'object' && value.hasOwnProperty('content')) {
    value = value.content;
  }
  return value > comparison_value;
};

/**
 * Comparison operator, test if this query value is equal or greater than the
 * item value
 *
 * @method >=
 * @param  {Number, String} object_value The value to compare
 * @param  {Number, String} comparison_value The comparison value
 * @return {Boolean} true if equal or greater, false otherwise
 */
SimpleQuery.prototype[">="] = function (object_value, comparison_value) {
  var value;
  if (!Array.isArray(object_value)) {
    object_value = [object_value];
  }
  value = object_value[0];
  if (typeof value === 'object' && value.hasOwnProperty('content')) {
    value = value.content;
  }
  return value >= comparison_value;
};

query_class_dict.simple = SimpleQuery;

_export("SimpleQuery", SimpleQuery);
