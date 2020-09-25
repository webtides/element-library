function dashToCamel(string) {
	if (string.indexOf('-') === -1) return string;

	return string.replace(/-[a-z]/g, (matches) => matches[1].toUpperCase());
}

function camelToDash(string) {
	return string.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	helpers: {
		dashToCamel: (string) => dashToCamel(string),
		camelToDash: (string) => camelToDash(string),
		capitalize: (string) => capitalize(string),
	},
	templates: '.templates',
};
