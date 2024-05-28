const html = String.raw;
import readme from './tab-group.readme.md?raw';
import { define as defineGroup } from './tab-group.js';
import { define as defineLink } from '../tab-link/tab-link.js';
import { define as definePanel } from '../tab-panel/tab-panel.js';
defineGroup();
defineLink();
definePanel();

export default {
    title: 'Components/TabGroup',
    component: 'el-tab-group',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const TabGroup = {
    name: 'TabGroup',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-tab-group selected="general" link-selector="tab-link" panel-selector="tab-panel">
            <el-tab-link for="general" active>General</el-tab-link>
            <el-tab-link for="custom">Custom</el-tab-link>
            <el-tab-link for="advanced">Advanced</el-tab-link>
            <el-tab-link for="disabled" disabled>Disabled</el-tab-link>

            <el-tab-panel name="general" active>This is the general tab panel.</el-tab-panel>
            <el-tab-panel name="custom">This is the custom tab panel.</el-tab-panel>
            <el-tab-panel name="advanced">This is the advanced tab panel.</el-tab-panel>
            <el-tab-panel name="disabled">This is a disabled tab panel.</el-tab-panel>
        </el-tab-group>
    `,
};

export const CustomSelector = {
    name: 'CustomSelector',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-tab-group selected="general" panel-selector="[role=tabpanel]">
            <el-tab-link for="general">General</el-tab-link>
            <el-tab-link for="custom">Custom</el-tab-link>
            <el-tab-link for="advanced">Advanced</el-tab-link>
            <el-tab-link for="disabled" disabled>Disabled</el-tab-link>

            <div role="tabpanel" name="general">This is the general tab panel.</div>
            <div role="tabpanel" name="custom">This is the custom tab panel.</div>
            <div role="tabpanel" name="advanced">This is the advanced tab panel.</div>
            <div role="tabpanel" name="disabled">This is a disabled tab panel.</div>
        </el-tab-group>
    `,
};
