module.exports = {
	'*.{js,json}': ['eslint --fix', 'prettier --write'],
	'*.css': ['stylelint --fix', 'prettier --write'],
	'*.{yaml,yml,md}': ['prettier --write'],
};
