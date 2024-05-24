import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define as defineGroup } from '@webtides/tab-group';
import { define as defineLink } from '@webtides/tab-link';
import { define as definePanel } from '@webtides/tab-panel';
defineGroup();
defineLink();
definePanel();

export default {
    title: 'Interactions/TabGroup',
    component: 'tab-group',
};

export const defaultVariant = () => html`
    <tab-group selected="general" link-selector="tab-link" panel-selector="tab-panel">
        <tab-link for="general" active>General</tab-link>
        <tab-link for="custom">Custom</tab-link>
        <tab-link for="advanced">Advanced</tab-link>
        <tab-link for="disabled" disabled>Disabled</tab-link>

        <tab-panel name="general" active>This is the general tab panel.</tab-panel>
        <tab-panel name="custom">This is the custom tab panel.</tab-panel>
        <tab-panel name="advanced">This is the advanced tab panel.</tab-panel>
        <tab-panel name="disabled">This is a disabled tab panel.</tab-panel>
    </tab-group>
`;

export const customSelector = () => html`
    <tab-group selected="general" panel-selector="[role=tabpanel]">
        <tab-link for="general">General</tab-link>
        <tab-link for="custom">Custom</tab-link>
        <tab-link for="advanced">Advanced</tab-link>
        <tab-link for="disabled" disabled>Disabled</tab-link>

        <div role="tabpanel" name="general">This is the general tab panel.</div>
        <div role="tabpanel" name="custom">This is the custom tab panel.</div>
        <div role="tabpanel" name="advanced">This is the advanced tab panel.</div>
        <div role="tabpanel" name="disabled">This is a disabled tab panel.</div>
    </tab-group>
`;
