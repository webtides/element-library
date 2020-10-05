module.exports = {
	'*.{js}': ['eslint --fix', 'prettier --write'],
	'*.css': ['stylelint --fix', 'prettier --write'],
	'*.{yaml,yml,md}': ['prettier --write'],
};
