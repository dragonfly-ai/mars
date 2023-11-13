var Class = {}

Class.inherits = function (child, parent) {
  for (var attributeName in parent) { child[attributeName] = parent[attributeName]; }
}