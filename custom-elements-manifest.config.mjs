import { createAttributeFromField } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createAttribute.js';
import { getDefaultValuesFromConstructorVisitor } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createClass.js';
import { handleJsDoc } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/handlers.js';
import { extractMixinNodes, isMixin } from '@custom-elements-manifest/analyzer/src/utils/mixins.js';
import { handleName } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createMixin.js';
import { getWebTypesData } from 'custom-element-jet-brains-integration';
import path from 'node:path';
import fs from 'node:fs';

const TAG_PREFIX = 'el-';
const STORYBOOK_BASE_URL = 'https://webtides.github.io/element-library';

function isAlsoAttribute(ts, node) {
    let result = true;
    (node?.initializer || node)?.properties?.forEach((property) => {
        if (property.name.text === 'attribute' && property.initializer.kind === ts.SyntaxKind.FalseKeyword) {
            result = false;
        }
    });
    return result;
}

function reflects(ts, node) {
    let result = false;
    (node?.initializer || node)?.properties?.forEach((property) => {
        if (property.name.text === 'reflect' && property.initializer.kind === ts.SyntaxKind.TrueKeyword) {
            result = true;
        }
    });
    return result;
}

function getAttributeName(ts, node) {
    let result = false;
    (node?.initializer || node)?.properties?.forEach((property) => {
        if (property.name.text === 'attribute' && property.initializer.kind === ts.SyntaxKind.StringLiteral) {
            result = property.initializer.text;
        }
    });
    return result;
}

function getPropertiesObject(ts, node) {
    return node.body?.statements?.find(ts.isReturnStatement)?.expression;
}

function camelToDash(string) {
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * MEMBER-DENY-LIST — excludes element-js internal members from the manifest.
 */
function memberDenyListPlugin() {
    const MEMBER_DENY_LIST = ['properties', 'styles'];
    return {
        name: 'element-js - MEMBER-DENY-LIST',
        moduleLinkPhase({ moduleDoc }) {
            const classes = moduleDoc?.declarations?.filter((declaration) => declaration.kind === 'class');
            classes?.forEach((klass) => {
                if (!klass?.members) return;
                klass.members = klass.members.filter((member) => !MEMBER_DENY_LIST.includes(member.name));
            });
        },
    };
}

/**
 * METHOD-DENY-LIST — excludes element-js lifecycle/internal methods from the manifest.
 */
function methodDenyListPlugin() {
    const METHOD_DENY_LIST = [
        'connected',
        'beforeUpdate',
        'afterUpdate',
        'disconnected',
        'requestUpdate',
        'watch',
        'events',
        'template',
    ];
    return {
        name: 'element-js - METHOD-DENY-LIST',
        moduleLinkPhase({ moduleDoc }) {
            const classes = moduleDoc?.declarations?.filter((declaration) => declaration.kind === 'class');
            classes?.forEach((klass) => {
                if (!klass?.members) return;
                klass.members = klass.members.filter((member) => !METHOD_DENY_LIST.includes(member.name));
            });
        },
    };
}

/**
 * STATIC-PROPERTIES — handles `static get properties()` and `static properties`
 * (the element-js way of declaring reactive props), promoting them into
 * `members` + `attributes` on the class manifest entry.
 */
function staticPropertiesPlugin() {
    return {
        name: 'element-js - STATIC-PROPERTIES',
        analyzePhase({ ts, node, moduleDoc, context }) {
            switch (node.kind) {
                case ts.SyntaxKind.VariableStatement:
                case ts.SyntaxKind.FunctionDeclaration:
                    if (isMixin(node)) {
                        const { mixinFunction, mixinClass } = extractMixinNodes(node);
                        const { name } = handleName({}, mixinFunction);
                        handleStaticProperties(ts, mixinClass, moduleDoc, context, name);
                    }
                    break;
                case ts.SyntaxKind.ClassDeclaration:
                    handleStaticProperties(ts, node, moduleDoc, context);
                    break;
            }
        },
    };
}

function handleStaticProperties(ts, classNode, moduleDoc, context, mixinName = null) {
    const className = mixinName ?? classNode?.name?.getText();
    const currClass = moduleDoc?.declarations?.find((declaration) => declaration.name === className);
    if (!currClass) return;

    classNode?.members?.forEach((member) => {
        if (member.name?.text !== 'properties') return;
        const propertiesObject = getPropertiesObject(ts, member);

        propertiesObject?.properties?.forEach((property) => {
            let classMember = {
                kind: 'field',
                name: property?.name?.getText() || '',
                privacy: 'public',
            };
            classMember = handleJsDoc(classMember, property);

            const memberIndex = currClass?.members?.findIndex((field) => field.name === classMember.name);
            if (memberIndex >= 0) {
                classMember = { ...classMember, ...currClass.members[memberIndex] };
            }

            if (isAlsoAttribute(ts, property)) {
                const attribute = createAttributeFromField(classMember);

                // If an explicit attribute name is provided: @property({ attribute: 'my-foo' })
                const attributeName = getAttributeName(ts, property);
                if (attributeName) {
                    attribute.name = attributeName;
                    classMember.attribute = attributeName;
                } else {
                    const dashedName = camelToDash(classMember.name);
                    attribute.name = dashedName;
                    classMember.attribute = dashedName;
                }

                if (reflects(ts, property)) {
                    classMember.attribute = attribute.name;
                    classMember.reflects = true;
                }

                const attributeIndex = currClass?.attributes?.findIndex((attr) => attr.name === attribute.name);
                if (attributeIndex >= 0) {
                    currClass.attributes[attributeIndex] = {
                        ...currClass.attributes[attributeIndex],
                        ...attribute,
                    };
                } else {
                    currClass.attributes ??= [];
                    currClass.attributes.push(attribute);
                }
            }

            if (memberIndex >= 0) {
                currClass.members[memberIndex] = classMember;
            } else {
                currClass.members ??= [];
                currClass.members.push(classMember);
            }
        });
    });

    getDefaultValuesFromConstructorVisitor(classNode, currClass, context);
}

/**
 * INFER-TAG-NAMES — derives the custom element tag from the file basename.
 * `accordion-element/accordion-element.js` → `el-accordion-element`.
 */
function inferTagNames() {
    return {
        name: 'element-js - infer-tag-names',
        analyzePhase({ ts, node, moduleDoc }) {
            if (node.kind !== ts.SyntaxKind.ClassDeclaration) return;
            const className = node.name?.getText();
            if (!className) return;
            const classDoc = moduleDoc?.declarations?.find((declaration) => declaration.name === className);
            if (!classDoc) return;

            const tagNameWithoutPrefix = path.basename(moduleDoc.path, '.js');
            classDoc.tagNameWithoutPrefix = tagNameWithoutPrefix;
            classDoc.tagName = TAG_PREFIX + tagNameWithoutPrefix;
            classDoc.customElement = true;
        },
    };
}

/**
 * CUSTOM-WEB-TYPES — emits web-types.json (JetBrains/WebStorm autocomplete)
 * with source paths so "Go to Definition" jumps into the component file.
 */
function customWebTypesPlugin() {
    return {
        name: 'custom-web-types-generator',
        packageLinkPhase({ customElementsManifest }) {
            let webTypesData = getWebTypesData(customElementsManifest, {
                packageJson: false,
                referencesTemplate: (_, tag) => ({
                    name: 'Documentation',
                    url: `${STORYBOOK_BASE_URL}/?path=/docs/components-${tag.replace(TAG_PREFIX, '')}--docs`,
                }),
            });

            if (typeof webTypesData === 'string') {
                webTypesData = JSON.parse(webTypesData);
            }

            if (webTypesData?.contributions?.html?.elements) {
                webTypesData.contributions.html.elements.forEach((element) => {
                    const module = customElementsManifest.modules?.find((mod) =>
                        mod.declarations?.some((decl) => decl.tagName === element.name),
                    );
                    if (!module) return;

                    // web-types.json sits at project root, source paths are repo-relative
                    const relativePath = `./${module.path}`;
                    element.source = { module: relativePath, symbol: 'default' };
                    element.attributes?.forEach((attr) => {
                        attr.source = { module: relativePath, symbol: 'default' };
                    });
                });
            }

            const outPath = path.resolve('./web-types.json');
            fs.writeFileSync(outPath, JSON.stringify(webTypesData, null, 4) + '\n', 'utf-8');
            console.log('✅ Generated web-types.json');
        },
    };
}

export default {
    globs: ['src/components/**/*.js'],
    exclude: [
        '**/*.define.js',
        '**/*.style.js',
        '**/*.events.js',
        '**/*.stories.js',
        '**/*.test.unit.js',
        '**/*.test.feature.js',
        '**/glide/**',
    ],
    plugins: [
        methodDenyListPlugin(),
        memberDenyListPlugin(),
        staticPropertiesPlugin(),
        inferTagNames(),
        customWebTypesPlugin(),
    ],
};
