const packages = ['elements', 'forms', 'interactions'];

function dashToCamel(string) {
    if (string.indexOf('-') === -1) return string;

    return string.replace(/-[a-z]/g, (matches) => matches[1].toUpperCase());
}

function camelToDash(string) {
    // make the string start with a lowercase letter first - otherwise it would add a dash at the beginning
    const camelString = string.charAt(0).toLowerCase() + string.slice(1);
    return camelString.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function makeElementName(string) {
    const name = camelToDash(string);
    return name.includes('-') ? name : `${name}-element`;
}

function makeClassName(string) {
    const elementName = makeElementName(string);
    return capitalize(dashToCamel(elementName));
}

module.exports = {
    // params: ({ args }) => {
    //     return { packageName: packages.includes(args.package) ? args.package : 'elements' }
    // },
    prompt: ({ prompter, args }) => {
        if (args.name && packages.includes(args.package)) {
            return {
                packageName: args.package,
                elementName: makeElementName(args.name),
                className: makeClassName(args.name),
            };
        }

        if (args.name && !packages.includes(args.package)) {
            return prompter
                .prompt({
                    type: 'select',
                    name: 'package',
                    message: 'What package does the element belong to?',
                    choices: packages,
                })
                .then((args) => {
                    return {
                        packageName: args.package,
                        elementName: makeElementName(args.name),
                        className: makeClassName(args.name),
                    };
                });
        }

        if (!args.name && packages.includes(args.package)) {
            return prompter
                .prompt({
                    type: 'input',
                    name: 'name',
                    message: 'What is the name of the element?',
                })
                .then((result) => {
                    return {
                        packageName: args.package,
                        elementName: makeElementName(result.name),
                        className: makeClassName(result.name),
                    };
                });
        }

        if (!args.name && !packages.includes(args.package)) {
            return prompter
                .prompt({
                    type: 'input',
                    name: 'name',
                    message: 'What is the name of the element?',
                })
                .then((inputResult) => {
                    return prompter
                        .prompt({
                            type: 'select',
                            name: 'package',
                            message: 'What package does the element belong to?',
                            choices: packages,
                        })
                        .then((selectResult) => {
                            return {
                                packageName: selectResult.package,
                                elementName: makeElementName(inputResult.name),
                                className: makeClassName(inputResult.name),
                            };
                        });
                });
        }
    },
};
